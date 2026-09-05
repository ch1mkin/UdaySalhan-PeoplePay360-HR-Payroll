"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitOnboarding } from "@/lib/actions/users";
import { createClient } from "@/lib/supabase/client";

export function CompleteProfileForm({
  username,
  email,
  fullName,
}: {
  username: string;
  email: string;
  fullName: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-pp-bg px-4 py-10">
      <div className="w-full max-w-[480px] rounded-2xl border border-white/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(47,47,47,0.08)] backdrop-blur-xl">
        <BrandMark />
        <h1 className="mt-8 text-[26px] font-semibold tracking-tight">Your details</h1>
        <p className="mt-1 mb-6 text-[13px] text-pp-muted">
          Fill in your employee name. You cannot assign a role — a platform admin will approve your
          access.
        </p>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setPending(true);
            setError(null);
            const result = await submitOnboarding(new FormData(event.currentTarget));
            setPending(false);
            if (result.error) {
              setError(result.error);
              return;
            }
            if (result.status === "active") {
              router.push("/app");
            } else {
              router.push("/auth/waiting");
            }
            router.refresh();
          }}
        >
          <div>
            <Label>Username</Label>
            <Input defaultValue={username} readOnly className="bg-pp-bg text-pp-muted" />
          </div>
          <div>
            <Label>Work email</Label>
            <Input defaultValue={email} readOnly className="bg-pp-bg text-pp-muted" />
          </div>
          <div>
            <Label htmlFor="full_name">Employee name</Label>
            <Input id="full_name" name="full_name" required defaultValue={fullName} />
          </div>
          {error ? <p className="text-[13px] text-pp-danger">{error}</p> : null}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Submitting…" : "Submit for approval"}
          </Button>
        </form>
        <button
          type="button"
          className="mt-4 w-full text-[13px] text-pp-muted"
          onClick={async () => {
            const supabase = createClient();
            await supabase?.auth.signOut();
            router.push("/");
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
