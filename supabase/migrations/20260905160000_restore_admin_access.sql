-- PeoplePay360 — restore platform admin access and honor service-role updates.
-- The first workspace account was often left as employee, which hid HR, payroll,
-- users, and settings from the sidebar.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  declared_role text;
  next_role public.app_role := 'employee';
  next_status public.user_account_status := 'invited';
begin
  declared_role := coalesce(
    new.raw_app_meta_data ->> 'role',
    new.raw_user_meta_data ->> 'role',
    'employee'
  );

  if declared_role in (
    'employee',
    'hr_manager',
    'hr_payroll_user',
    'hr_payroll_manager',
    'company_admin',
    'admin'
  ) then
    next_role := declared_role::public.app_role;
  end if;

  if next_role = 'admin' then
    if exists (select 1 from public.profiles where role = 'admin') then
      next_role := 'employee';
    else
      next_status := 'active';
    end if;
  end if;

  insert into public.profiles (id, full_name, role, username, work_email, account_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    next_role,
    coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), split_part(new.email, '@', 1)),
    new.email,
    next_status
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or auth.uid() is null then
    return new;
  end if;

  if new.role is distinct from old.role then
    if new.id = auth.uid() then
      raise exception 'You cannot assign or change your own role.';
    end if;
    if not public.is_admin() then
      raise exception 'Only a platform admin can assign roles.';
    end if;
  end if;

  if new.account_status is distinct from old.account_status then
    if new.id = auth.uid() then
      if not (
        old.account_status = 'invited'
        and new.account_status = 'pending_approval'
      ) then
        raise exception 'You cannot change your own account status.';
      end if;
    elsif not public.is_admin() then
      raise exception 'Only a platform admin can change account status.';
    end if;
  end if;

  return new;
end;
$$;

-- If nobody is platform admin, promote the earliest profile (the setup account).
update public.profiles
set
  role = 'admin',
  account_status = 'active'
where id = (
  select p.id
  from public.profiles as p
  order by p.created_at asc
  limit 1
)
and not exists (
  select 1
  from public.profiles as existing
  where existing.role = 'admin'
);
