import { requireModule } from "@/lib/auth/access";
import { listEmployees, listWorkingSchedules } from "@/lib/data/hr";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { NewEmployeeButton } from "@/components/employees/employee-form";
import { EmployeesWorkspace } from "@/components/employees/employees-workspace";

export default async function EmployeesPage() {
  const access = await requireModule("employees");
  const [employees, schedules] = await Promise.all([
    listEmployees(access.companyId),
    listWorkingSchedules(access.companyId),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Employees"
        description="Kanban or list. Open a person for HR details, contracts, attendance, time off and allocations."
        actions={<NewEmployeeButton schedules={schedules.map((row) => ({ id: row.id, name: row.name }))} />}
      />
      <EmployeesWorkspace
        employees={employees}
        schedules={schedules.map((row) => ({ id: row.id, name: row.name }))}
      />
    </PageContainer>
  );
}
