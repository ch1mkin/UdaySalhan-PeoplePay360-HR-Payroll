import { Suspense } from "react";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { RupeeLoader } from "@/components/ui/rupee-loader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Set password · PeoplePay360",
};

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <RupeeLoader />
        </div>
      }
    >
      <SetPasswordForm />
    </Suspense>
  );
}
