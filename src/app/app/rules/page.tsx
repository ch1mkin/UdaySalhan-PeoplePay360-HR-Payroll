import { requireModule } from "@/lib/auth/access";
import { listSalaryRules } from "@/lib/data/hr";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { DataCell, DataRow, DataTable } from "@/components/ui/data-table";

export default async function RulesPage() {
  const access = await requireModule("rules");
  const rules = await listSalaryRules(access.companyId);

  return (
    <PageContainer>
      <PageHeader
        title="Salary Rules"
        description="Ordered calculation steps: fixed, percentage or formula."
      />
      {rules.length === 0 ? (
        <EmptyState
          title="No salary rules"
          description="Rules belong to a salary structure and are applied in sequence during compute."
        />
      ) : (
        <DataTable headers={["Seq", "Name", "Code", "Category", "Method"]}>
          {rules.map((row) => (
            <DataRow key={row.id}>
              <DataCell>{row.sequence}</DataCell>
              <DataCell>{row.name}</DataCell>
              <DataCell>{row.code}</DataCell>
              <DataCell className="capitalize">{row.category}</DataCell>
              <DataCell className="capitalize">{row.calculation_method}</DataCell>
            </DataRow>
          ))}
        </DataTable>
      )}
    </PageContainer>
  );
}
