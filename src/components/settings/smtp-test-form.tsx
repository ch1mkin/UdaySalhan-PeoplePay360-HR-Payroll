"use client";

import { useState } from "react";
import { sendSmtpTest } from "@/lib/actions/mail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppLoader } from "@/store/loader";

export function SmtpTestForm({
  defaultTo,
  host,
  port,
  from,
  configured,
}: {
  defaultTo: string;
  host: string | null;
  port: number | null;
  from: string | null;
  configured: boolean;
}) {
  const start = useAppLoader((state) => state.start);
  const stop = useAppLoader((state) => state.stop);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        setSuccess(null);
        const timer = window.setTimeout(start, 200);
        const result = await sendSmtpTest(new FormData(event.currentTarget));
        window.clearTimeout(timer);
        stop();
        setPending(false);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccess(`Test mail sent to ${result.to}. Check that inbox.`);
      }}
    >
      <div className="rounded-xl bg-pp-bg px-3 py-2 text-[13px] text-pp-muted">
        {configured ? (
          <p>
            Hostinger {host}:{port}
            {from ? ` · from ${from}` : ""}
          </p>
        ) : (
          <p>SMTP is not configured on this environment yet.</p>
        )}
      </div>
      <div>
        <Label htmlFor="to">Send test to</Label>
        <Input id="to" name="to" type="email" required defaultValue={defaultTo} />
      </div>
      {error ? <p className="text-[13px] text-pp-danger">{error}</p> : null}
      {success ? <p className="text-[13px] text-pp-success">{success}</p> : null}
      <Button type="submit" disabled={pending || !configured}>
        {pending ? "Sending…" : "Send test email"}
      </Button>
    </form>
  );
}
