-- PeoplePay360 — extensions and domain enums
-- PostgreSQL is the source of truth for HR and payroll records.

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

create type public.app_role as enum (
  'employee',
  'hr_manager',
  'hr_payroll_user',
  'hr_payroll_manager',
  'company_admin', -- full access within one company
  'admin'          -- platform: all companies
);

create type public.employment_status as enum (
  'draft',
  'active',
  'on_leave',
  'terminated'
);

create type public.contract_status as enum (
  'draft',
  'open',
  'close_to_expire',
  'expired',
  'cancelled'
);

create type public.attendance_status as enum (
  'present',
  'late',
  'early_departure',
  'absent',
  'overtime',
  'missing_checkout'
);

create type public.attendance_source as enum (
  'manual',
  'qr',
  'import'
);

create type public.time_off_unit as enum (
  'day',
  'hour'
);

create type public.time_off_approval_method as enum (
  'none',
  'manager',
  'hr'
);

create type public.time_off_payroll_behavior as enum (
  'paid',
  'unpaid',
  'work_entry'
);

create type public.allocation_status as enum (
  'draft',
  'to_approve',
  'approved',
  'refused'
);

create type public.time_off_request_status as enum (
  'draft',
  'requested',
  'to_approve',
  'approved',
  'refused',
  'cancelled'
);

create type public.wage_type as enum (
  'monthly',
  'hourly'
);

create type public.salary_rule_category as enum (
  'basic',
  'allowance',
  'gross',
  'deduction',
  'net',
  'other'
);

create type public.salary_calc_method as enum (
  'fixed',
  'percentage',
  'formula'
);

create type public.payrun_status as enum (
  'draft',
  'computed',
  'validated',
  'paid',
  'cancelled'
);

create type public.payslip_status as enum (
  'draft',
  'computed',
  'validated',
  'paid',
  'cancelled'
);

create type public.email_delivery_status as enum (
  'queued',
  'sent',
  'failed',
  'missing_address'
);

create type public.notification_severity as enum (
  'info',
  'warning',
  'critical'
);
