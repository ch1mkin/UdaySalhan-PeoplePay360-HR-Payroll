import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { AppRole, UserAccountStatus } from "@/types/hr";
import { canAccessModule, type AppModule } from "@/lib/auth/permissions";

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

export function isPlatformAdmin(role: AppRole) {
  return role === "admin";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, company_id, username, account_status, work_email")
    .eq("id", user.id)
    .maybeSingle();

  let companyName = "PeoplePay360";
  if (profile?.company_id) {
    const { data: company } = await supabase
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
    role: (profile?.role as AppRole | undefined) ?? "employee",
    fullName: profile?.full_name ?? "",
    username: profile?.username ?? "",
    companyName,
    companyId: profile?.company_id ?? null,
    email: profile?.work_email ?? user.email ?? "",
    accountStatus: (profile?.account_status as UserAccountStatus | undefined) ?? "active",
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
