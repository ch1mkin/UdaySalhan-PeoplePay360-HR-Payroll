-- PeoplePay360 — calendar type and rules on working schedules

do $$
begin
  if not exists (select 1 from pg_type where typname = 'calendar_type') then
    create type public.calendar_type as enum ('standard', 'flexible', 'shift');
  end if;
end
$$;

alter table public.working_schedules
  add column if not exists calendar_type public.calendar_type not null default 'standard',
  add column if not exists rules text;
