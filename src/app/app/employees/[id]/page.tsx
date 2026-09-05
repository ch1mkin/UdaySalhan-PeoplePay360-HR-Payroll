import { notFound } from "next/navigation";
import { requireModule } from "@/lib/auth/access";
import {
  getEmployeeRecord,
  listEmployeeAllocations,
  listEmployeeContracts,
  listEmployeeTimeOff,
  listEmployees,
  listWorkingSchedules,
} from "@/lib/data/hr";
import { listAttendanceDays } from "@/lib/actions/attendance";
import { PageContainer, PageHeader, Panel } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataCell, DataRow, DataTable } from "@/components/ui/data-table";
import { MoneyDisplay } from "@/components/ui/stat-card";
import { AttendanceCalendar } from "@/components/attendance/attendance-calendar";
import { NewContractButton } from "@/components/contracts/contract-form";
import { personName } from "@/lib/format/names";
import { EmptyState } from "@/components/ui/empty-state";

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await requireModule("employees");
  const { id } = await params;
  const employee = await getEmployeeRecord(id);
  if (!employee) {
    notFound();
  }

  const [contracts, timeOff, allocations, schedules, colleagues, days] = await Promise.all([
    listEmployeeContracts(employee.id),
    listEmployeeTimeOff(employee.id),
    listEmployeeAllocations(employee.id),
    listWorkingSchedules(access.companyId),
    listEmployees(access.companyId),
    employee.user_id ? listAttendanceDays(employee.user_id) : Promise.resolve([]),
  ]);

  const name = `${employee.first_name} ${employee.last_name}`;
  const scheduleName = schedules.find((row) => row.id === employee.working_schedule_id)?.name;

  return (
    <PageContainer>
      <PageHeader
        title={name}
        description="HR details and related contracts, attendance, time off and allocations."
        actions={
          <NewContractButton
            employeeId={employee.id}
            employees={colleagues.map((row) => ({
              id: row.id,
              first_name: row.first_name,
              last_name: row.last_name,
            }))}
            schedules={schedules.map((row) => ({ id: row.id, name: row.name }))}
          />
        }
      />

      <Panel className="mb-5">
        <h2 className="mb-4 text-[16px] font-semibold">HR details</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Employee number" value={employee.employee_number} />
          <Detail label="Work email" value={employee.work_email || "—"} />
          <Detail label="Phone" value={employee.phone || "—"} />
          <Detail label="Job position" value={employee.job_position || "—"} />
          <Detail label="Work location" value={employee.work_location || "—"} />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-pp-muted">Status</p>
            <div className="mt-1">
              <StatusBadge status={employee.employment_status} />
            </div>
          </div>
          <Detail label="Hire date" value={employee.hire_date || "—"} />
          <Detail label="Working schedule" value={scheduleName || "—"} />
        </div>
      </Panel>

      <Panel className="mb-5">
        <h2 className="mb-4 text-[16px] font-semibold">Contracts</h2>
        {contracts.length === 0 ? (
          <EmptyState
            title="No contracts"
            description="This person can have several contracts over time. Payroll picks the one that covers the period."
            action={
              <NewContractButton
                employeeId={employee.id}
                employees={colleagues.map((row) => ({
                  id: row.id,
                  first_name: row.first_name,
                  last_name: row.last_name,
                }))}
                schedules={schedules.map((row) => ({ id: row.id, name: row.name }))}
              />
            }
          />
        ) : (
          <DataTable headers={["Name", "Start", "End", "Wage", "Status"]}>
            {contracts.map((row) => (
              <DataRow key={row.id}>
                <DataCell>{row.name || "—"}</DataCell>
                <DataCell>{row.start_date}</DataCell>
                <DataCell>{row.end_date || "Open"}</DataCell>
                <DataCell>
                  <MoneyDisplay amount={Number(row.wage)} /> {row.wage_type}
                </DataCell>
                <DataCell>
                  <StatusBadge status={row.status} />
                </DataCell>
              </DataRow>
            ))}
          </DataTable>
        )}
      </Panel>

      <Panel className="mb-5">
        <h2 className="mb-4 text-[16px] font-semibold">Attendance</h2>
        {employee.user_id ? (
          <AttendanceCalendar userId={employee.user_id} days={days} canEdit />
        ) : (
          <p className="text-[13px] text-pp-muted">
            This employee is not linked to a login, so there is no attendance calendar yet.
          </p>
        )}
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 text-[16px] font-semibold">Time off</h2>
          {timeOff.length === 0 ? (
            <p className="text-[13px] text-pp-muted">No time off requests.</p>
          ) : (
            <DataTable headers={["Type", "From", "To", "Status"]}>
              {timeOff.map((row) => (
                <DataRow key={row.id}>
                  <DataCell>{personName(row.time_off_types)}</DataCell>
                  <DataCell>{row.start_date}</DataCell>
                  <DataCell>{row.end_date}</DataCell>
                  <DataCell>
                    <StatusBadge status={row.status} />
                  </DataCell>
                </DataRow>
              ))}
            </DataTable>
          )}
        </Panel>
        <Panel>
          <h2 className="mb-4 text-[16px] font-semibold">Allocations</h2>
          {allocations.length === 0 ? (
            <p className="text-[13px] text-pp-muted">No leave allocations.</p>
          ) : (
            <DataTable headers={["Type", "Allocated", "Taken", "Remaining", "Status"]}>
              {allocations.map((row) => (
                <DataRow key={row.id}>
                  <DataCell>{personName(row.time_off_types)}</DataCell>
                  <DataCell>{row.allocated}</DataCell>
                  <DataCell>{row.taken}</DataCell>
                  <DataCell>{row.remaining}</DataCell>
                  <DataCell>
                    <StatusBadge status={row.status} />
                  </DataCell>
                </DataRow>
              ))}
            </DataTable>
          )}
        </Panel>
      </div>
    </PageContainer>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-pp-muted">{label}</p>
      <p className="mt-1 text-[14px] text-pp-text">{value}</p>
    </div>
  );
}
