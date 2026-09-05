"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAccessContext } from "@/lib/auth/access";

export async function createCompany(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Connect Supabase in .env.local before saving records." };
  }

  const access = await getAccessContext();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Company name is required." };
  }

  const { data, error } = await supabase
    .from("companies")
    .insert({ name, currency: "INR", timezone: "Asia/Kolkata" })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Could not create company." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const patch: { company_id: string; role?: "company_admin" } = {
      company_id: data.id,
    };
    if (access.role !== "admin") {
      patch.role = "company_admin";
    }
    await supabase.from("profiles").update(patch).eq("id", user.id);
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { error: null };
}

export async function createEmployee(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Connect Supabase in .env.local before saving records." };
  }

  const access = await getAccessContext();
  if (!access.companyId) {
    return { error: "Create a company in Settings first." };
  }

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const workEmail = String(formData.get("work_email") ?? "").trim();
  const jobPosition = String(formData.get("job_position") ?? "").trim();

  if (!firstName || !lastName) {
    return { error: "First and last name are required." };
  }

  const employeeNumber = `EMP-${Date.now().toString().slice(-8)}`;

  const { error } = await supabase.from("employees").insert({
    company_id: access.companyId,
    employee_number: employeeNumber,
    first_name: firstName,
    last_name: lastName,
    work_email: workEmail || null,
    job_position: jobPosition || null,
    employment_status: "draft",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/employees");
  return { error: null };
}
