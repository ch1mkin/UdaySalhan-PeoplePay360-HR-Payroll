-- PeoplePay360 — triggers and domain functions

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'companies',
    'departments',
    'working_schedules',
    'salary_structures',
    'salary_rules',
    'employees',
    'profiles',
    'contracts',
    'attendance_records',
    'time_off_types',
    'time_off_allocations',
    'time_off_requests',
    'payruns',
    'payslips'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at()',
      tbl
    );
  end loop;
end;
$$;

-- Daily hours come from start/end/break. Weekly totals are rolled up after the row exists.
create or replace function public.set_schedule_day_hours()
returns trigger
language plpgsql
as $$
begin
  if new.is_working_day and new.start_time is not null and new.end_time is not null then
    new.hours := round(
      greatest(
        0,
        extract(epoch from (new.end_time - new.start_time)) / 3600.0
          - (new.break_minutes / 60.0)
      )::numeric,
      2
    );
  else
    new.hours := 0;
  end if;
  return new;
end;
$$;

create or replace function public.roll_up_schedule_hours()
returns trigger
language plpgsql
as $$
declare
  target uuid;
begin
  target := coalesce(new.schedule_id, old.schedule_id);

  update public.working_schedules ws
  set
    hours_per_week = coalesce((
      select round(sum(sd.hours), 2)
      from public.schedule_days sd
      where sd.schedule_id = target
        and sd.is_working_day
    ), 0),
    days_per_week = coalesce((
      select count(*)::numeric
      from public.schedule_days sd
      where sd.schedule_id = target
        and sd.is_working_day
    ), 0),
    updated_at = now()
  where ws.id = target;

  return coalesce(new, old);
end;
$$;

create trigger set_schedule_day_hours
  before insert or update on public.schedule_days
  for each row execute function public.set_schedule_day_hours();

create trigger roll_up_schedule_hours
  after insert or update or delete on public.schedule_days
  for each row execute function public.roll_up_schedule_hours();

-- Contract applicable to a payroll period.
-- Overlap: start_date <= period_end AND (end_date is null OR end_date >= period_start)
-- Tie-break (deterministic, never arbitrary):
--   1. open status before other statuses
--   2. latest start_date
--   3. open-ended (null end_date) before dated
--   4. latest end_date
--   5. lowest id
create or replace function public.applicable_contract_id(
  p_employee_id uuid,
  p_period_start date,
  p_period_end date
)
returns uuid
language sql
stable
as $$
  select c.id
  from public.contracts c
  where c.employee_id = p_employee_id
    and c.status not in ('cancelled', 'draft')
    and c.start_date <= p_period_end
    and (c.end_date is null or c.end_date >= p_period_start)
  order by
    case when c.status = 'open' then 0 else 1 end,
    c.start_date desc,
    case when c.end_date is null then 0 else 1 end,
    c.end_date desc nulls last,
    c.id
  limit 1;
$$;

create or replace function public.auth_profile()
returns public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.auth_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.auth_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

create or replace function public.auth_employee_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select employee_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_company_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select role in ('company_admin', 'admin')
      from public.profiles
      where id = auth.uid()
    ),
    false
  );
$$;

create or replace function public.has_hr_access()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select role in (
        'hr_manager',
        'hr_payroll_user',
        'hr_payroll_manager',
        'company_admin',
        'admin'
      )
      from public.profiles
      where id = auth.uid()
    ),
    false
  );
$$;

create or replace function public.has_payroll_access()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select role in (
        'hr_payroll_user',
        'hr_payroll_manager',
        'company_admin',
        'admin'
      )
      from public.profiles
      where id = auth.uid()
    ),
    false
  );
$$;

create or replace function public.has_payroll_manager_access()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select role in ('hr_payroll_manager', 'company_admin', 'admin')
      from public.profiles
      where id = auth.uid()
    ),
    false
  );
$$;

create or replace function public.same_company(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or (p_company_id is not null and p_company_id = public.auth_company_id());
$$;

-- New auth users get a profile row. Role stays employee until HR promotes them.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'employee'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
