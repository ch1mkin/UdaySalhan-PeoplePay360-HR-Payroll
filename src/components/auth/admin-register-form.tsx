"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { registerFirstAdmin } from "@/lib/actions/bootstrap";

export function AdminRegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const result = await registerFirstAdmin(formData);
    if (result.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Account created. Configure Supabase on this client, then sign in.");
      setPending(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Admin created. Sign in from the home page.");
      setPending(false);
      router.push("/");
      return;
    }

    router.refresh();
    router.push("/app");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            name="full_name"
            autoComplete="name"
            required
            placeholder="Ada Lovelace"
            className="h-11"
          />
        </div>
        <div>
          <Label htmlFor="company_name">Company</Label>
          <Input
            id="company_name"
            name="company_name"
            autoComplete="organization"
            required
            placeholder="Your company"
            className="h-11"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="you@company.com"
          className="h-11"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="h-11"
          />
        </div>
        <div>
          <Label htmlFor="confirm_password">Confirm password</Label>
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="h-11"
          />
        </div>
      </div>
      <p className="text-[12px] leading-5 text-pp-muted">
        Use at least 8 characters, including a letter and a number. This account becomes the
        platform admin and can create every other user and role.
      </p>
      {error ? <p className="text-[13px] leading-5 text-pp-danger">{error}</p> : null}
      <Button type="submit" disabled={pending} className="h-11 w-full text-[14px]">
        {pending ? "Creating admin…" : "Create admin account"}
      </Button>
    </form>
  );
}
