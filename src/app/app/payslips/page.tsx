import { requireModule } from "@/lib/auth/access";
import { listPayslips } from "@/lib/data/hr";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
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
