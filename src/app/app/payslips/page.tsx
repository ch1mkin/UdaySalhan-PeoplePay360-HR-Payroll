import { requireModule } from "@/lib/auth/access";
import { listPayslips } from "@/lib/data/hr";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar, SearchInput, SelectFilter } from "@/components/ui/filter-bar";
import { DataCell, DataRow, DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/stat-card";
import { personName } from "@/lib/format/names";

export default async function PayslipsPage() {
  const access = await requireModule("payslips");
  const payslips = await listPayslips(access.companyId);

  return (
    <PageContainer>
      <PageHeader title="Payslips" description="Payslips generated from salary rules during a payrun." />
      <FilterBar>
        <SearchInput label="Search" />
        <SelectFilter name="status" label="Status">
          <option value="draft">Draft</option>
          <option value="computed">Computed</option>
          <option value="validated">Validated</option>
          <option value="paid">Paid</option>
        </SelectFilter>
      </FilterBar>
      {payslips.length === 0 ? (
        <EmptyState
          title="No payslips found"
          description="Payslips generated during payroll processing will appear here."
        />
      ) : (
        <DataTable headers={["Employee", "Period", "Gross", "Net", "Status"]}>
          {payslips.map((row) => (
            <DataRow key={row.id}>
              <DataCell>{personName(row.employees)}</DataCell>
              <DataCell>
                {row.period_start} – {row.period_end}
              </DataCell>
              <DataCell>
                <MoneyDisplay amount={Number(row.gross)} />
              </DataCell>
              <DataCell>
                <MoneyDisplay amount={Number(row.net)} />
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
