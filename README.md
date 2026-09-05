# PeoplePay360

Personnel and payroll: employees, contracts, schedules, attendance, time off, salary rules, payruns and payslips. PostgreSQL is the source of truth. Salary is computed on the server from ordered rules — not in the browser.

Stack: Next.js, TypeScript, Supabase/PostgreSQL, Tailwind, Hostinger SMTP.

## Setup

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Fill `.env.local` with your Supabase project keys and Hostinger mailbox credentials. Do not commit `.env.local`.

This machine is on Node 20, so `@supabase/supabase-js` is pinned to `2.109.0` (the last release that supports it). Vercel can use Node 22.

## Environment files

| File | Purpose |
| --- | --- |
| `.env.example` | Documented template for every environment |
| `.env.local.example` | Same keys, meant to be copied to `.env.local` |
| `.env.local` | Your secrets (gitignored) |

### Hostinger SMTP

Use the mailbox from Hostinger Email, not a personal Gmail account.

- Host: `smtp.hostinger.com`
- Port `465` with `SMTP_SECURE=true` (SSL, recommended)
- Or port `587` with `SMTP_SECURE=false` (STARTTLS)
- Username: the full address, e.g. `payroll@yourdomain.com`
- From address should be that same mailbox

Set the same variables in Vercel for production.

## Database

Migrations live in [`supabase/migrations/`](supabase/migrations/). Apply them in timestamp order.

```text
20260905120000_extensions_and_enums.sql
20260905120001_core_schema.sql
20260905120002_functions.sql
20260905120003_row_level_security.sql
20260905120004_storage.sql
20260905120005_company_admin_role.sql
```

With the Supabase CLI (after `supabase link`):

```bash
supabase db push
```

Or paste each file, in order, into the Supabase SQL editor.

Demo seed data is not included. `supabase/seed.sql` is empty so you can create companies and employees yourself in the app.

## Roles

| Role | Scope | Modules |
| --- | --- | --- |
| Employee | Self | Dashboard, attendance, time off, payslips |
| HR Manager | Company | HR modules, reports, settings |
| Payroll User | Company | Payruns, payslips, structures, rules, reports |
| Payroll Manager | Company | Payroll user plus settings |
| Company Admin | Entire company | All modules |
| Platform Admin | All companies | All modules |

The sidebar only lists modules the signed-in role can open. PostgreSQL RLS still enforces the same split.

## Design

Odoo-inspired enterprise shell: white surfaces, `#F7F7F7` page background, purple `#714B67` for primary actions and active nav, teal `#017E84` as a secondary accent. Logo and favicon: `public/logoHR360.png`.

## Repo

https://github.com/ch1mkin/UdaySalhan-PeoplePay360-HR-Payroll.git
