import { requireModule } from "@/lib/auth/access";
import { listEmployees } from "@/lib/data/hr";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar, SearchInput, SelectFilter } from "@/components/ui/filter-bar";
import { DataCell, DataRow, DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/form-section";

export default async function EmployeesPage() {
  const access = await requireModule("employees");
  const employees = await listEmployees(access.companyId);

  return (
    <PageContainer>
      <PageHeader
        title="Employees"
        description="Manage your organization's workforce."
        actions={<Button href="/app/employees/new">New Employee</Button>}
      />
      <FilterBar>
        <SearchInput placeholder="Search employees" />
        <SelectFilter name="department" label="Department" />
        <SelectFilter name="status" label="Status" />
      </FilterBar>
      {employees.length === 0 ? (
        <EmptyState
          title="No employees yet"
          description="Add people here. They will then appear in contracts, attendance and payroll."
          action={<Button href="/app/employees/new">New Employee</Button>}
        />
      ) : (
        <DataTable headers={["Employee", "Job Position", "Email", "Status"]}>
          {employees.map((employee) => {
            const name = `${employee.first_name} ${employee.last_name}`;
            return (
              <DataRow key={employee.id}>
                <DataCell>
                  <span className="flex items-center gap-2">
                    <Avatar name={name} />
                    {name}
                  </span>
                </DataCell>
                <DataCell>{employee.job_position || "—"}</DataCell>
                <DataCell>{employee.work_email || "—"}</DataCell>
                <DataCell>
                  <StatusBadge status={employee.employment_status} />
                </DataCell>
              </DataRow>
            );
          })}
        </DataTable>
      )}
    </PageContainer>
  );
}
