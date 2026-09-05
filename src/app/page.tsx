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
    <div className="flex min-h-screen items-center justify-center bg-pp-bg px-4">
      <div className="w-full max-w-[400px] rounded-pp border border-pp-border bg-pp-surface p-8">
        <BrandMark />
        <h1 className="mt-8 text-[26px] font-semibold tracking-tight text-pp-text">Sign in</h1>
        <p className="mt-1 mb-6 text-[13px] text-pp-muted">Use the mailbox issued by your company.</p>
        <SignInForm />
        {needsFirstAdmin ? (
          <p className="mt-5 text-center text-[13px] text-pp-muted">
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
