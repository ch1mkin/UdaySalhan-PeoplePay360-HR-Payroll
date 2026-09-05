import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { AppRole, UserAccountStatus } from "@/types/hr";
import { canAccessModule, parseAppRole, type AppModule } from "@/lib/auth/permissions";

export type AccessContext = {
  userId: string;
  role: AppRole;
  fullName: string;
  username: string;
  companyName: string;
  companyId: string | null;
  email: string;
  accountStatus: UserAccountStatus;
  isPreview: boolean;
};

const LOCAL_SHELL: AccessContext = {
  userId: "preview",
  role: "admin",
  fullName: "",
  username: "",
  companyName: "PeoplePay360",
  companyId: null,
  email: "",
  accountStatus: "active",
  isPreview: true,
};

type ProfileRow = {
  role: string | null;
  full_name: string | null;
  company_id: string | null;
  username?: string | null;
  account_status?: string | null;
  work_email?: string | null;
};

export function isPlatformAdmin(role: AppRole) {
  return role === "admin";
}

function parseStatus(value: unknown): UserAccountStatus {
  switch (value) {
    case "invited":
    case "pending_approval":
    case "active":
    case "suspended":
      return value;
    default:
      return "active";
  }
}

async function getAdminClient() {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    return createAdminClient();
  } catch {
    return null;
  }
}

async function fetchProfile(client: SupabaseClient, userId: string): Promise<ProfileRow | null> {
  const full = await client
    .from("profiles")
    .select("role, full_name, company_id, username, account_status, work_email")
    .eq("id", userId)
    .maybeSingle();
  if (!full.error && full.data) {
    return full.data;
  }

  const core = await client
    .from("profiles")
    .select("role, full_name, company_id")
    .eq("id", userId)
    .maybeSingle();
  if (!core.error && core.data) {
    return core.data;
  }

  return null;
}

async function persistPlatformAdmin(userId: string, email: string) {
  const admin = await getAdminClient();
  if (!admin) {
    return;
  }

  const withStatus = await admin
    .from("profiles")
    .update({
      role: "admin",
      account_status: "active",
      work_email: email || null,
    })
    .eq("id", userId);
  if (withStatus.error) {
    await admin.from("profiles").update({ role: "admin" }).eq("id", userId);
  }

  await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role: "admin" },
  });
}

export async function getAccessContext(): Promise<AccessContext> {
  if (!isSupabaseConfigured()) {
    return LOCAL_SHELL;
  }

  const supabase = await createClient();
  if (!supabase) {
    return LOCAL_SHELL;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const admin = await getAdminClient();
  const profile =
    (admin ? await fetchProfile(admin, user.id) : null) ?? (await fetchProfile(supabase, user.id));

  const metadataRole = parseAppRole(user.app_metadata?.role);
  let role = parseAppRole(profile?.role) ?? metadataRole ?? "employee";

  if (role !== "admin") {
    let shouldPromote = metadataRole === "admin";
    if (!shouldPromote && admin) {
      const { count, error } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      shouldPromote = !error && (count ?? 0) === 0;
    }
    if (shouldPromote) {
      await persistPlatformAdmin(user.id, user.email ?? profile?.work_email ?? "");
      role = "admin";
    }
  }

  let companyName = "PeoplePay360";
  if (profile?.company_id) {
    const companyClient = admin ?? supabase;
    const { data: company } = await companyClient
      .from("companies")
      .select("name")
      .eq("id", profile.company_id)
      .maybeSingle();
    if (company?.name) {
      companyName = company.name;
    }
  }

  return {
    userId: user.id,
    role,
    fullName: profile?.full_name ?? "",
    username: profile?.username ?? "",
    companyName,
    companyId: profile?.company_id ?? null,
    email: profile?.work_email ?? user.email ?? "",
    accountStatus: role === "admin" ? "active" : parseStatus(profile?.account_status),
    isPreview: false,
  };
}

export async function requireModule(module: AppModule) {
  const access = await getAccessContext();
  if (!canAccessModule(access.role, module)) {
    redirect("/app");
  }
  return access;
}

export function accountGatePath(access: AccessContext) {
  if (access.isPreview || isPlatformAdmin(access.role) || access.accountStatus === "active") {
    return null;
  }
  if (access.accountStatus === "invited") {
    return "/auth/complete-profile";
  }
  return "/auth/waiting";
}
