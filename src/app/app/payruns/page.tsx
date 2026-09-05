import { requireModule } from "@/lib/auth/access";
import { listPayruns } from "@/lib/data/hr";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DataCell, DataRow, DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function PayrunsPage() {
  const access = await requireModule("payruns");
  const payruns = await listPayruns(access.companyId);

  return (
    <PageContainer>
      <PageHeader
        title="Payruns"
        description="Draft, compute, validate and mark paid."
        actions={<Button disabled>Create Payrun</Button>}
      />
      {payruns.length === 0 ? (
        <EmptyState
          title="No payruns"
          description="Create a payrun after employees have contracts and salary structures."
        />
      ) : (
        <DataTable headers={["Payrun", "Period", "Status"]}>
          {payruns.map((row) => (
            <DataRow key={row.id}>
              <DataCell>{row.name}</DataCell>
              <DataCell>
                {row.period_start} – {row.period_end}
              </DataCell>
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
