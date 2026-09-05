"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { createClient } from "@/lib/supabase/client";
import type { EmailOtpType } from "@supabase/supabase-js";

export function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not connected.");
      return;
    }

    const client = supabase;
    const tokenHash = searchParams.get("token_hash");
    const type = (searchParams.get("type") ?? "recovery") as EmailOtpType;

    async function prepare() {
      if (tokenHash) {
        const { error: verifyError } = await client.auth.verifyOtp({
          type,
          token_hash: tokenHash,
        });
        if (verifyError) {
          setError("This invite link is invalid or has expired.");
          return;
        }
      } else {
        const { data } = await client.auth.getUser();
        if (!data.user) {
          setError("Open the link from your welcome email to set a password.");
          return;
        }
      }
      setReady(true);
    }

    void prepare();
  }, [searchParams]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm_password") ?? "");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setPending(false);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      setPending(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not connected.");
      setPending(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setPending(false);
      return;
    }

    setPending(false);
    setSuccess(true);
    window.setTimeout(() => {
      router.push("/auth/complete-profile");
      router.refresh();
    }, 1100);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-pp-bg px-4 py-10">
      <div className="w-full max-w-[420px] rounded-2xl border border-white/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(47,47,47,0.08)] backdrop-blur-xl">
        <BrandMark />
        <h1 className="mt-8 text-[26px] font-semibold tracking-tight">Set your password</h1>
        <p className="mt-1 mb-6 text-[13px] text-pp-muted">
          Choose a password, then add your employee details. A platform admin assigns your role.
        </p>
        {success ? (
          <div className="py-4 text-center">
            <p className="text-[16px] font-semibold text-pp-success">Password saved</p>
            <p className="mt-1 text-[13px] text-pp-muted">Continue to your details…</p>
          </div>
        ) : !ready ? (
          <p className="text-[13px] text-pp-danger">{error ?? "Checking your invite…"}</p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div>
              <Label htmlFor="password">New password</Label>
              <PasswordInput id="password" name="password" autoComplete="new-password" required minLength={8} />
            </div>
            <div>
              <Label htmlFor="confirm_password">Confirm password</Label>
              <PasswordInput
                id="confirm_password"
                name="confirm_password"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
            {error ? <p className="text-[13px] text-pp-danger">{error}</p> : null}
            <Button type="submit" disabled={pending} className="h-11 w-full">
              {pending ? "Saving…" : "Save password and continue"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
