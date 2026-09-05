import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand/logo";
import { getAccessContext, isPlatformAdmin } from "@/lib/auth/access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Waiting for approval · PeoplePay360",
};

export default async function WaitingPage() {
  const access = await getAccessContext();
  if (isPlatformAdmin(access.role) || access.accountStatus === "active") {
    redirect("/app");
  }
  if (access.accountStatus === "invited") {
    redirect("/auth/complete-profile");
  }

  const suspended = access.accountStatus === "suspended";

  return (
    <div className="flex min-h-screen items-center justify-center bg-pp-bg px-4">
      <div className="w-full max-w-[440px] rounded-2xl border border-white/80 bg-white/80 p-8 text-center shadow-[0_24px_80px_rgba(47,47,47,0.08)] backdrop-blur-xl">
        <BrandMark className="justify-center" />
        <h1 className="mt-8 text-[24px] font-semibold tracking-tight">
          {suspended ? "Access is suspended" : "Waiting for admin approval"}
        </h1>
        <p className="mt-2 text-[13px] leading-6 text-pp-muted">
          {suspended
            ? "A platform admin declined or suspended this account. You cannot assign yourself a role."
            : "Your details were submitted. A platform admin will approve your access. You cannot change your role."}
        </p>
        <Link href="/" className="mt-6 inline-block text-[13px] font-medium text-pp-primary">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
