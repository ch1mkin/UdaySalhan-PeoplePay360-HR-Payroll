import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  netSalaryPaid: number | null;
  payslipsGenerated: number;
  averageSalary: number | null;
  attendanceRate: number | null;
  salaryByDepartment: { name: string; amount: number }[];
  monthlyNet: { month: string; net: number }[];
  payslipStatus: { status: string; count: number }[];
};

const emptyStats: DashboardStats = {
  netSalaryPaid: null,
  payslipsGenerated: 0,
  averageSalary: null,
  attendanceRate: null,
  salaryByDepartment: [],
  monthlyNet: [],
  payslipStatus: [],
};

export async function getDashboardStats(companyId: string | null): Promise<DashboardStats> {
  const supabase = await createClient();
  if (!supabase || !companyId) {
    return emptyStats;
  }

  const { data: payslips } = await supabase
    .from("payslips")
    .select("net, status, period_start, employee_id")
    .eq("company_id", companyId);

  const rows = payslips ?? [];
  if (rows.length === 0) {
    return emptyStats;
  }

  const paid = rows.filter((row) => row.status === "paid");
  const netTotal = paid.reduce((sum, row) => sum + Number(row.net ?? 0), 0);
  const uniqueEmployees = new Set(paid.map((row) => row.employee_id));

  const statusCounts = new Map<string, number>();
  for (const row of rows) {
    statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
  }

  const monthly = new Map<string, number>();
  for (const row of paid) {
    const key = new Date(row.period_start).toLocaleString("en-IN", {
      month: "short",
      year: "2-digit",
    });
    monthly.set(key, (monthly.get(key) ?? 0) + Number(row.net ?? 0));
  }

  const { data: attendance } = await supabase
    .from("attendance_records")
    .select("status")
    .eq("company_id", companyId);

  const attendanceRows = attendance ?? [];
  const presentish = attendanceRows.filter((row) =>
    ["present", "late", "overtime", "early_departure"].includes(row.status),
  ).length;
  const attendanceRate =
    attendanceRows.length === 0 ? null : Math.round((presentish / attendanceRows.length) * 100);

  return {
    netSalaryPaid: paid.length ? netTotal : null,
    payslipsGenerated: rows.length,
    averageSalary: uniqueEmployees.size ? netTotal / uniqueEmployees.size : null,
    attendanceRate,
    salaryByDepartment: [],
    monthlyNet: [...monthly.entries()].map(([month, net]) => ({ month, net })),
    payslipStatus: [...statusCounts.entries()].map(([status, count]) => ({ status, count })),
  };
}

export async function listEmployees(companyId: string | null) {
  const supabase = await createClient();
  if (!supabase || !companyId) {
    return [];
  }

  const { data } = await supabase
    .from("employees")
    .select("id, first_name, last_name, job_position, employment_status, work_email")
    .eq("company_id", companyId)
    .order("last_name");

  return data ?? [];
}

export async function listAttendance(companyId: string | null) {
  const supabase = await createClient();
  if (!supabase || !companyId) {
    return [];
  }

  const { data } = await supabase
    .from("attendance_records")
    .select("id, check_in, check_out, worked_hours, status, employees(first_name, last_name)")
    .eq("company_id", companyId)
    .order("check_in", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function listPayruns(companyId: string | null) {
  const supabase = await createClient();
  if (!supabase || !companyId) {
    return [];
  }

  const { data } = await supabase
    .from("payruns")
    .select("id, name, period_start, period_end, status")
    .eq("company_id", companyId)
    .order("period_start", { ascending: false });

  return data ?? [];
}

export async function listPayslips(companyId: string | null) {
  const supabase = await createClient();
  if (!supabase || !companyId) {
    return [];
  }

  const { data } = await supabase
    .from("payslips")
    .select("id, period_start, period_end, net, gross, status, employees(first_name, last_name)")
    .eq("company_id", companyId)
    .order("period_start", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function listTimeOffRequests(companyId: string | null) {
  const supabase = await createClient();
  if (!supabase || !companyId) {
    return [];
  }

  const { data } = await supabase
    .from("time_off_requests")
    .select(
      "id, start_date, end_date, duration, status, employees(first_name, last_name), time_off_types(name)",
    )
    .eq("company_id", companyId)
    .order("start_date", { ascending: false });

  return data ?? [];
}

export async function listContracts(companyId: string | null) {
  const supabase = await createClient();
  if (!supabase || !companyId) {
    return [];
  }

  const { data } = await supabase
    .from("contracts")
    .select("id, name, start_date, end_date, wage, status, employees(first_name, last_name)")
    .eq("company_id", companyId)
    .order("start_date", { ascending: false });

  return data ?? [];
}

export async function listSalaryStructures(companyId: string | null) {
  const supabase = await createClient();
  if (!supabase || !companyId) {
    return [];
  }

  const { data } = await supabase
    .from("salary_structures")
    .select("id, name, code, is_active")
    .eq("company_id", companyId)
    .order("name");

  return data ?? [];
}

export async function listSalaryRules(companyId: string | null) {
  const supabase = await createClient();
  if (!supabase || !companyId) {
    return [];
  }

  const { data: structures } = await supabase
    .from("salary_structures")
    .select("id")
    .eq("company_id", companyId);

  const ids = (structures ?? []).map((row) => row.id);
  if (ids.length === 0) {
    return [];
  }

  const { data } = await supabase
    .from("salary_rules")
    .select("id, name, code, sequence, category, calculation_method, is_active, structure_id")
    .in("structure_id", ids)
    .order("sequence");

  return data ?? [];
}

export async function listCompanies() {
  const supabase = await createClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase.from("companies").select("id, name").order("name");
  return data ?? [];
}
