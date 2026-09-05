import { requireModule } from "@/lib/auth/access";
import { listSalaryStructures } from "@/lib/data/hr";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar, SearchInput, SelectFilter } from "@/components/ui/filter-bar";
import { DataCell, DataRow, DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function StructuresPage() {
  const access = await requireModule("structures");
  const structures = await listSalaryStructures(access.companyId);

  return (
    <PageContainer>
      <PageHeader
        title="Salary Structures"
        description="Groups of ordered salary rules used to compute payslips."
      />
      <FilterBar>
        <SearchInput label="Search" />
        <SelectFilter name="status" label="Status">
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </SelectFilter>
      </FilterBar>
      {structures.length === 0 ? (
        <EmptyState
          title="No salary structures"
          description="Add a structure, then attach rules. Payroll will use them instead of hardcoded amounts."
        />
      ) : (
        <DataTable headers={["Name", "Code", "Status"]}>
          {structures.map((row) => (
            <DataRow key={row.id}>
              <DataCell>{row.name}</DataCell>
              <DataCell>{row.code || "—"}</DataCell>
              <DataCell>
                <StatusBadge status={row.is_active ? "active" : "draft"} />
              </DataCell>
            </DataRow>
          ))}
        </DataTable>
      )}
    </PageContainer>
  );
}
