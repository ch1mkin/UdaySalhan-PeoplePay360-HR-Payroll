import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { AppRole } from "@/types/hr";
import { canAccessModule, type AppModule } from "@/lib/auth/permissions";

export type AccessContext = {
  role: AppRole;
  fullName: string;
  companyName: string;
  companyId: string | null;
  email: string;
  isPreview: boolean;
};

const LOCAL_SHELL: AccessContext = {
  role: "company_admin",
  fullName: "",
  companyName: "PeoplePay360",
  companyId: null,
  email: "",
  isPreview: true,
};

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
    .select("role, full_name, company_id")
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
    role: (profile?.role as AppRole | undefined) ?? "employee",
    fullName: profile?.full_name ?? "",
    companyName,
    companyId: profile?.company_id ?? null,
    email: user.email ?? "",
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
