"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveUser, declineUser, type DirectoryUser } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { DataCell, DataRow, DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";

function formatWhen(value: string | null) {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

export function ApprovalsList({
  pending,
  history,
}: {
  pending: DirectoryUser[];
  history: DirectoryUser[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {error ? <p className="text-[13px] text-pp-danger">{error}</p> : null}

      <section>
        <h2 className="mb-3 text-[16px] font-semibold">Waiting</h2>
        {pending.length === 0 ? (
          <EmptyState
            title="No approvals waiting"
            description="When invited people submit their details, they appear here for you to approve."
          />
        ) : (
          <DataTable headers={["Username", "Employee name", "Work mail", "Role", "Status", ""]}>
            {pending.map((user) => (
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
        )}
      </section>

      <section>
        <h2 className="mb-3 text-[16px] font-semibold">History</h2>
        {history.length === 0 ? (
          <EmptyState
            title="No past approvals"
            description="Approved and declined requests will stay listed here."
          />
        ) : (
          <DataTable headers={["Username", "Employee name", "Work mail", "Decision", "When", "By"]}>
            {history.map((user) => {
              const declined = user.account_status === "suspended";
              return (
                <DataRow key={user.id}>
                  <DataCell>{user.username || "—"}</DataCell>
                  <DataCell>{user.full_name || "—"}</DataCell>
                  <DataCell>{user.work_email || "—"}</DataCell>
                  <DataCell>
                    <StatusBadge status={declined ? "suspended" : "approved"} />
                  </DataCell>
                  <DataCell>{formatWhen(declined ? user.updated_at : user.approved_at)}</DataCell>
                  <DataCell>{user.approvedByName || (declined ? "—" : "—")}</DataCell>
                </DataRow>
              );
            })}
          </DataTable>
        )}
      </section>
    </div>
  );
}
