-- PeoplePay360 — company morning / evening times for attendance

alter table public.companies
  add column if not exists work_start_time time not null default '09:30',
  add column if not exists work_end_time time not null default '18:30';
