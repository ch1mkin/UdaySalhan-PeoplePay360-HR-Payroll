"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCompanyWorkHours, type WorkHours } from "@/lib/actions/attendance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/form-section";
import { useAppLoader } from "@/store/loader";

export function WorkHoursForm({ hours }: { hours: WorkHours }) {
  const router = useRouter();
  const start = useAppLoader((state) => state.start);
  const stop = useAppLoader((state) => state.stop);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const timer = window.setTimeout(start, 200);
        const result = await saveCompanyWorkHours(new FormData(event.currentTarget));
        window.clearTimeout(timer);
        stop();
        setPending(false);
        if (result.error) {
          setError(result.error);
          return;
        }
        router.refresh();
      }}
    >
      <Field>
        <Label htmlFor="work_start_time">Morning time</Label>
        <Input
          id="work_start_time"
          name="work_start_time"
          type="time"
          required
          defaultValue={hours.start}
        />
        <p className="mt-1 text-[12px] text-pp-muted">Check in after this is marked late.</p>
      </Field>
      <Field>
        <Label htmlFor="work_end_time">Evening time</Label>
        <Input
          id="work_end_time"
          name="work_end_time"
          type="time"
          required
          defaultValue={hours.end}
        />
        <p className="mt-1 text-[12px] text-pp-muted">Check out before this is left early; after this is overtime.</p>
      </Field>
      {error ? <p className="sm:col-span-2 text-[13px] text-pp-danger">{error}</p> : null}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save office hours"}
        </Button>
      </div>
    </form>
  );
}
