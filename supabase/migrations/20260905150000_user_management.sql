-- PeoplePay360 — user management, account status, and role protection

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_account_status') then
    create type public.user_account_status as enum (
      'invited',
      'pending_approval',
      'active',
      'suspended'
    );
  end if;
end
$$;

alter table public.profiles
  add column if not exists username text,
  add column if not exists work_email text,
  add column if not exists account_status public.user_account_status not null default 'invited',
  add column if not exists details_submitted_at timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references public.profiles(id) on delete set null;

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username))
  where username is not null;

update public.profiles as p
set
  work_email = coalesce(p.work_email, u.email),
  username = coalesce(p.username, split_part(u.email, '@', 1)),
  account_status = case
    when p.role = 'admin' then 'active'::public.user_account_status
    else p.account_status
  end
from auth.users as u
where u.id = p.id;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, username, work_email, account_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'employee',
    coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), split_part(new.email, '@', 1)),
    new.email,
    'invited'
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
  -- Service role / SQL editor (no JWT) may maintain rows.
  if auth.uid() is null then
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

drop trigger if exists profiles_protect_privileges on public.profiles;
create trigger profiles_protect_privileges
  before update on public.profiles
  for each row execute function public.protect_profile_privileges();

drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles
  for all to authenticated
  using (public.is_admin() or (public.has_hr_access() and public.same_company(company_id)))
  with check (public.is_admin() or (public.has_hr_access() and public.same_company(company_id)));
