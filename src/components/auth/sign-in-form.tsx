"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailFilled, setEmailFilled] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const supabase = createClient();
    if (!supabase) {
      setError("Connect Supabase before signing in.");
      setPending(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setPending(false);
      return;
    }

    setPending(false);
    setSuccess(true);
    window.setTimeout(() => {
      router.refresh();
      router.push("/app");
    }, 1200);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pp-success-light">
          <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden>
            <circle cx="24" cy="24" r="20" fill="none" stroke="var(--pp-success)" strokeWidth="2.5" />
            <path
              d="M15 24.5 21.2 30.5 33 17.5"
              fill="none"
              stroke="var(--pp-success)"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="28"
              strokeDashoffset="28"
              style={{ animation: "pp-check-draw 0.45s 0.12s ease forwards" }}
            />
          </svg>
        </span>
        <p
          className="mt-4 text-[18px] font-semibold text-pp-text"
          style={{ animation: "pp-success-pop 0.4s cubic-bezier(0.22, 1, 0.36, 1) both" }}
        >
          Signed in
        </p>
        <p className="mt-1 text-[13px] text-pp-muted">Opening your workspace…</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="relative">
        <Label htmlFor="email" className="sr-only">
          Work email
        </Label>
        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pp-gray" />
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          onFocus={() => setEmailFocused(true)}
          onBlur={(event) => {
            setEmailFocused(false);
            setEmailFilled(Boolean(event.currentTarget.value));
          }}
          onInput={(event) => setEmailFilled(Boolean(event.currentTarget.value))}
          className="peer h-12 w-full rounded-xl border border-pp-border bg-pp-surface px-3 pl-10 text-sm text-pp-text outline-none transition-[border-color,box-shadow,padding] focus:border-pp-primary focus:shadow-[0_0_0_4px_rgba(113,75,103,0.12)]"
          style={
            emailFocused || emailFilled
              ? { paddingTop: "1.1rem", paddingBottom: "0.35rem" }
              : undefined
          }
        />
        <span
          className={cn(
            "pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-[13px] text-pp-gray transition-all",
            emailFocused || emailFilled
              ? "top-1.5 translate-y-0 text-[10px] font-medium uppercase tracking-wide text-pp-primary"
              : "",
          )}
        >
          Work email
        </span>
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          className="h-12 rounded-xl focus:shadow-[0_0_0_4px_rgba(113,75,103,0.12)]"
        />
      </div>
      {error ? (
        <p className="rounded-xl bg-pp-danger-light px-3 py-2 text-[13px] leading-5 text-pp-danger">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-xl text-[14px] transition-transform active:scale-[0.98]"
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
