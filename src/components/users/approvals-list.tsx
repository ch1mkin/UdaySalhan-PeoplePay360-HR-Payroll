"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveUser, declineUser, type DirectoryUser } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { DataCell, DataRow, DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";

export function ApprovalsList({ users }: { users: DirectoryUser[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  if (users.length === 0) {
    return (
      <EmptyState
        title="No approvals waiting"
        description="When invited people submit their details, they appear here for you to approve."
      />
    );
  }

  return (
    <div>
      {error ? <p className="mb-3 text-[13px] text-pp-danger">{error}</p> : null}
      <DataTable headers={["Username", "Employee name", "Work mail", "Role", "Status", ""]}>
        {users.map((user) => (
          <DataRow key={user.id}>
            <DataCell>{user.username || "—"}</DataCell>
            <DataCell>{user.full_name || "—"}</DataCell>
            <DataCell>{user.work_email || "—"}</DataCell>
            <DataCell>{user.roleLabel}</DataCell>
            <DataCell>
              <StatusBadge status={user.account_status} />
            </DataCell>
            <DataCell>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={busy === user.id}
                  onClick={async () => {
                    setBusy(user.id);
                    setError(null);
                    const result = await approveUser(user.id);
                    setBusy(null);
                    if (result.error) {
                      setError(result.error);
                      return;
                    }
                    router.refresh();
                  }}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  disabled={busy === user.id}
                  onClick={async () => {
                    setBusy(user.id);
                    setError(null);
                    const result = await declineUser(user.id);
                    setBusy(null);
                    if (result.error) {
                      setError(result.error);
                      return;
                    }
                    router.refresh();
                  }}
                >
                  Decline
                </Button>
              </div>
            </DataCell>
          </DataRow>
        ))}
      </DataTable>
    </div>
  );
}
