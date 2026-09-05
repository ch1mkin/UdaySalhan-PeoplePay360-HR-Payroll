-- PeoplePay360 — one attendance mark per employee per calendar day (IST)

create unique index if not exists attendance_records_employee_day_idx
  on public.attendance_records (
    employee_id,
    ((timezone('Asia/Kolkata', check_in))::date)
  );
