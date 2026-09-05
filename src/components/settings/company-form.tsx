"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCompany } from "@/lib/actions/records";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CompanyForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="max-w-md space-y-3"
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
        router.refresh();
      }}
    >
      <Label htmlFor="name">Company name</Label>
      <Input id="name" name="name" required placeholder="Your company" />
      {error ? <p className="text-[13px] text-pp-danger">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Create company"}
      </Button>
    </form>
  );
}
