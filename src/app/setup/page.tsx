import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, Users, Building2 } from "lucide-react";
import { BrandMark } from "@/components/brand/logo";
import { AdminRegisterForm } from "@/components/auth/admin-register-form";
import { platformAdminExists } from "@/lib/actions/bootstrap";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Create platform admin · PeoplePay360",
};

const steps = [
  {
    icon: ShieldCheck,
    title: "Create the first admin",
    body: "This login owns the workspace and is the only account that can grant roles.",
  },
  {
    icon: Building2,
    title: "Name the company",
    body: "Employees, contracts and payroll stay scoped to this company from day one.",
  },
  {
    icon: Users,
    title: "Invite your team",
    body: "After sign-in, use Settings to create users. People cannot self-register.",
  },
];

export default async function SetupPage() {
  if (await platformAdminExists()) {
    redirect("/");
  }

  const preview = !isSupabaseConfigured();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(280px,420px)_1fr]">
      <aside className="relative hidden overflow-hidden bg-pp-primary px-10 py-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-black/10" />
        <BrandMark inverted className="relative" />
        <div className="relative mt-16">
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-white/70">
            Temporary setup
          </p>
          <h1 className="mt-3 text-[32px] font-semibold leading-tight tracking-tight">
            Open your PeoplePay360 workspace
          </h1>
          <p className="mt-3 max-w-sm text-[14px] leading-6 text-white/80">
            Register once as platform admin. This page closes after the first account is created.
          </p>
        </div>
        <ul className="relative mt-12 space-y-6">
          {steps.map((step) => (
            <li key={step.title} className="flex gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-pp bg-white/15">
                <step.icon className="h-4 w-4" />
              </span>
              <span>
                <p className="text-[14px] font-medium">{step.title}</p>
                <p className="mt-0.5 text-[13px] leading-5 text-white/75">{step.body}</p>
              </span>
            </li>
          ))}
        </ul>
        <p className="relative mt-auto pt-16 text-[12px] text-white/60">
          Personnel, attendance, time off and payroll for one company.
        </p>
      </aside>

      <main className="flex items-center justify-center bg-pp-bg px-4 py-10 sm:px-8">
        <div className="w-full max-w-[520px] rounded-pp border border-pp-border bg-pp-surface p-8 sm:p-10">
          <div className="mb-6 lg:hidden">
            <BrandMark />
          </div>
          <span className="inline-flex rounded-full bg-pp-primary-light px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-pp-primary">
            Temporary
          </span>
          <h2 className="mt-4 text-[26px] font-semibold tracking-tight text-pp-text">
            Create platform admin
          </h2>
          <p className="mt-1 mb-7 text-[13px] leading-5 text-pp-muted">
            Use your work email. After this, only an admin can create users and assign roles.
          </p>
          {preview ? (
            <p className="mb-6 rounded-pp border border-pp-warning bg-pp-warning-light px-3 py-2 text-[13px] text-pp-text">
              Supabase is not connected on this environment yet. The form is ready; add project keys
              before submitting.
            </p>
          ) : null}
          <AdminRegisterForm />
          <p className="mt-6 text-center text-[13px] text-pp-muted">
            Already have an account?{" "}
            <Link href="/" className="font-medium text-pp-primary">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
