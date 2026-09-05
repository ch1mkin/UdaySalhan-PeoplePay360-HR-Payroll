export type AppRole =
  | "employee"
  | "hr_manager"
  | "hr_payroll_user"
  | "hr_payroll_manager"
  | "company_admin"
  | "admin";

export type PayrunStatus = "draft" | "computed" | "validated" | "paid" | "cancelled";

export type SalaryCalcMethod = "fixed" | "percentage" | "formula";
