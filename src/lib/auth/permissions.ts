import type { AppRole } from "@/types/hr";
import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  CalendarDays,
  Clock,
  FileText,
  LayoutDashboard,
  List,
  Settings,
  Users,
  Wallet,
  BarChart3,
  UserCog,
  ClipboardCheck,
  CalendarClock,
} from "lucide-react";

export type AppModule =
  | "dashboard"
  | "employees"
  | "contracts"
  | "attendance"
  | "time_off"
  | "schedules"
  | "payruns"
  | "payslips"
  | "structures"
  | "rules"
  | "reports"
  | "settings"
  | "users"
  | "approvals";

export type NavItem = {
  module: AppModule;
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavGroup = {
  id: string;
  label: string | null;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "home",
    label: null,
    items: [{ module: "dashboard", href: "/app", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    id: "hr",
    label: "HR",
    items: [
      { module: "employees", href: "/app/employees", label: "Employees", icon: Users },
      { module: "contracts", href: "/app/contracts", label: "Contracts", icon: FileText },
      { module: "schedules", href: "/app/schedules", label: "Working Schedules", icon: CalendarClock },
      { module: "attendance", href: "/app/attendance", label: "Attendance", icon: Clock },
      { module: "time_off", href: "/app/time-off", label: "Time Off", icon: CalendarDays },
    ],
  },
  {
    id: "payroll",
    label: "Payroll",
    items: [
      { module: "payruns", href: "/app/payruns", label: "Payruns", icon: Wallet },
      { module: "payslips", href: "/app/payslips", label: "Payslips", icon: FileText },
      { module: "structures", href: "/app/structures", label: "Salary Structures", icon: Banknote },
      { module: "rules", href: "/app/rules", label: "Salary Rules", icon: List },
    ],
  },
  {
    id: "end",
    label: null,
    items: [
      { module: "reports", href: "/app/reports", label: "Reports", icon: BarChart3 },
      { module: "users", href: "/app/users", label: "Users", icon: UserCog },
      { module: "approvals", href: "/app/users/approvals", label: "Approvals", icon: ClipboardCheck },
      { module: "settings", href: "/app/settings", label: "Settings", icon: Settings },
    ],
  },
];

const ALL_MODULES: AppModule[] = NAV_GROUPS.flatMap((group) =>
  group.items.map((item) => item.module),
);

const ADMIN_ONLY: AppModule[] = ["users", "approvals"];

const ROLE_MODULES: Record<AppRole, AppModule[]> = {
  employee: ["dashboard", "attendance", "time_off", "payslips"],
  hr_manager: [
    "dashboard",
    "employees",
    "contracts",
    "schedules",
    "attendance",
    "time_off",
    "reports",
    "settings",
  ],
  hr_payroll_user: [
    "dashboard",
    "payslips",
    "payruns",
    "structures",
    "rules",
    "reports",
  ],
  hr_payroll_manager: [
    "dashboard",
    "payslips",
    "payruns",
    "structures",
    "rules",
    "schedules",
    "reports",
    "settings",
  ],
  company_admin: ALL_MODULES.filter((module) => !ADMIN_ONLY.includes(module)),
  admin: ALL_MODULES,
};

export function parseAppRole(value: unknown): AppRole | null {
  switch (value) {
    case "employee":
    case "hr_manager":
    case "hr_payroll_user":
    case "hr_payroll_manager":
    case "company_admin":
    case "admin":
      return value;
    default:
      return null;
  }
}

export function canAccessModule(role: AppRole, module: AppModule): boolean {
  if (role === "admin") {
    return true;
  }
  return ROLE_MODULES[role]?.includes(module) ?? false;
}

export function canSetupAttendanceHours(role: AppRole) {
  return role === "admin" || role === "hr_manager" || role === "company_admin";
}

export function navGroupsForRole(role: AppRole): NavGroup[] {
  if (role === "admin") {
    return NAV_GROUPS;
  }
  const allowed = new Set(ROLE_MODULES[role] ?? []);
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => allowed.has(item.module)),
  })).filter((group) => group.items.length > 0);
}

export function roleLabel(role: AppRole): string {
  switch (role) {
    case "employee":
      return "Employee";
    case "hr_manager":
      return "HR Manager";
    case "hr_payroll_user":
      return "Payroll User";
    case "hr_payroll_manager":
      return "Payroll Manager";
    case "company_admin":
      return "Company Admin";
    case "admin":
      return "Platform Admin";
  }
}
