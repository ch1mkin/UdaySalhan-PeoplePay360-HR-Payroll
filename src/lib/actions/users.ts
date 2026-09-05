"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccessContext } from "@/lib/auth/access";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/hr";
import { roleLabel } from "@/lib/auth/permissions";
import { sendMail } from "@/lib/email/smtp";
import { welcomeInviteEmail } from "@/lib/email/welcome";
import { getAppUrl, isSmtpConfigured } from "@/lib/env";

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

async function originUrl() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "https";
  if (host) {
    return `${proto}://${host}`;
  }
  return getAppUrl();
}

export async function createAppUser(formData: FormData) {
  const access = await getAccessContext();
  if (!canManageUsers(access.role)) {
    return { error: "Only an admin can create users." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "employee") as AppRole;

  if (!email) {
    return { error: "Email is required." };
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
    return { error: "Add SUPABASE_SERVICE_ROLE_KEY to create logins." };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: `${crypto.randomUUID()}A1`,
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

  if (!isSmtpConfigured()) {
    revalidatePath("/app/settings");
    return {
      error: "User created, but email is not configured. Add Hostinger SMTP settings and resend the invite.",
    };
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  if (linkError || !linkData.properties?.hashed_token) {
    revalidatePath("/app/settings");
    return { error: linkError?.message ?? "User created, but the invite link could not be generated." };
  }

  const setupUrl = `${await originUrl()}/auth/set-password?token_hash=${encodeURIComponent(linkData.properties.hashed_token)}&type=recovery`;

  try {
    await sendMail({
      to: email,
      ...welcomeInviteEmail({
        fullName: fullName || email,
        role,
        setupUrl,
        companyName: access.companyName,
      }),
    });
  } catch (mailError) {
    revalidatePath("/app/settings");
    return {
      error:
        mailError instanceof Error
          ? `User created, but the welcome email failed: ${mailError.message}`
          : "User created, but the welcome email failed.",
    };
  }

  revalidatePath("/app/settings");
  return { error: null };
}

export async function updateAppUser(formData: FormData) {
  const access = await getAccessContext();
  if (!canManageUsers(access.role)) {
    return { error: "Only an admin can edit users." };
  }

  const id = String(formData.get("id") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "employee") as AppRole;

  if (!id) {
    return { error: "User is missing." };
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
    return { error: "Add SUPABASE_SERVICE_ROLE_KEY to edit users." };
  }

  const companyId =
    access.role === "admin"
      ? String(formData.get("company_id") ?? "") || null
      : access.companyId;

  const { error } = await admin
    .from("profiles")
    .update({
      role,
      full_name: fullName || null,
      company_id: companyId,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
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

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, company_id")
    .order("full_name");

  return (data ?? []).map((row) => ({
    ...row,
    roleLabel: roleLabel((row.role as AppRole) ?? "employee"),
  }));
}
