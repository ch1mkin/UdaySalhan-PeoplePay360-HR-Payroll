"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEmployee } from "@/lib/actions/records";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FormSection } from "@/components/ui/form-section";
import { Modal } from "@/components/ui/modal";
import { useAppLoader } from "@/store/loader";

export function EmployeeForm({
  onDone,
  embedded = false,
}: {
  onDone?: () => void;
  embedded?: boolean;
}) {
  const router = useRouter();
  const start = useAppLoader((state) => state.start);
  const stop = useAppLoader((state) => state.stop);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className={embedded ? "" : "rounded-pp border border-pp-border bg-pp-surface px-5"}
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const timer = window.setTimeout(start, 200);
        const result = await createEmployee(new FormData(event.currentTarget));
        window.clearTimeout(timer);
        stop();
        setPending(false);
        if (result.error) {
          setError(result.error);
          return;
        }
        onDone?.();
        router.refresh();
        if (!embedded) {
          router.push("/app/employees");
        }
      }}
    >
      <FormSection title="Personal Information">
        <Field>
          <Label htmlFor="first_name">First Name</Label>
          <Input id="first_name" name="first_name" required />
        </Field>
        <Field>
          <Label htmlFor="last_name">Last Name</Label>
          <Input id="last_name" name="last_name" required />
        </Field>
        <Field>
          <Label htmlFor="work_email">Email</Label>
          <Input id="work_email" name="work_email" type="email" />
        </Field>
      </FormSection>
      <FormSection title="Employment">
        <Field>
          <Label htmlFor="job_position">Job Position</Label>
          <Input id="job_position" name="job_position" />
        </Field>
      </FormSection>
      {error ? <p className="pb-3 text-[13px] text-pp-danger">{error}</p> : null}
      <div className="flex gap-2 py-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        {embedded ? (
          <Button type="button" variant="secondary" onClick={onDone}>
            Cancel
          </Button>
        ) : (
          <Button href="/app/employees" variant="secondary">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export function NewEmployeeButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        New Employee
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New Employee"
        description="Add a person to the company directory."
      >
        <EmployeeForm embedded onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
