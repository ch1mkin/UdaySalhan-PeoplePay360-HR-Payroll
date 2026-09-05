"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMyProfile } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { roleLabel } from "@/lib/auth/permissions";
import type { AppRole } from "@/types/hr";
import { useAppLoader } from "@/store/loader";

export function ProfileForm({
  fullName,
  email,
  role,
  companyName,
}: {
  fullName: string;
  email: string;
  role: AppRole;
  companyName: string;
}) {
  const router = useRouter();
  const start = useAppLoader((state) => state.start);
  const stop = useAppLoader((state) => state.stop);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        setSaved(false);
        const timer = window.setTimeout(start, 200);
        const result = await updateMyProfile(new FormData(event.currentTarget));
        window.clearTimeout(timer);
        stop();
        setPending(false);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSaved(true);
        router.refresh();
      }}
    >
      <div>
        <Label htmlFor="full_name">Name</Label>
        <Input id="full_name" name="full_name" defaultValue={fullName} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" defaultValue={email} readOnly className="bg-pp-bg text-pp-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Role</Label>
          <Input defaultValue={roleLabel(role)} readOnly className="bg-pp-bg text-pp-muted" />
          <p className="mt-1 text-[12px] text-pp-muted">Assigned by a platform admin. You cannot change it.</p>
        </div>
        <div>
          <Label>Company</Label>
          <Input defaultValue={companyName} readOnly className="bg-pp-bg text-pp-muted" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="password">New password</Label>
          <PasswordInput id="password" name="password" autoComplete="new-password" minLength={8} />
        </div>
        <div>
          <Label htmlFor="confirm_password">Confirm password</Label>
          <PasswordInput
            id="confirm_password"
            name="confirm_password"
            autoComplete="new-password"
            minLength={8}
          />
        </div>
      </div>
      <p className="text-[12px] text-pp-muted">Leave password blank to keep your current password.</p>
      {error ? <p className="text-[13px] text-pp-danger">{error}</p> : null}
      {saved ? <p className="text-[13px] text-pp-success">Profile saved.</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={async () => {
            const supabase = createClient();
            await supabase?.auth.signOut();
            router.push("/");
            router.refresh();
          }}
        >
          Sign out
        </Button>
      </div>
    </form>
  );
}
