import Link from "next/link";
import { BrandMark } from "@/components/brand/logo";
import { SignInForm } from "@/components/auth/sign-in-form";
import { platformAdminExists } from "@/lib/actions/bootstrap";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const preview = !isSupabaseConfigured();
  const needsFirstAdmin = !(await platformAdminExists());

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-pp-bg px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-[-80px] h-72 w-72 rounded-full bg-pp-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-[-60px] h-80 w-80 rounded-full bg-pp-secondary/10 blur-3xl" />
      <div className="relative w-full max-w-[420px] rounded-2xl border border-white/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(47,47,47,0.08)] backdrop-blur-xl sm:p-10">
        <BrandMark />
        <h1 className="mt-8 text-[28px] font-semibold tracking-tight text-pp-text">Sign in</h1>
        <p className="mt-1 mb-7 text-[13px] leading-5 text-pp-muted">
          Use the work email issued for your PeoplePay360 account.
        </p>
        <SignInForm />
        {needsFirstAdmin ? (
          <p className="mt-6 text-center text-[13px] text-pp-muted">
            First time here?{" "}
            <Link href="/setup" className="font-medium text-pp-primary">
              Register as platform admin
            </Link>
          </p>
        ) : null}
        {preview ? (
          <p className="mt-5 text-center text-[13px] text-pp-muted">
            Database is not connected yet.{" "}
            <Link href="/app" className="font-medium text-pp-primary">
              Open the empty workspace
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
