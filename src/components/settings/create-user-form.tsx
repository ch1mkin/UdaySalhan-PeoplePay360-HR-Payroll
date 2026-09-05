"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAppUser, updateAppUser } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/form-section";
import { Modal } from "@/components/ui/modal";
import type { AppRole } from "@/types/hr";
import { useAppLoader } from "@/store/loader";

const ROLES: { value: AppRole; label: string }[] = [
  { value: "employee", label: "Employee" },
  { value: "hr_manager", label: "HR Manager" },
  { value: "hr_payroll_user", label: "Payroll User" },
  { value: "hr_payroll_manager", label: "Payroll Manager" },
  { value: "company_admin", label: "Company Admin" },
  { value: "admin", label: "Platform Admin" },
];

type UserRow = {
  id: string;
  full_name: string | null;
  role: string | null;
  company_id: string | null;
};

function UserFields({
  user,
  companies,
  canAssignPlatformAdmin,
}: {
  user?: UserRow;
  companies: { id: string; name: string }[];
  canAssignPlatformAdmin: boolean;
}) {
  const roles = canAssignPlatformAdmin ? ROLES : ROLES.filter((role) => role.value !== "admin");
  return (
    <>
      {user ? <input type="hidden" name="id" value={user.id} /> : null}
      <Field>
        <Label htmlFor="full_name">Name</Label>
        <Input id="full_name" name="full_name" defaultValue={user?.full_name ?? ""} />
      </Field>
      {user ? null : (
        <Field>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </Field>
      )}
      <Field className={user ? "" : "sm:col-span-2"}>
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          name="role"
          defaultValue={user?.role ?? "employee"}
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
            defaultValue={user?.company_id ?? ""}
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
    </>
  );
}

export function CreateUserForm({
  companies,
  canAssignPlatformAdmin,
  user,
  onDone,
}: {
  companies: { id: string; name: string }[];
  canAssignPlatformAdmin: boolean;
  user?: UserRow;
  onDone?: () => void;
}) {
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
        const action = user ? updateAppUser : createAppUser;
        const result = await action(new FormData(event.currentTarget));
        window.clearTimeout(timer);
        stop();
        setPending(false);
        if (result.error) {
          setError(result.error);
          return;
        }
        event.currentTarget.reset();
        onDone?.();
        router.refresh();
      }}
    >
      <UserFields user={user} companies={companies} canAssignPlatformAdmin={canAssignPlatformAdmin} />
      {user ? null : (
        <p className="sm:col-span-2 text-[13px] text-pp-muted">
          They will receive a welcome email with a link to set their password and sign in with this role.
        </p>
      )}
      {error ? <p className="sm:col-span-2 text-[13px] text-pp-danger">{error}</p> : null}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : user ? "Save user" : "Send invite"}
        </Button>
      </div>
    </form>
  );
}

export function UserDialogs({
  companies,
  canAssignPlatformAdmin,
  users,
}: {
  companies: { id: string; name: string }[];
  canAssignPlatformAdmin: boolean;
  users: UserRow[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);

  return (
    <>
      <div className="mb-4">
        <Button type="button" onClick={() => setCreateOpen(true)}>
          Create user
        </Button>
      </div>
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create user"
        description="They will get a welcome email to set their password."
      >
        <CreateUserForm
          companies={companies}
          canAssignPlatformAdmin={canAssignPlatformAdmin}
          onDone={() => setCreateOpen(false)}
        />
      </Modal>
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit user"
        description="Update this person's name, role or company."
      >
        {editing ? (
          <CreateUserForm
            companies={companies}
            canAssignPlatformAdmin={canAssignPlatformAdmin}
            user={editing}
            onDone={() => setEditing(null)}
          />
        ) : null}
      </Modal>
      {users.length > 0 ? (
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="text-pp-muted">
              <th className="py-2 font-medium">Name</th>
              <th className="py-2 font-medium">Role</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-pp-border">
                <td className="py-2.5">{user.full_name || "—"}</td>
                <td className="py-2.5 capitalize">{(user.role ?? "employee").replaceAll("_", " ")}</td>
                <td className="py-2.5 text-right">
                  <Button type="button" size="sm" variant="secondary" onClick={() => setEditing(user)}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </>
  );
}
