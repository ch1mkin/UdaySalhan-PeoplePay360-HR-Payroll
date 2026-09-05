"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccessContext } from "@/lib/auth/access";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/hr";
import { roleLabel } from "@/lib/auth/permissions";

const ASSIGNABLE: AppRole[] = [
  "employee",
  "hr_manager",
  "hr_payroll_user",
  "hr_payroll_manager",
  "company_admin",
  "admin",
];

function canManageUsers(role: AppRole) {
  return role === "admin" || role === "company_admin";
}

export async function createAppUser(formData: FormData) {
  const access = await getAccessContext();
  if (!canManageUsers(access.role)) {
    return { error: "Only an admin can create users." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "employee") as AppRole;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!ASSIGNABLE.includes(role)) {
    return { error: "Invalid role." };
  }
  if (access.role !== "admin" && role === "admin") {
    return { error: "Only a platform admin can grant platform admin." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Add SUPABASE_SERVICE_ROLE_KEY to .env.local to create logins." };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName || email },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Could not create the login." };
  }

  const companyId =
    access.role === "admin"
      ? String(formData.get("company_id") ?? access.companyId ?? "") || null
      : access.companyId;

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      role,
      full_name: fullName || email,
      company_id: companyId,
    })
    .eq("id", data.user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/app/settings");
  return { error: null };
}

export async function listManagedUsers() {
  const access = await getAccessContext();
  if (!canManageUsers(access.role)) {
    return [];
  }

  const supabase = await createClient();
  if (!supabase) {
    return [];
  }

  const query = supabase
    .from("profiles")
    .select("id, full_name, role, company_id")
    .order("full_name");

  const { data } = await query;
  return (data ?? []).map((row) => ({
    ...row,
    roleLabel: roleLabel((row.role as AppRole) ?? "employee"),
  }));
}
