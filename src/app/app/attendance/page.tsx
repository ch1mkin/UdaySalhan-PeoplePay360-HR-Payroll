import { requireModule } from "@/lib/auth/access";
import { listAttendance } from "@/lib/data/hr";
import { listAttendanceDays } from "@/lib/actions/attendance";
import { PageContainer, PageHeader, Panel } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { DataCell, DataRow, DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { personName } from "@/lib/format/names";
import { AttendanceCalendar } from "@/components/attendance/attendance-calendar";
import { isPlatformAdmin } from "@/lib/auth/access";

export default async function AttendancePage() {
  const access = await requireModule("attendance");
  const [days, records] = await Promise.all([
    listAttendanceDays(access.userId),
    isPlatformAdmin(access.role) || access.role === "hr_manager" || access.role === "company_admin"
      ? listAttendance(access.companyId)
      : Promise.resolve([]),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Attendance"
        description="Mark the calendar. Coloured dots show present, late, absent and other statuses."
      />
      <Panel className="mb-5">
        <AttendanceCalendar userId={access.userId} days={days} canEdit />
      </Panel>
      {records.length === 0 ? (
        isPlatformAdmin(access.role) ? (
          <EmptyState
            title="No company records yet"
            description="When people mark attendance, their days also appear here."
          />
        ) : null
      ) : (
        <DataTable headers={["Employee", "Check in", "Check out", "Hours", "Status"]}>
          {records.map((row) => (
            <DataRow key={row.id}>
              <DataCell>{personName(row.employees)}</DataCell>
              <DataCell>{new Date(row.check_in).toLocaleString("en-IN")}</DataCell>
              <DataCell>
                {row.check_out ? new Date(row.check_out).toLocaleString("en-IN") : "—"}
              </DataCell>
              <DataCell>{row.worked_hours}</DataCell>
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
