import { requireModule } from "@/lib/auth/access";
import { listAttendance } from "@/lib/data/hr";
import { PageContainer, PageHeader, Panel } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar, SearchInput, SelectFilter } from "@/components/ui/filter-bar";
import { DataCell, DataRow, DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { personName } from "@/lib/format/names";

export default async function AttendancePage() {
  const access = await requireModule("attendance");
  const records = await listAttendance(access.companyId);

  return (
    <PageContainer>
      <PageHeader
        title="Leave & Attendance"
        description="Check-in, worked hours and attendance status."
        actions={
          <Button variant="teal" disabled>
            Check In
          </Button>
        }
      />
      <FilterBar>
        <SearchInput label="Search" />
        <SelectFilter name="status" label="Status">
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="early_departure">Early departure</option>
          <option value="absent">Absent</option>
          <option value="overtime">Overtime</option>
          <option value="missing_checkout">Missing checkout</option>
        </SelectFilter>
      </FilterBar>
      <Panel className="mb-4">
        <p className="text-[13px] text-pp-muted">Today</p>
        <p className="mt-1 text-sm text-pp-text">No active session.</p>
      </Panel>
      {records.length === 0 ? (
        <EmptyState
          title="No attendance records"
          description="Check-ins will appear here once employees start recording time."
        />
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
