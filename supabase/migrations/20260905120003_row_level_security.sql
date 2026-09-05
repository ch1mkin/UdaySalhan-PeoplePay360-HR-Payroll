-- PeoplePay360 — Row Level Security
-- Authorization is enforced here, not by hiding UI controls.

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

grant execute on function public.applicable_contract_id(uuid, date, date) to authenticated;
grant execute on function public.auth_role() to authenticated;
grant execute on function public.auth_company_id() to authenticated;
grant execute on function public.auth_employee_id() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_company_admin() to authenticated;
grant execute on function public.has_hr_access() to authenticated;
grant execute on function public.has_payroll_access() to authenticated;
grant execute on function public.has_payroll_manager_access() to authenticated;
grant execute on function public.same_company(uuid) to authenticated;

alter table public.companies enable row level security;
alter table public.departments enable row level security;
alter table public.working_schedules enable row level security;
alter table public.schedule_days enable row level security;
alter table public.salary_structures enable row level security;
alter table public.salary_rules enable row level security;
alter table public.employees enable row level security;
alter table public.profiles enable row level security;
alter table public.contracts enable row level security;
alter table public.attendance_records enable row level security;
alter table public.time_off_types enable row level security;
alter table public.time_off_allocations enable row level security;
alter table public.time_off_requests enable row level security;
alter table public.payruns enable row level security;
alter table public.payslips enable row level security;
alter table public.payslip_lines enable row level security;
alter table public.payrun_warnings enable row level security;
alter table public.email_deliveries enable row level security;
alter table public.documents enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.onboarding_invitations enable row level security;
alter table public.attendance_stations enable row level security;

-- Profiles
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or (public.has_hr_access() and public.same_company(company_id))
  );

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.auth_role());

create policy profiles_admin_write on public.profiles
  for all to authenticated
  using (
    public.is_admin()
    or (public.has_hr_access() and public.same_company(company_id))
  )
  with check (
    public.is_admin()
    or (public.has_hr_access() and public.same_company(company_id))
  );

-- Companies
create policy companies_select on public.companies
  for select to authenticated
  using (public.same_company(id));

create policy companies_admin_write on public.companies
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Departments
create policy departments_select on public.departments
  for select to authenticated
  using (public.same_company(company_id));

create policy departments_hr_write on public.departments
  for all to authenticated
  using (public.has_hr_access() and public.same_company(company_id))
  with check (public.has_hr_access() and public.same_company(company_id));

-- Working schedules
create policy working_schedules_select on public.working_schedules
  for select to authenticated
  using (public.same_company(company_id));

create policy working_schedules_hr_write on public.working_schedules
  for all to authenticated
  using (public.has_hr_access() and public.same_company(company_id))
  with check (public.has_hr_access() and public.same_company(company_id));

create policy schedule_days_select on public.schedule_days
  for select to authenticated
  using (
    exists (
      select 1 from public.working_schedules ws
      where ws.id = schedule_id and public.same_company(ws.company_id)
    )
  );

create policy schedule_days_hr_write on public.schedule_days
  for all to authenticated
  using (
    public.has_hr_access()
    and exists (
      select 1 from public.working_schedules ws
      where ws.id = schedule_id and public.same_company(ws.company_id)
    )
  )
  with check (
    public.has_hr_access()
    and exists (
      select 1 from public.working_schedules ws
      where ws.id = schedule_id and public.same_company(ws.company_id)
    )
  );

-- Salary structures / rules
create policy salary_structures_select on public.salary_structures
  for select to authenticated
  using (
    public.has_payroll_access() and public.same_company(company_id)
    or public.has_hr_access() and public.same_company(company_id)
  );

create policy salary_structures_write on public.salary_structures
  for all to authenticated
  using (public.has_payroll_access() and public.same_company(company_id))
  with check (public.has_payroll_access() and public.same_company(company_id));

create policy salary_rules_select on public.salary_rules
  for select to authenticated
  using (
    exists (
      select 1 from public.salary_structures ss
      where ss.id = structure_id
        and public.same_company(ss.company_id)
        and (public.has_payroll_access() or public.has_hr_access())
    )
  );

create policy salary_rules_write on public.salary_rules
  for all to authenticated
  using (
    public.has_payroll_access()
    and exists (
      select 1 from public.salary_structures ss
      where ss.id = structure_id and public.same_company(ss.company_id)
    )
  )
  with check (
    public.has_payroll_access()
    and exists (
      select 1 from public.salary_structures ss
      where ss.id = structure_id and public.same_company(ss.company_id)
    )
  );

-- Employees
create policy employees_select on public.employees
  for select to authenticated
  using (
    id = public.auth_employee_id()
    or (public.has_hr_access() and public.same_company(company_id))
  );

create policy employees_hr_write on public.employees
  for all to authenticated
  using (public.has_hr_access() and public.same_company(company_id))
  with check (public.has_hr_access() and public.same_company(company_id));

-- Contracts
create policy contracts_select on public.contracts
  for select to authenticated
  using (
    employee_id = public.auth_employee_id()
    or (public.has_hr_access() and public.same_company(company_id))
  );

create policy contracts_hr_write on public.contracts
  for all to authenticated
  using (public.has_hr_access() and public.same_company(company_id))
  with check (public.has_hr_access() and public.same_company(company_id));

-- Attendance
create policy attendance_select on public.attendance_records
  for select to authenticated
  using (
    employee_id = public.auth_employee_id()
    or (public.has_hr_access() and public.same_company(company_id))
  );

create policy attendance_insert_self on public.attendance_records
  for insert to authenticated
  with check (
    employee_id = public.auth_employee_id()
    and public.same_company(company_id)
  );

create policy attendance_update_self on public.attendance_records
  for update to authenticated
  using (employee_id = public.auth_employee_id())
  with check (employee_id = public.auth_employee_id());

create policy attendance_hr_write on public.attendance_records
  for all to authenticated
  using (public.has_hr_access() and public.same_company(company_id))
  with check (public.has_hr_access() and public.same_company(company_id));

-- Time off types
create policy time_off_types_select on public.time_off_types
  for select to authenticated
  using (public.same_company(company_id));

create policy time_off_types_hr_write on public.time_off_types
  for all to authenticated
  using (public.has_hr_access() and public.same_company(company_id))
  with check (public.has_hr_access() and public.same_company(company_id));

-- Allocations
create policy allocations_select on public.time_off_allocations
  for select to authenticated
  using (
    employee_id = public.auth_employee_id()
    or (public.has_hr_access() and public.same_company(company_id))
  );

create policy allocations_hr_write on public.time_off_allocations
  for all to authenticated
  using (public.has_hr_access() and public.same_company(company_id))
  with check (public.has_hr_access() and public.same_company(company_id));

-- Requests
create policy time_off_requests_select on public.time_off_requests
  for select to authenticated
  using (
    employee_id = public.auth_employee_id()
    or approver_id = public.auth_employee_id()
    or (public.has_hr_access() and public.same_company(company_id))
  );

create policy time_off_requests_insert_self on public.time_off_requests
  for insert to authenticated
  with check (
    employee_id = public.auth_employee_id()
    and public.same_company(company_id)
  );

create policy time_off_requests_update_self_draft on public.time_off_requests
  for update to authenticated
  using (
    employee_id = public.auth_employee_id()
    and status in ('draft', 'requested')
  )
  with check (employee_id = public.auth_employee_id());

create policy time_off_requests_hr_write on public.time_off_requests
  for all to authenticated
  using (public.has_hr_access() and public.same_company(company_id))
  with check (public.has_hr_access() and public.same_company(company_id));

-- Payruns
create policy payruns_select on public.payruns
  for select to authenticated
  using (
    public.has_payroll_access() and public.same_company(company_id)
    or public.has_hr_access() and public.same_company(company_id)
  );

create policy payruns_write on public.payruns
  for all to authenticated
  using (public.has_payroll_access() and public.same_company(company_id))
  with check (public.has_payroll_access() and public.same_company(company_id));

-- Payslips
create policy payslips_select on public.payslips
  for select to authenticated
  using (
    employee_id = public.auth_employee_id()
    or (public.has_payroll_access() and public.same_company(company_id))
    or (public.has_hr_access() and public.same_company(company_id))
  );

create policy payslips_write on public.payslips
  for all to authenticated
  using (public.has_payroll_access() and public.same_company(company_id))
  with check (public.has_payroll_access() and public.same_company(company_id));

create policy payslip_lines_select on public.payslip_lines
  for select to authenticated
  using (
    exists (
      select 1 from public.payslips p
      where p.id = payslip_id
        and (
          p.employee_id = public.auth_employee_id()
          or (public.has_payroll_access() and public.same_company(p.company_id))
          or (public.has_hr_access() and public.same_company(p.company_id))
        )
    )
  );

create policy payslip_lines_write on public.payslip_lines
  for all to authenticated
  using (
    public.has_payroll_access()
    and exists (
      select 1 from public.payslips p
      where p.id = payslip_id and public.same_company(p.company_id)
    )
  )
  with check (
    public.has_payroll_access()
    and exists (
      select 1 from public.payslips p
      where p.id = payslip_id and public.same_company(p.company_id)
    )
  );

create policy payrun_warnings_select on public.payrun_warnings
  for select to authenticated
  using (
    exists (
      select 1 from public.payruns pr
      where pr.id = payrun_id
        and public.same_company(pr.company_id)
        and (public.has_payroll_access() or public.has_hr_access())
    )
  );

create policy payrun_warnings_write on public.payrun_warnings
  for all to authenticated
  using (
    public.has_payroll_access()
    and exists (
      select 1 from public.payruns pr
      where pr.id = payrun_id and public.same_company(pr.company_id)
    )
  )
  with check (
    public.has_payroll_access()
    and exists (
      select 1 from public.payruns pr
      where pr.id = payrun_id and public.same_company(pr.company_id)
    )
  );

create policy email_deliveries_select on public.email_deliveries
  for select to authenticated
  using (public.has_payroll_access() and public.same_company(company_id));

create policy email_deliveries_write on public.email_deliveries
  for all to authenticated
  using (public.has_payroll_access() and public.same_company(company_id))
  with check (public.has_payroll_access() and public.same_company(company_id));

-- Documents
create policy documents_select on public.documents
  for select to authenticated
  using (
    employee_id = public.auth_employee_id()
    or (public.has_hr_access() and public.same_company(company_id))
  );

create policy documents_hr_write on public.documents
  for all to authenticated
  using (public.has_hr_access() and public.same_company(company_id))
  with check (public.has_hr_access() and public.same_company(company_id));

-- Notifications
create policy notifications_select on public.notifications
  for select to authenticated
  using (user_id = auth.uid() or (public.has_hr_access() and public.same_company(company_id)));

create policy notifications_update_own on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy notifications_hr_write on public.notifications
  for insert to authenticated
  with check (public.has_hr_access() and public.same_company(company_id));

-- Audit logs: insert + select for HR, no updates
create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using (public.has_hr_access() and public.same_company(company_id) or public.is_admin());

create policy audit_logs_insert on public.audit_logs
  for insert to authenticated
  with check (public.has_hr_access() or public.is_admin());

-- QR onboarding / stations — HR only for now
create policy onboarding_select on public.onboarding_invitations
  for select to authenticated
  using (public.has_hr_access() and public.same_company(company_id));

create policy onboarding_write on public.onboarding_invitations
  for all to authenticated
  using (public.has_hr_access() and public.same_company(company_id))
  with check (public.has_hr_access() and public.same_company(company_id));

create policy stations_select on public.attendance_stations
  for select to authenticated
  using (public.same_company(company_id));

create policy stations_hr_write on public.attendance_stations
  for all to authenticated
  using (public.has_hr_access() and public.same_company(company_id))
  with check (public.has_hr_access() and public.same_company(company_id));
