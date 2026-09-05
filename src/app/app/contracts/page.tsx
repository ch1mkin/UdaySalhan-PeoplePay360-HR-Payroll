import { requireModule } from "@/lib/auth/access";
import { listContracts } from "@/lib/data/hr";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { DataCell, DataRow, DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/stat-card";
import { personName } from "@/lib/format/names";

export default async function ContractsPage() {
  const access = await requireModule("contracts");
  const contracts = await listContracts(access.companyId);

  return (
    <PageContainer>
      <PageHeader title="Contracts" description="Employment contracts and period applicability." />
      {contracts.length === 0 ? (
        <EmptyState
          title="No contracts"
          description="Create a contract after adding an employee. Payroll uses the contract that covers the pay period."
        />
      ) : (
        <DataTable headers={["Employee", "Contract", "Start", "End", "Wage", "Status"]}>
          {contracts.map((row) => (
            <DataRow key={row.id}>
              <DataCell>{personName(row.employees)}</DataCell>
              <DataCell>{row.name || "—"}</DataCell>
              <DataCell>{row.start_date}</DataCell>
              <DataCell>{row.end_date || "—"}</DataCell>
              <DataCell>
                <MoneyDisplay amount={Number(row.wage)} />
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
