"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccessContext, isPlatformAdmin } from "@/lib/auth/access";
import type { AppRole, UserAccountStatus } from "@/types/hr";
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

const STATUSES: UserAccountStatus[] = ["invited", "pending_approval", "active", "suspended"];

export type DirectoryUser = {
  id: string;
  username: string | null;
  full_name: string | null;
  work_email: string | null;
  role: AppRole;
  account_status: UserAccountStatus;
  company_id: string | null;
  roleLabel: string;
  approved_at: string | null;
  approved_by: string | null;
  approvedByName: string | null;
  details_submitted_at: string | null;
  updated_at: string | null;
};

function parseRole(value: string) {
  return ASSIGNABLE.includes(value as AppRole) ? (value as AppRole) : null;
}

function parseStatus(value: string) {
  return STATUSES.includes(value as UserAccountStatus) ? (value as UserAccountStatus) : null;
}

async function generateSetupUrl(admin: ReturnType<typeof createAdminClient>, email: string) {
  const appUrl = getAppUrl();
  const redirectTo = `${appUrl}/auth/set-password`;
  const attempts: Array<{
    type: "recovery" | "magiclink";
    options?: { redirectTo: string };
  }> = [
    { type: "recovery", options: { redirectTo } },
    { type: "recovery" },
    { type: "magiclink", options: { redirectTo } },
  ];

  let lastError: string | null = null;
  for (const attempt of attempts) {
    const { data, error } = await admin.auth.admin.generateLink({
      type: attempt.type,
      email,
      options: attempt.options,
    });
    if (error) {
      lastError = error.message;
      continue;
    }

    const hashedToken = data.properties?.hashed_token;
    if (hashedToken) {
      const otpType = attempt.type === "magiclink" ? "magiclink" : "recovery";
      return `${redirectTo}?token_hash=${encodeURIComponent(hashedToken)}&type=${otpType}`;
    }

    const actionLink = data.properties?.action_link;
    if (actionLink) {
      try {
        const url = new URL(actionLink);
        url.searchParams.set("redirect_to", redirectTo);
        return url.toString();
      } catch {
        return actionLink;
      }
    }
  }

  throw new Error(lastError ?? "The invite link could not be generated.");
}

async function sendInvite(email: string, fullName: string, role: AppRole, companyName: string) {
  if (!isSmtpConfigured()) {
    return "Email is not configured. Add Hostinger SMTP settings on Vercel and try again.";
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return "Add SUPABASE_SERVICE_ROLE_KEY to send invites.";
  }

  let setupUrl: string;
  try {
    setupUrl = await generateSetupUrl(admin, email);
  } catch (error) {
    return error instanceof Error ? error.message : "The invite link could not be generated.";
  }

  try {
    await sendMail({
      to: email,
      ...welcomeInviteEmail({
        fullName: fullName || email,
        role,
        setupUrl,
        companyName,
      }),
    });
  } catch (mailError) {
    return mailError instanceof Error ? mailError.message : "The invite email could not be sent.";
  }

  return null;
}

export async function listDirectoryUsers() {
  const access = await getAccessContext();
  if (!isPlatformAdmin(access.role)) {
    return [];
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return [];
  }

  const full = await admin
    .from("profiles")
    .select(
      "id, username, full_name, work_email, role, account_status, company_id, approved_at, approved_by, details_submitted_at, updated_at",
    )
    .order("username");
  const loaded = full.error
    ? await admin
        .from("profiles")
        .select("id, username, full_name, work_email, role, account_status, company_id")
        .order("username")
    : full;
  const data = (loaded.data ?? []) as Array<{
    id: string;
    username: string | null;
    full_name: string | null;
    work_email: string | null;
    role: string | null;
    account_status: string | null;
    company_id: string | null;
    approved_at?: string | null;
    approved_by?: string | null;
    details_submitted_at?: string | null;
    updated_at?: string | null;
  }>;

  const approverIds = [...new Set(data.map((row) => row.approved_by).filter(Boolean))] as string[];
  const names = new Map<string, string>();
  if (approverIds.length > 0) {
    const { data: approvers } = await admin
      .from("profiles")
      .select("id, full_name, username")
      .in("id", approverIds);
    for (const row of approvers ?? []) {
      names.set(row.id, row.full_name || row.username || "Admin");
    }
  }

  return data.map((row) => ({
    ...row,
    role: (row.role as AppRole) ?? "employee",
    account_status: (row.account_status as UserAccountStatus) ?? "invited",
    roleLabel: roleLabel((row.role as AppRole) ?? "employee"),
    approved_at: row.approved_at ?? null,
    approved_by: row.approved_by ?? null,
    approvedByName: row.approved_by ? names.get(row.approved_by) ?? null : null,
    details_submitted_at: row.details_submitted_at ?? null,
    updated_at: row.updated_at ?? null,
  })) satisfies DirectoryUser[];
}

export async function getDirectoryUser(userId: string) {
  const users = await listDirectoryUsers();
  return users.find((user) => user.id === userId) ?? null;
}

export async function createAppUser(formData: FormData) {
  const access = await getAccessContext();
  if (!isPlatformAdmin(access.role)) {
    return { error: "Only a platform admin can create users and assign roles." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const username = String(formData.get("username") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = parseRole(String(formData.get("role") ?? "employee"));
  const status = parseStatus(String(formData.get("account_status") ?? "invited")) ?? "invited";

  if (!email) {
    return { error: "Work email is required." };
  }
  if (!username) {
    return { error: "Username is required." };
  }
  if (!role) {
    return { error: "Invalid role." };
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
    user_metadata: {
      full_name: fullName || username,
      username,
      auto_activate: status === "active",
    },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Could not create the login." };
  }

  if (!access.companyId) {
    return { error: "Create a company in Settings first. New users join your company automatically." };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      role,
      username,
      full_name: fullName || null,
      work_email: email,
      company_id: access.companyId,
      account_status: status === "active" ? "invited" : status,
    })
    .eq("id", data.user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  const mailError = await sendInvite(email, fullName || username, role, access.companyName);
  revalidatePath("/app/users");
  revalidatePath("/app/users/approvals");
  if (mailError) {
    return { error: `User saved, but the invite email failed: ${mailError}` };
  }
  return { error: null };
}

export async function updateAppUser(formData: FormData) {
  const access = await getAccessContext();
  if (!isPlatformAdmin(access.role)) {
    return { error: "Only a platform admin can edit users and assign roles." };
  }

  const id = String(formData.get("id") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = parseRole(String(formData.get("role") ?? "employee"));
  const status = parseStatus(String(formData.get("account_status") ?? "invited"));

  if (!id) {
    return { error: "User is missing." };
  }
  if (id === access.userId && role && role !== access.role) {
    return { error: "You cannot change your own role." };
  }
  if (!username) {
    return { error: "Username is required." };
  }
  if (!role || !status) {
    return { error: "Invalid role or status." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Add SUPABASE_SERVICE_ROLE_KEY to edit users." };
  }

  const patch: Record<string, unknown> = {
    username,
    full_name: fullName || null,
    account_status: status,
  };
  if (access.companyId) {
    patch.company_id = access.companyId;
  }
  if (id !== access.userId) {
    patch.role = role;
  }

  const { error } = await admin.from("profiles").update(patch).eq("id", id);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/users");
  revalidatePath("/app/users/approvals");
  return { error: null };
}

export async function reinviteAppUser(userId: string) {
  const access = await getAccessContext();
  if (!isPlatformAdmin(access.role)) {
    return { error: "Only a platform admin can resend invites." };
  }
  if (userId === access.userId) {
    return { error: "You cannot reinvite your own account." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Add SUPABASE_SERVICE_ROLE_KEY to send invites." };
  }

  const { data: profile, error } = await admin
    .from("profiles")
    .select("username, full_name, work_email, role, account_status")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile) {
    return { error: error?.message ?? "User was not found." };
  }

  const email = String(profile.work_email ?? "").trim().toLowerCase();
  if (!email) {
    return { error: "This user has no work email to invite." };
  }

  const role = parseRole(String(profile.role ?? "employee")) ?? "employee";
  const status = parseStatus(String(profile.account_status ?? "invited")) ?? "invited";

  if (status !== "active") {
    const { error: statusError } = await admin
      .from("profiles")
      .update({ account_status: "invited" })
      .eq("id", userId);
    if (statusError) {
      return { error: statusError.message };
    }
  }

  const mailError = await sendInvite(
    email,
    profile.full_name || profile.username || email,
    role,
    access.companyName,
  );

  revalidatePath("/app/users");
  revalidatePath("/app/users/approvals");
  if (mailError) {
    return { error: mailError };
  }
  return { error: null, email };
}

export async function approveUser(userId: string) {
  const access = await getAccessContext();
  if (!isPlatformAdmin(access.role)) {
    return { error: "Only a platform admin can approve users." };
  }
  if (userId === access.userId) {
    return { error: "You cannot approve your own account." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Add SUPABASE_SERVICE_ROLE_KEY to approve users." };
  }

  const { error } = await admin
    .from("profiles")
    .update({
      account_status: "active",
      approved_at: new Date().toISOString(),
      approved_by: access.userId,
    })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/users");
  revalidatePath("/app/users/approvals");
  return { error: null };
}

export async function declineUser(userId: string) {
  const access = await getAccessContext();
  if (!isPlatformAdmin(access.role)) {
    return { error: "Only a platform admin can decline users." };
  }
  if (userId === access.userId) {
    return { error: "You cannot decline your own account." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Add SUPABASE_SERVICE_ROLE_KEY to decline users." };
  }

  const { error } = await admin
    .from("profiles")
    .update({ account_status: "suspended" })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/users");
  revalidatePath("/app/users/approvals");
  return { error: null };
}

export async function submitOnboarding(formData: FormData) {
  const access = await getAccessContext();
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (fullName.length < 2) {
    return { error: "Enter your employee name." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Could not save your details." };
  }

  const { data: authUser } = await admin.auth.admin.getUserById(access.userId);
  const autoActivate = authUser.user?.user_metadata?.auto_activate === true;
  let nextStatus: UserAccountStatus = "pending_approval";
  if (access.accountStatus === "suspended") {
    nextStatus = "suspended";
  } else if (access.accountStatus === "active" || autoActivate) {
    nextStatus = "active";
  }

  const { error } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      details_submitted_at: new Date().toISOString(),
      account_status: nextStatus,
    })
    .eq("id", access.userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/auth/complete-profile");
  revalidatePath("/app/users/approvals");
  return { error: null, status: nextStatus };
}

export async function listManagedUsers() {
  return listDirectoryUsers();
}
