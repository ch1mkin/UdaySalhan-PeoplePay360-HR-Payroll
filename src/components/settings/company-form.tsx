"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCompany } from "@/lib/actions/records";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";

export function CompanyForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Create company
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create company"
        description="Employees, contracts and payroll stay in this company."
        className="max-w-md"
      >
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setPending(true);
            setError(null);
            const result = await createCompany(new FormData(event.currentTarget));
            setPending(false);
            if (result.error) {
              setError(result.error);
              return;
            }
            setOpen(false);
            router.refresh();
          }}
        >
          <div>
            <Label htmlFor="name">Company name</Label>
            <Input id="name" name="name" required />
          </div>
          {error ? <p className="text-[13px] text-pp-danger">{error}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Create company"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
