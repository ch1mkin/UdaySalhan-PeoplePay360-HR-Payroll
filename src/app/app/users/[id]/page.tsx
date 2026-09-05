import { notFound } from "next/navigation";
import { isPlatformAdmin, requireModule } from "@/lib/auth/access";
import { getDirectoryUser } from "@/lib/actions/users";
import { getCompanyWorkHours, listAttendanceDays } from "@/lib/actions/attendance";
import { PageContainer, PageHeader, Panel } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { AttendanceCalendar } from "@/components/attendance/attendance-calendar";
import { roleLabel } from "@/lib/auth/permissions";

function formatWhen(value: string | null) {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await requireModule("users");
  if (!isPlatformAdmin(access.role)) {
    notFound();
  }
  const { id } = await params;
  const user = await getDirectoryUser(id);
  if (!user) {
    notFound();
  }
  const [days, hours] = await Promise.all([
    listAttendanceDays(user.id),
    getCompanyWorkHours(access.companyId),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title={user.full_name || user.username || "User"}
        description="Account details and the same attendance calendar used on Attendance."
      />
      <Panel className="mb-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Detail label="Username" value={user.username || "—"} />
          <Detail label="Work email" value={user.work_email || "—"} />
          <Detail label="Role" value={roleLabel(user.role)} />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-pp-muted">Status</p>
            <div className="mt-1">
              <StatusBadge status={user.account_status} />
            </div>
          </div>
          <Detail label="Approved at" value={formatWhen(user.approved_at)} />
          <Detail label="Approved by" value={user.approvedByName || "—"} />
          <Detail label="Details submitted" value={formatWhen(user.details_submitted_at)} />
          <Detail label="Last updated" value={formatWhen(user.updated_at)} />
        </div>
      </Panel>
      <Panel>
        <h2 className="mb-4 text-[16px] font-semibold">Attendance</h2>
        <AttendanceCalendar days={days} hours={hours} />
      </Panel>
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
