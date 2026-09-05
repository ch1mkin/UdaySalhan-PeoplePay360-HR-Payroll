import { requireModule } from "@/lib/auth/access";
import { listContracts, listEmployees, listWorkingSchedules } from "@/lib/data/hr";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { NewContractButton } from "@/components/contracts/contract-form";
import { ContractsWorkspace } from "@/components/contracts/contracts-workspace";

export default async function ContractsPage() {
  const access = await requireModule("contracts");
  const [contracts, employees, schedules] = await Promise.all([
    listContracts(access.companyId),
    listEmployees(access.companyId),
    listWorkingSchedules(access.companyId),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Contracts"
        description="People can have more than one contract over time. Payroll uses the one that covers the pay period."
        actions={
          <NewContractButton
            employees={employees.map((row) => ({
              id: row.id,
              first_name: row.first_name,
              last_name: row.last_name,
            }))}
            schedules={schedules.map((row) => ({ id: row.id, name: row.name }))}
          />
        }
      />
      <ContractsWorkspace
        contracts={contracts}
        employees={employees.map((row) => ({
          id: row.id,
          first_name: row.first_name,
          last_name: row.last_name,
        }))}
        schedules={schedules.map((row) => ({ id: row.id, name: row.name }))}
      />
    </PageContainer>
  );
}
