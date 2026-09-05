export type AppRole =
  | "employee"
  | "hr_manager"
  | "hr_payroll_user"
  | "hr_payroll_manager"
  | "company_admin"
  | "admin";

export type UserAccountStatus = "invited" | "pending_approval" | "active" | "suspended";

export type PayrunStatus = "draft" | "computed" | "validated" | "paid" | "cancelled";

export type SalaryCalcMethod = "fixed" | "percentage" | "formula";

export type AttendanceStatus =
  | "present"
  | "late"
  | "early_departure"
  | "absent"
  | "overtime"
  | "missing_checkout";

export type CalendarType = "standard" | "flexible" | "shift";

export type ContractStatus = "draft" | "open" | "close_to_expire" | "expired" | "cancelled";

export type EmploymentStatus = "draft" | "active" | "on_leave" | "terminated";

export type WageType = "monthly" | "hourly";
