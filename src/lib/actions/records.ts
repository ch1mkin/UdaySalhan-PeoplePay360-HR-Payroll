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

  const employmentStatus = String(formData.get("employment_status") ?? "active");
  if (!EMPLOYMENT_STATUSES.includes(employmentStatus as (typeof EMPLOYMENT_STATUSES)[number])) {
    return { error: "Choose a valid employment status." };
  }

  const employeeNumber = `EMP-${Date.now().toString().slice(-8)}`;

  const { error } = await supabase.from("employees").insert({
    company_id: access.companyId,
    employee_number: employeeNumber,
    first_name: firstName,
    last_name: lastName,
    work_email: workEmail || null,
    job_position: jobPosition || null,
    working_schedule_id: String(formData.get("working_schedule_id") ?? "") || null,
    employment_status: employmentStatus,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/employees");
  return { error: null };
}

const CONTRACT_STATUSES = ["draft", "open", "close_to_expire", "expired", "cancelled"] as const;
const WAGE_TYPES = ["monthly", "hourly"] as const;
const CALENDAR_TYPES = ["standard", "flexible", "shift"] as const;
const EMPLOYMENT_STATUSES = ["draft", "active", "on_leave", "terminated"] as const;
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];

function hoursFromTimes(start: string, end: string, breakMinutes: number) {
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);
  if ([startHour, startMin, endHour, endMin].some((value) => Number.isNaN(value))) {
    return 0;
  }
  const minutes = endHour * 60 + endMin - (startHour * 60 + startMin) - breakMinutes;
  return Math.max(0, Math.round((minutes / 60) * 100) / 100);
}

export async function createContract(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Connect Supabase in .env.local before saving records." };
  }

  const access = await getAccessContext();
  if (!access.companyId) {
    return { error: "Create a company in Settings first." };
  }

  const employeeId = String(formData.get("employee_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim();
  const wage = Number(formData.get("wage") ?? 0);
  const wageType = String(formData.get("wage_type") ?? "monthly");
  const status = String(formData.get("status") ?? "open");
  const jobPosition = String(formData.get("job_position") ?? "").trim();
  const scheduleId = String(formData.get("working_schedule_id") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!employeeId) {
    return { error: "Choose an employee." };
  }
  if (!startDate) {
    return { error: "Start date is required." };
  }
  if (!Number.isFinite(wage) || wage < 0) {
    return { error: "Enter a valid wage." };
  }
  if (!WAGE_TYPES.includes(wageType as (typeof WAGE_TYPES)[number])) {
    return { error: "Choose monthly or hourly wage." };
  }
  if (!CONTRACT_STATUSES.includes(status as (typeof CONTRACT_STATUSES)[number])) {
    return { error: "Choose a valid contract status." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const payload = {
    company_id: access.companyId,
    employee_id: employeeId,
    name: name || null,
    start_date: startDate,
    end_date: endDate || null,
    wage,
    wage_type: wageType,
    status,
    job_position: jobPosition || null,
    working_schedule_id: scheduleId || null,
    notes: notes || null,
  };

  const result = id
    ? await supabase.from("contracts").update(payload).eq("id", id)
    : await supabase.from("contracts").insert(payload);

  if (result.error) {
    return { error: result.error.message };
  }

  revalidatePath("/app/contracts");
  revalidatePath("/app/employees");
  revalidatePath(`/app/employees/${employeeId}`);
  return { error: null };
}

export async function saveWorkingSchedule(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Connect Supabase in .env.local before saving records." };
  }

  const access = await getAccessContext();
  if (!access.companyId) {
    return { error: "Create a company in Settings first." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Schedule name is required." };
  }

  const calendarType = String(formData.get("calendar_type") ?? "standard");
  if (!CALENDAR_TYPES.includes(calendarType as (typeof CALENDAR_TYPES)[number])) {
    return { error: "Choose a calendar type." };
  }

  const days = WEEKDAYS.map((day) => {
    const working = formData.get(`day_${day}_working`) === "on";
    const start = String(formData.get(`day_${day}_start`) ?? "").trim();
    const end = String(formData.get(`day_${day}_end`) ?? "").trim();
    const breakMinutes = Number(formData.get(`day_${day}_break`) ?? 0) || 0;
    const hours = working && start && end ? hoursFromTimes(start, end, breakMinutes) : 0;
    return {
      day_of_week: day,
      is_working_day: working,
      start_time: working ? start || null : null,
      end_time: working ? end || null : null,
      break_minutes: breakMinutes,
      hours,
    };
  });

  const hoursPerWeek = Math.round(days.reduce((sum, day) => sum + day.hours, 0) * 100) / 100;
  const daysPerWeek = days.filter((day) => day.is_working_day).length;
  const id = String(formData.get("id") ?? "").trim();
  const base = {
    company_id: access.companyId,
    name,
    timezone: String(formData.get("timezone") ?? "Asia/Kolkata") || "Asia/Kolkata",
    is_active: formData.get("is_active") === "on",
    hours_per_week: hoursPerWeek,
    days_per_week: daysPerWeek,
  };

  const withType = {
    ...base,
    calendar_type: calendarType,
    rules: String(formData.get("rules") ?? "").trim() || null,
  };

  let scheduleId = id;
  if (id) {
    const updated = await supabase.from("working_schedules").update(withType).eq("id", id);
    if (updated.error) {
      const fallback = await supabase.from("working_schedules").update(base).eq("id", id);
      if (fallback.error) {
        return { error: fallback.error.message };
      }
    }
  } else {
    const created = await supabase.from("working_schedules").insert(withType).select("id").single();
    if (created.error || !created.data) {
      const fallback = await supabase.from("working_schedules").insert(base).select("id").single();
      if (fallback.error || !fallback.data) {
        return { error: fallback.error?.message ?? "Could not create the schedule." };
      }
      scheduleId = fallback.data.id;
    } else {
      scheduleId = created.data.id;
    }
  }

  const dayRows = days.map((day) => ({ ...day, schedule_id: scheduleId }));
  const { error: daysError } = await supabase
    .from("schedule_days")
    .upsert(dayRows, { onConflict: "schedule_id,day_of_week" });
  if (daysError) {
    return { error: daysError.message };
  }

  revalidatePath("/app/schedules");
  revalidatePath(`/app/schedules/${scheduleId}`);
  revalidatePath("/app/contracts");
  revalidatePath("/app/employees");
  return { error: null, id: scheduleId };
}
