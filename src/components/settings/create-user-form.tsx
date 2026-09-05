"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAppUser } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/form-section";
import type { AppRole } from "@/types/hr";

const ROLES: { value: AppRole; label: string }[] = [
  { value: "employee", label: "Employee" },
  { value: "hr_manager", label: "HR Manager" },
  { value: "hr_payroll_user", label: "Payroll User" },
  { value: "hr_payroll_manager", label: "Payroll Manager" },
  { value: "company_admin", label: "Company Admin" },
  { value: "admin", label: "Platform Admin" },
];

export function CreateUserForm({
  companies,
  canAssignPlatformAdmin,
}: {
  companies: { id: string; name: string }[];
  canAssignPlatformAdmin: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const roles = canAssignPlatformAdmin
    ? ROLES
    : ROLES.filter((role) => role.value !== "admin");

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const result = await createAppUser(new FormData(event.currentTarget));
        setPending(false);
        if (result.error) {
          setError(result.error);
          return;
        }
        event.currentTarget.reset();
        router.refresh();
      }}
    >
      <Field>
        <Label htmlFor="full_name">Name</Label>
        <Input id="full_name" name="full_name" />
      </Field>
      <Field>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </Field>
      <Field>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" minLength={8} required />
      </Field>
      <Field>
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          name="role"
          defaultValue="employee"
          className="h-10 rounded-pp border border-pp-border bg-pp-surface px-3 text-sm text-pp-text outline-none focus:border-pp-primary"
        >
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </Field>
      {canAssignPlatformAdmin && companies.length > 0 ? (
        <Field className="sm:col-span-2">
          <Label htmlFor="company_id">Company</Label>
          <select
            id="company_id"
            name="company_id"
            className="h-10 rounded-pp border border-pp-border bg-pp-surface px-3 text-sm text-pp-text outline-none focus:border-pp-primary"
          >
            <option value="">None</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
      {error ? <p className="sm:col-span-2 text-[13px] text-pp-danger">{error}</p> : null}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create user"}
        </Button>
      </div>
    </form>
  );
}
