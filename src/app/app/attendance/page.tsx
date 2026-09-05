import { requireModule, isPlatformAdmin } from "@/lib/auth/access";
import { canSetupAttendanceHours } from "@/lib/auth/permissions";
import { listAttendance } from "@/lib/data/hr";
import { getCompanyWorkHours, listAttendanceDays } from "@/lib/actions/attendance";
import { PageContainer, PageHeader, Panel } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { AttendanceCalendar } from "@/components/attendance/attendance-calendar";
import { AttendanceRecordsWorkspace } from "@/components/attendance/attendance-records-workspace";
import { WorkHoursForm } from "@/components/attendance/work-hours-form";

export default async function AttendancePage() {
  const access = await requireModule("attendance");
  const canSetup = canSetupAttendanceHours(access.role);
  const [days, records, hours] = await Promise.all([
    listAttendanceDays(access.userId),
    isPlatformAdmin(access.role) || access.role === "hr_manager" || access.role === "company_admin"
      ? listAttendance(access.companyId)
      : Promise.resolve([]),
    getCompanyWorkHours(access.companyId),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Attendance"
        description="Check in and check out today. Dots follow morning and evening office hours."
      />
      {canSetup ? (
        <Panel className="mb-5">
          <h2 className="mb-1 text-[15px] font-semibold">Office hours</h2>
          <p className="mb-4 text-[13px] text-pp-muted">
            Set the morning and evening times. Late, early leave and overtime use these times.
          </p>
          <WorkHoursForm hours={hours} />
        </Panel>
      ) : null}
      <Panel className="mb-5">
        <AttendanceCalendar days={days} hours={hours} canPunch />
      </Panel>
      {records.length === 0 ? (
        isPlatformAdmin(access.role) ? (
          <EmptyState
            title="No company records yet"
            description="When people check in, their days also appear here."
          />
        ) : null
      ) : (
        <AttendanceRecordsWorkspace records={records} />
      )}
    </PageContainer>
  );
}
