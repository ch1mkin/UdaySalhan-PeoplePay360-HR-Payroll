"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccessContext, isPlatformAdmin } from "@/lib/auth/access";
import { canAccessModule, canSetupAttendanceHours } from "@/lib/auth/permissions";
import type { AppRole, AttendanceStatus } from "@/types/hr";
import {
  DEFAULT_WORK_END,
  DEFAULT_WORK_START,
  attendanceStatusFromTimes,
  istDayEnd,
  overtimeHours,
  sliceTime,
  todayISO,
  workedHours,
} from "@/lib/time/ist";

export type AttendanceDay = {
  date: string;
  status: AttendanceStatus;
  checkIn: string | null;
  checkOut: string | null;
};

export type WorkHours = {
  start: string;
  end: string;
};

const STATUSES: AttendanceStatus[] = [
  "present",
  "late",
  "absent",
  "overtime",
  "early_departure",
  "missing_checkout",
];

function canViewUser(viewerId: string, role: AppRole, targetId: string) {
  return viewerId === targetId || isPlatformAdmin(role) || role === "hr_manager" || role === "company_admin";
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

async function adminOrNull() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

function mapWorkHours(row: { work_start_time?: string | null; work_end_time?: string | null } | null): WorkHours {
  return {
    start: sliceTime(row?.work_start_time, DEFAULT_WORK_START),
    end: sliceTime(row?.work_end_time, DEFAULT_WORK_END),
  };
}

export async function getCompanyWorkHours(companyId: string | null): Promise<WorkHours> {
  const defaults: WorkHours = { start: DEFAULT_WORK_START, end: DEFAULT_WORK_END };
  if (!companyId) {
    return defaults;
  }
  const admin = await adminOrNull();
  if (!admin) {
    return defaults;
  }
  const full = await admin
    .from("companies")
    .select("work_start_time, work_end_time")
    .eq("id", companyId)
    .maybeSingle();
  if (!full.error) {
    return mapWorkHours(full.data);
  }
  return defaults;
}

export async function saveCompanyWorkHours(formData: FormData) {
  const access = await getAccessContext();
  if (!canSetupAttendanceHours(access.role)) {
    return { error: "Only an admin or HR manager can set morning and evening times." };
  }
  if (!access.companyId) {
    return { error: "Create a company in Settings first." };
  }

  const start = sliceTime(String(formData.get("work_start_time") ?? ""), "");
  const end = sliceTime(String(formData.get("work_end_time") ?? ""), "");
  if (!start || !end) {
    return { error: "Choose a morning time and an evening time." };
  }
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);
  if (endHour * 60 + endMin <= startHour * 60 + startMin) {
    return { error: "Evening time must be after morning time." };
  }

  const admin = await adminOrNull();
  if (!admin) {
    return { error: "Add SUPABASE_SERVICE_ROLE_KEY to save office hours." };
  }

  const updated = await admin
    .from("companies")
    .update({ work_start_time: start, work_end_time: end })
    .eq("id", access.companyId);
  if (updated.error) {
    return { error: updated.error.message };
  }

  revalidatePath("/app/attendance");
  revalidatePath("/app/settings");
  return { error: null };
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

  const admin = await adminOrNull();
  if (!admin) {
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
    .select("check_in, check_out, status")
    .eq("employee_id", employeeId)
    .order("check_in");

  return (data ?? []).map((row) => ({
    date: todayISO(new Date(row.check_in)),
    checkIn: row.check_in ?? null,
    checkOut: row.check_out ?? null,
    status: (STATUSES.includes(row.status as AttendanceStatus) ? row.status : "present") as AttendanceStatus,
  }));
}

export async function punchAttendance(kind: "in" | "out") {
  const access = await getAccessContext();
  if (!canAccessModule(access.role, "attendance") && !isPlatformAdmin(access.role)) {
    return { error: "You cannot mark attendance." };
  }
  if (!access.companyId) {
    return { error: "Create a company in Settings first." };
  }

  const admin = await adminOrNull();
  if (!admin) {
    return { error: "Add SUPABASE_SERVICE_ROLE_KEY to save attendance." };
  }

  let employeeId: string;
  try {
    employeeId = await ensureEmployeeId(access.userId, access.companyId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save attendance." };
  }

  const today = todayISO();
  const hours = await getCompanyWorkHours(access.companyId);
  const now = new Date();

  const { data: open } = await admin
    .from("attendance_records")
    .select("id, check_in, check_out")
    .eq("employee_id", employeeId)
    .is("check_out", null)
    .maybeSingle();

  if (open?.check_in && todayISO(new Date(open.check_in)) !== today) {
    await admin
      .from("attendance_records")
      .update({
        check_out: istDayEnd(todayISO(new Date(open.check_in))),
        status: "missing_checkout",
      })
      .eq("id", open.id);
  }

  const dayStart = `${today}T00:00:00+05:30`;
  const dayEnd = istDayEnd(today);
  const { data: todayRow } = await admin
    .from("attendance_records")
    .select("id, check_in, check_out, status")
    .eq("employee_id", employeeId)
    .gte("check_in", dayStart)
    .lte("check_in", dayEnd)
    .maybeSingle();

  if (kind === "in") {
    if (todayRow?.check_in) {
      return { error: "You have already checked in today." };
    }
    const status = attendanceStatusFromTimes(now, null, hours.start, hours.end);
    const inserted = await admin.from("attendance_records").insert({
      company_id: access.companyId,
      employee_id: employeeId,
      check_in: now.toISOString(),
      check_out: null,
      worked_hours: 0,
      overtime_hours: 0,
      status,
      source: "manual",
    });
    if (inserted.error) {
      return { error: inserted.error.message };
    }
  } else {
    if (!todayRow?.check_in) {
      return { error: "Check in first." };
    }
    if (todayRow.check_out) {
      return { error: "You have already checked out today." };
    }
    const checkIn = new Date(todayRow.check_in);
    if (now.getTime() < checkIn.getTime()) {
      return { error: "Check out cannot be before check in." };
    }
    const status = attendanceStatusFromTimes(checkIn, now, hours.start, hours.end);
    const updated = await admin
      .from("attendance_records")
      .update({
        check_out: now.toISOString(),
        worked_hours: workedHours(checkIn, now),
        overtime_hours: overtimeHours(now, hours.end),
        status,
      })
      .eq("id", todayRow.id);
    if (updated.error) {
      return { error: updated.error.message };
    }
  }

  revalidatePath("/app/attendance");
  revalidatePath(`/app/users/${access.userId}`);
  revalidatePath("/app/employees");
  revalidatePath("/app/profile");
  return { error: null };
}
