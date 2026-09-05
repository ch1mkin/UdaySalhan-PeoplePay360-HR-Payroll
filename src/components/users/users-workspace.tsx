"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List as ListIcon } from "lucide-react";
import { createAppUser, updateAppUser, type DirectoryUser } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/form-section";
import { Modal } from "@/components/ui/modal";
import { FilterBar } from "@/components/ui/filter-bar";
import { DataCell, DataRow, DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import type { AppRole, UserAccountStatus } from "@/types/hr";
import { useAppLoader } from "@/store/loader";

const ROLES: { value: AppRole; label: string }[] = [
  { value: "employee", label: "Employee" },
  { value: "hr_manager", label: "HR Manager" },
  { value: "hr_payroll_user", label: "Payroll User" },
  { value: "hr_payroll_manager", label: "Payroll Manager" },
  { value: "company_admin", label: "Company Admin" },
  { value: "admin", label: "Platform Admin" },
];

const STATUSES: { value: UserAccountStatus; label: string }[] = [
  { value: "invited", label: "Invited" },
  { value: "pending_approval", label: "Pending approval" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

function UserForm({
  user,
  currentUserId,
  onDone,
}: {
  user?: DirectoryUser;
  currentUserId: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const start = useAppLoader((state) => state.start);
  const stop = useAppLoader((state) => state.stop);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const editingSelf = user?.id === currentUserId;

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
        onDone();
        router.refresh();
      }}
    >
      {user ? <input type="hidden" name="id" value={user.id} /> : null}
      <Field>
        <Label htmlFor="username">Username</Label>
        <Input id="username" name="username" required defaultValue={user?.username ?? ""} />
      </Field>
      <Field>
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required={!user}
          readOnly={Boolean(user)}
          defaultValue={user?.work_email ?? ""}
          className={user ? "bg-white/60 text-pp-muted" : undefined}
        />
      </Field>
      <Field>
        <Label htmlFor="full_name">Employee name</Label>
        <Input id="full_name" name="full_name" defaultValue={user?.full_name ?? ""} />
      </Field>
      <Field>
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          name="role"
          defaultValue={user?.role ?? "employee"}
          disabled={editingSelf}
          className="h-10 rounded-pp border border-pp-border bg-white/80 px-3 text-sm text-pp-text outline-none focus:border-pp-primary disabled:text-pp-muted"
        >
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        {editingSelf ? (
          <p className="mt-1 text-[12px] text-pp-muted">You cannot change your own role.</p>
        ) : null}
      </Field>
      <Field>
        <Label htmlFor="account_status">Status</Label>
        <select
          id="account_status"
          name="account_status"
          defaultValue={user?.account_status ?? "invited"}
          className="h-10 rounded-pp border border-pp-border bg-white/80 px-3 text-sm text-pp-text outline-none focus:border-pp-primary"
        >
          {STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </Field>
      {user ? null : (
        <p className="sm:col-span-2 text-[13px] text-pp-muted">
          The user joins your company automatically. An invite is sent to the work email. They fill
          in their details; you approve them under Approvals. They cannot assign themselves a role.
        </p>
      )}
      {error ? <p className="sm:col-span-2 text-[13px] text-pp-danger">{error}</p> : null}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : user ? "Save user" : "Create user and send invite"}
        </Button>
      </div>
    </form>
  );
}

export function UsersWorkspace({
  users,
  currentUserId,
}: {
  users: DirectoryUser[];
  currentUserId: string;
}) {
  const [view, setView] = useState<"table" | "list">("table");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<DirectoryUser | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((user) => {
      if (role && user.role !== role) {
        return false;
      }
      if (status && user.account_status !== status) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return [user.username, user.full_name, user.work_email, user.roleLabel]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [users, query, role, status]);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button type="button" onClick={() => setCreateOpen(true)}>
          New user
        </Button>
      </div>
      <FilterBar>
        <label className="block min-w-[220px] flex-1">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-pp-muted">
            Search
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-xl border border-pp-border bg-pp-bg/70 px-3 text-[13px] outline-none focus:border-pp-primary focus:bg-pp-surface"
          />
        </label>
        <label className="block min-w-[160px]">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-pp-muted">
            Role
          </span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="h-10 w-full rounded-xl border border-pp-border bg-pp-bg/70 px-3 text-[13px] outline-none focus:border-pp-primary"
          >
            <option value="">All</option>
            {ROLES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-[160px]">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-pp-muted">
            Status
          </span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 w-full rounded-xl border border-pp-border bg-pp-bg/70 px-3 text-[13px] outline-none focus:border-pp-primary"
          >
            <option value="">All</option>
            {STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <div className="ml-auto flex h-10 items-center gap-1 self-end rounded-xl border border-pp-border bg-pp-bg/70 p-1">
          <button
            type="button"
            onClick={() => setView("table")}
            className={cn("rounded-lg p-1.5", view === "table" ? "bg-white text-pp-primary" : "text-pp-muted")}
            aria-label="Table view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn("rounded-lg p-1.5", view === "list" ? "bg-white text-pp-primary" : "text-pp-muted")}
            aria-label="List view"
          >
            <ListIcon className="h-4 w-4" />
          </button>
        </div>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState
          title="No users match"
          description="Create a user to send an invite. They complete their details, then you approve access."
          action={
            <Button type="button" onClick={() => setCreateOpen(true)}>
              New user
            </Button>
          }
        />
      ) : view === "table" ? (
        <DataTable headers={["Username", "Employee name", "Work mail", "Role", "Status", ""]}>
          {filtered.map((user) => (
            <DataRow key={user.id}>
              <DataCell>{user.username || "—"}</DataCell>
              <DataCell>{user.full_name || "—"}</DataCell>
              <DataCell>{user.work_email || "—"}</DataCell>
              <DataCell>{user.roleLabel}</DataCell>
              <DataCell>
                <StatusBadge status={user.account_status} />
              </DataCell>
              <DataCell className="text-right">
                <Button type="button" size="sm" variant="secondary" onClick={() => setEditing(user)}>
                  Edit
                </Button>
              </DataCell>
            </DataRow>
          ))}
        </DataTable>
      ) : (
        <div className="divide-y divide-pp-border overflow-hidden rounded-2xl border border-pp-border bg-pp-surface">
          {filtered.map((user) => (
            <div key={user.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-[140px] flex-1">
                <p className="text-[13px] font-medium">{user.username || "—"}</p>
                <p className="text-[12px] text-pp-muted">{user.full_name || "No employee name yet"}</p>
              </div>
              <p className="min-w-[180px] text-[13px] text-pp-muted">{user.work_email || "—"}</p>
              <p className="text-[13px]">{user.roleLabel}</p>
              <StatusBadge status={user.account_status} />
              <Button type="button" size="sm" variant="secondary" onClick={() => setEditing(user)}>
                Edit
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New user"
        description="Assign the role and status. The user joins your company and receives an invite."
      >
        <UserForm currentUserId={currentUserId} onDone={() => setCreateOpen(false)} />
      </Modal>
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit user"
        description="Only a platform admin can change roles. Company stays yours."
      >
        {editing ? (
          <UserForm
            user={editing}
            currentUserId={currentUserId}
            onDone={() => setEditing(null)}
          />
        ) : null}
      </Modal>
    </>
  );
}
