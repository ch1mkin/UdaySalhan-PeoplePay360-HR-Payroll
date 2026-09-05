import { requireModule } from "@/lib/auth/access";
import { listTimeOffRequests } from "@/lib/data/hr";
import { PageContainer, PageHeader, Panel } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar, SearchInput, SelectFilter } from "@/components/ui/filter-bar";
import { DataCell, DataRow, DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { personName } from "@/lib/format/names";

export default async function TimeOffPage() {
  const access = await requireModule("time_off");
  const requests = await listTimeOffRequests(access.companyId);

  return (
    <PageContainer>
      <PageHeader
        title="Time Off"
        description="Requests, balances and approvals."
        actions={
          <Button disabled>Request Time Off</Button>
        }
      />
      <FilterBar>
        <SearchInput label="Search" />
        <SelectFilter name="status" label="Status">
          <option value="requested">Requested</option>
          <option value="to_approve">To approve</option>
          <option value="approved">Approved</option>
          <option value="refused">Refused</option>
        </SelectFilter>
      </FilterBar>
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
      {requests.length === 0 ? (
        <EmptyState
          title="No time off requests"
          description="Submitted leave will show here with approval status and remaining balance."
        />
      ) : (
        <DataTable headers={["Employee", "Type", "From", "To", "Duration", "Status"]}>
          {requests.map((row) => (
            <DataRow key={row.id}>
              <DataCell>{personName(row.employees)}</DataCell>
              <DataCell>{personName(row.time_off_types)}</DataCell>
              <DataCell>{row.start_date}</DataCell>
              <DataCell>{row.end_date}</DataCell>
              <DataCell>{row.duration}</DataCell>
              <DataCell>
                <StatusBadge status={row.status} />
              </DataCell>
            </DataRow>
          ))}
        </DataTable>
      )}
    </PageContainer>
  );
}
