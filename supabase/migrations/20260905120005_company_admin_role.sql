-- Company admin: full access within their company.
-- Platform admin (`admin`) still sees every company.

alter type public.app_role add value if not exists 'company_admin';

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

grant execute on function public.is_company_admin() to authenticated;
