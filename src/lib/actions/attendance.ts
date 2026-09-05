"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccessContext, isPlatformAdmin } from "@/lib/auth/access";
import { canAccessModule } from "@/lib/auth/permissions";
import type { AppRole, AttendanceStatus } from "@/types/hr";

export type AttendanceDay = {
  date: string;
  status: AttendanceStatus;
};

const STATUSES: AttendanceStatus[] = [
  "present",
  "late",
  "absent",
  "overtime",
  "early_departure",
  "missing_checkout",
];

function istDate(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(value);
}

function dayBounds(date: string) {
  return {
    start: `${date}T00:00:00+05:30`,
    end: `${date}T23:59:59.999+05:30`,
    checkIn: `${date}T09:30:00+05:30`,
    checkOut: `${date}T18:30:00+05:30`,
  };
}

function splitName(fullName: string, fallback: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { first_name: fallback, last_name: "—" };
  }
  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(" ") || "—",
  };
}

function canViewUser(viewerId: string, role: AppRole, targetId: string) {
  return viewerId === targetId || isPlatformAdmin(role) || role === "hr_manager" || role === "company_admin";
}

async function ensureEmployeeId(userId: string, companyId: string) {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("employees")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing?.id) {
    await admin.from("profiles").update({ employee_id: existing.id }).eq("id", userId);
    return existing.id as string;
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, username, work_email, employee_id")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.employee_id) {
    return profile.employee_id as string;
  }

  const names = splitName(profile?.full_name || "", profile?.username || "User");
  const { data: created, error } = await admin
    .from("employees")
    .insert({
      company_id: companyId,
      user_id: userId,
      employee_number: `U-${userId.replaceAll("-", "").slice(0, 8).toUpperCase()}`,
      first_name: names.first_name,
      last_name: names.last_name,
      work_email: profile?.work_email ?? null,
      employment_status: "active",
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Could not link an employee record for attendance.");
  }

  await admin.from("profiles").update({ employee_id: created.id }).eq("id", userId);
  return created.id as string;
}

export async function listAttendanceDays(userId: string): Promise<AttendanceDay[]> {
  const access = await getAccessContext();
  if (!canAccessModule(access.role, "attendance") && !isPlatformAdmin(access.role)) {
    return [];
  }
  if (!canViewUser(access.userId, access.role, userId)) {
    return [];
  }
  if (!access.companyId && !isPlatformAdmin(access.role)) {
    return [];
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return [];
  }

  const { data: employee } = await admin
    .from("employees")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  const { data: profile } = employee?.id
    ? { data: { employee_id: employee.id } }
    : await admin.from("profiles").select("employee_id").eq("id", userId).maybeSingle();

  const employeeId = employee?.id ?? profile?.employee_id;
  if (!employeeId) {
    return [];
  }

  const { data } = await admin
    .from("attendance_records")
    .select("check_in, status")
    .eq("employee_id", employeeId)
    .order("check_in");

  return (data ?? []).map((row) => ({
    date: istDate(new Date(row.check_in)),
    status: (STATUSES.includes(row.status as AttendanceStatus) ? row.status : "present") as AttendanceStatus,
  }));
}

export async function saveAttendanceDay(formData: FormData) {
  const access = await getAccessContext();
  const targetId = String(formData.get("user_id") ?? access.userId);
  const date = String(formData.get("date") ?? "").trim();
  const status = String(formData.get("status") ?? "") as AttendanceStatus;

  if (!STATUSES.includes(status)) {
    return { error: "Choose a valid attendance status." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: "Choose a valid date." };
  }
  if (!canViewUser(access.userId, access.role, targetId)) {
    return { error: "You cannot update this attendance calendar." };
  }
  if (targetId !== access.userId && !isPlatformAdmin(access.role) && access.role !== "hr_manager" && access.role !== "company_admin") {
    return { error: "Only HR or an admin can mark another person's attendance." };
  }
  if (!access.companyId) {
    return { error: "Create a company in Settings first." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Add SUPABASE_SERVICE_ROLE_KEY to save attendance." };
  }

  let employeeId: string;
  try {
    employeeId = await ensureEmployeeId(targetId, access.companyId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save attendance." };
  }

  const bounds = dayBounds(date);
  const worked =
    status === "absent" ? 0 : status === "late" || status === "early_departure" ? 7.5 : status === "overtime" ? 10 : 8;
  const payload = {
    company_id: access.companyId,
    employee_id: employeeId,
    check_in: bounds.checkIn,
    check_out: status === "absent" || status === "missing_checkout" ? null : bounds.checkOut,
    worked_hours: worked,
    overtime_hours: status === "overtime" ? 2 : 0,
    status,
    source: "manual" as const,
  };

  const { data: existing } = await admin
    .from("attendance_records")
    .select("id")
    .eq("employee_id", employeeId)
    .gte("check_in", bounds.start)
    .lte("check_in", bounds.end)
    .maybeSingle();

  const result = existing?.id
    ? await admin.from("attendance_records").update(payload).eq("id", existing.id)
    : await admin.from("attendance_records").insert(payload);

  if (result.error) {
    return { error: result.error.message };
  }

  revalidatePath("/app/attendance");
  revalidatePath(`/app/users/${targetId}`);
  revalidatePath("/app/profile");
  return { error: null };
}
