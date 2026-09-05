"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const registerSchema = z
  .object({
    full_name: z.string().trim().min(2, "Enter your full name."),
    email: z.string().trim().email("Enter a valid work email.").toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Za-z]/, "Password must include a letter.")
      .regex(/[0-9]/, "Password must include a number."),
    confirm_password: z.string(),
    company_name: z.string().trim().min(2, "Enter your company name."),
  })
  .refine((value) => value.password === value.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

export async function platformAdminExists() {
  try {
    const admin = createAdminClient();
    const { count, error } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (error) {
      return false;
    }

    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}

export async function registerFirstAdmin(formData: FormData) {
  const parsed = registerSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
    company_name: formData.get("company_name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Add SUPABASE_SERVICE_ROLE_KEY on the server before creating the first admin." };
  }

  const { count, error: countError } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (countError) {
    return { error: countError.message };
  }
  if ((count ?? 0) > 0) {
    return { error: "A platform admin already exists. Sign in instead." };
  }

  const { full_name, email, password, company_name } = parsed.data;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Could not create the admin login." };
  }

  const { count: adminsAfterCreate } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if ((adminsAfterCreate ?? 0) > 0) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: "A platform admin already exists. Sign in instead." };
  }

  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({ name: company_name, currency: "INR", timezone: "Asia/Kolkata" })
    .select("id")
    .single();

  if (companyError || !company) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: companyError?.message ?? "Could not create the company." };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      role: "admin",
      full_name,
      company_id: company.id,
    })
    .eq("id", data.user.id);

  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: profileError.message };
  }

  revalidatePath("/");
  revalidatePath("/setup");
  revalidatePath("/app/settings");
  return { error: null };
}
