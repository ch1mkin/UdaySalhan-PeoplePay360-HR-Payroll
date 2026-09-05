import { requireModule } from "@/lib/auth/access";
import { listTimeOffRequests } from "@/lib/data/hr";
import { PageContainer, PageHeader, Panel } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { TimeOffWorkspace } from "@/components/time-off/time-off-workspace";

export default async function TimeOffPage() {
  const access = await requireModule("time_off");
  const requests = await listTimeOffRequests(access.companyId);

  return (
    <PageContainer>
      <PageHeader
        title="Time Off"
        description="Requests, balances and approvals in kanban or list."
        actions={<Button disabled>Request Time Off</Button>}
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Panel>
          <p className="text-[12px] text-pp-muted">Available</p>
          <p className="mt-1 text-xl font-semibold">—</p>
        </Panel>
        <Panel>
          <p className="text-[12px] text-pp-muted">Used</p>
          <p className="mt-1 text-xl font-semibold">—</p>
        </Panel>
        <Panel>
          <p className="text-[12px] text-pp-muted">Pending</p>
          <p className="mt-1 text-xl font-semibold">
            {requests.filter((row) => row.status === "to_approve" || row.status === "requested").length || "—"}
          </p>
        </Panel>
      </div>
      <TimeOffWorkspace requests={requests} />
    </PageContainer>
  );
}
