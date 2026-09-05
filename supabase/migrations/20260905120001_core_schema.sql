-- PeoplePay360 — relational schema
-- Employees → Contracts → Schedules → Attendance → Time Off → Salary Rules → Payruns → Payslips

-- ---------------------------------------------------------------------------
-- Organisation
-- ---------------------------------------------------------------------------

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  registration_number text,
  email text,
  phone text,
  address_line1 text,
  city text,
  state text,
  postal_code text,
  country text not null default 'IN',
  currency text not null default 'INR',
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  code text,
  parent_id uuid references public.departments(id) on delete set null,
  manager_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, name)
);

-- ---------------------------------------------------------------------------
-- Working schedules (weekly hours are derived from schedule_days)
-- ---------------------------------------------------------------------------

create table public.working_schedules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  timezone text not null default 'Asia/Kolkata',
  days_per_week numeric(3, 1) not null default 0,
  hours_per_week numeric(6, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.schedule_days (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.working_schedules(id) on delete cascade,
  -- ISO: 1 = Monday … 7 = Sunday
  day_of_week smallint not null check (day_of_week between 1 and 7),
  is_working_day boolean not null default true,
  start_time time,
  end_time time,
  break_minutes integer not null default 0 check (break_minutes >= 0),
  hours numeric(5, 2) not null default 0 check (hours >= 0),
  unique (schedule_id, day_of_week)
);

-- ---------------------------------------------------------------------------
-- Salary structures and ordered rules
-- ---------------------------------------------------------------------------

create table public.salary_structures (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  code text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, name)
);

create table public.salary_rules (
  id uuid primary key default gen_random_uuid(),
  structure_id uuid not null references public.salary_structures(id) on delete cascade,
  sequence integer not null check (sequence > 0),
  name text not null,
  code text not null,
  category public.salary_rule_category not null,
  calculation_method public.salary_calc_method not null,
  amount numeric(14, 2),
  percentage numeric(8, 4),
  percentage_base_code text,
  formula text,
  condition_formula text,
  is_active boolean not null default true,
  appears_on_payslip boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (structure_id, code),
  unique (structure_id, sequence)
);

-- ---------------------------------------------------------------------------
-- Employees
-- ---------------------------------------------------------------------------

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid unique references auth.users(id) on delete set null,
  employee_number text not null,
  first_name text not null,
  last_name text not null,
  preferred_name text,
  work_email text,
  personal_email text,
  phone text,
  date_of_birth date,
  gender text,
  marital_status text,
  nationality text,
  department_id uuid references public.departments(id) on delete set null,
  job_position text,
  manager_id uuid references public.employees(id) on delete set null,
  work_location text,
  employment_status public.employment_status not null default 'draft',
  working_schedule_id uuid references public.working_schedules(id) on delete set null,
  hire_date date,
  bank_name text,
  bank_account_number text,
  bank_ifsc text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relation text,
  address_line1 text,
  city text,
  state text,
  postal_code text,
  country text default 'IN',
  profile_photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, employee_number)
);

alter table public.departments
  add constraint departments_manager_id_fkey
  foreign key (manager_id) references public.employees(id) on delete set null;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  full_name text,
  role public.app_role not null default 'employee',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Contracts — payroll selects the contract applicable to the period
-- ---------------------------------------------------------------------------

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  name text,
  start_date date not null,
  end_date date,
  department_id uuid references public.departments(id) on delete set null,
  job_position text,
  wage numeric(14, 2) not null check (wage >= 0),
  wage_type public.wage_type not null default 'monthly',
  salary_structure_id uuid references public.salary_structures(id) on delete set null,
  working_schedule_id uuid references public.working_schedules(id) on delete set null,
  status public.contract_status not null default 'draft',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

-- ---------------------------------------------------------------------------
-- Attendance
-- ---------------------------------------------------------------------------

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  check_in timestamptz not null,
  check_out timestamptz,
  worked_hours numeric(6, 2) not null default 0 check (worked_hours >= 0),
  overtime_hours numeric(6, 2) not null default 0 check (overtime_hours >= 0),
  status public.attendance_status not null default 'present',
  notes text,
  source public.attendance_source not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out is null or check_out >= check_in)
);

create unique index attendance_one_open_session
  on public.attendance_records (employee_id)
  where check_out is null;

-- ---------------------------------------------------------------------------
-- Time off
-- ---------------------------------------------------------------------------

create table public.time_off_types (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  code text,
  unit public.time_off_unit not null default 'day',
  requires_allocation boolean not null default true,
  approval_method public.time_off_approval_method not null default 'manager',
  payroll_behavior public.time_off_payroll_behavior not null default 'paid',
  color text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, name)
);

create table public.time_off_allocations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  type_id uuid not null references public.time_off_types(id) on delete restrict,
  allocated numeric(8, 2) not null check (allocated >= 0),
  taken numeric(8, 2) not null default 0 check (taken >= 0),
  remaining numeric(8, 2) generated always as (allocated - taken) stored,
  status public.allocation_status not null default 'draft',
  approver_id uuid references public.employees(id) on delete set null,
  valid_from date not null,
  valid_until date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (taken <= allocated),
  check (valid_until is null or valid_until >= valid_from)
);

create table public.time_off_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  type_id uuid not null references public.time_off_types(id) on delete restrict,
  allocation_id uuid references public.time_off_allocations(id) on delete set null,
  start_date date not null,
  end_date date not null,
  duration numeric(8, 2) not null check (duration > 0),
  reason text,
  approver_id uuid references public.employees(id) on delete set null,
  status public.time_off_request_status not null default 'requested',
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

-- ---------------------------------------------------------------------------
-- Payruns and payslips
-- ---------------------------------------------------------------------------

create table public.payruns (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  salary_structure_id uuid references public.salary_structures(id) on delete set null,
  name text not null,
  period_start date not null,
  period_end date not null,
  status public.payrun_status not null default 'draft',
  computed_at timestamptz,
  validated_at timestamptz,
  paid_at timestamptz,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start)
);

create table public.payslips (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  payrun_id uuid not null references public.payruns(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete restrict,
  contract_id uuid references public.contracts(id) on delete set null,
  salary_structure_id uuid references public.salary_structures(id) on delete set null,
  period_start date not null,
  period_end date not null,
  worked_days numeric(6, 2) not null default 0,
  basic numeric(14, 2) not null default 0,
  allowances numeric(14, 2) not null default 0,
  gross numeric(14, 2) not null default 0,
  deductions numeric(14, 2) not null default 0,
  net numeric(14, 2) not null default 0,
  status public.payslip_status not null default 'draft',
  pdf_path text,
  email_status public.email_delivery_status,
  emailed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (payrun_id, employee_id)
);

create table public.payslip_lines (
  id uuid primary key default gen_random_uuid(),
  payslip_id uuid not null references public.payslips(id) on delete cascade,
  salary_rule_id uuid references public.salary_rules(id) on delete set null,
  sequence integer not null,
  code text not null,
  name text not null,
  category public.salary_rule_category not null,
  amount numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.payrun_warnings (
  id uuid primary key default gen_random_uuid(),
  payrun_id uuid not null references public.payruns(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete set null,
  code text not null,
  severity public.notification_severity not null default 'warning',
  message text not null,
  created_at timestamptz not null default now()
);

create table public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  payslip_id uuid references public.payslips(id) on delete set null,
  to_email text not null,
  subject text not null,
  status public.email_delivery_status not null default 'queued',
  error_message text,
  provider text not null default 'hostinger_smtp',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Supporting records
-- ---------------------------------------------------------------------------

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete set null,
  name text not null,
  category text,
  storage_path text not null,
  mime_type text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text,
  category text,
  severity public.notification_severity not null default 'info',
  href text,
  record_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table public.onboarding_invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  token text not null unique,
  email text,
  employee_id uuid references public.employees(id) on delete set null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.attendance_stations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  token text not null unique,
  location text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index employees_company_idx on public.employees (company_id);
create index employees_department_idx on public.employees (department_id);
create index employees_manager_idx on public.employees (manager_id);
create index contracts_employee_period_idx on public.contracts (employee_id, start_date, end_date);
create index contracts_company_idx on public.contracts (company_id);
create index attendance_employee_check_in_idx on public.attendance_records (employee_id, check_in desc);
create index attendance_company_idx on public.attendance_records (company_id);
create index time_off_requests_employee_idx on public.time_off_requests (employee_id, start_date);
create index time_off_allocations_employee_idx on public.time_off_allocations (employee_id, type_id);
create index payslips_employee_idx on public.payslips (employee_id, period_start);
create index payslips_payrun_idx on public.payslips (payrun_id);
create index payruns_company_period_idx on public.payruns (company_id, period_start, period_end);
create index notifications_user_unread_idx on public.notifications (user_id, is_read, created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index salary_rules_structure_seq_idx on public.salary_rules (structure_id, sequence);
