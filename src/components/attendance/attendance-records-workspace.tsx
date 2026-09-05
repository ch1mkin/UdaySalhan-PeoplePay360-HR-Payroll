"use client";

import { DualRecordView, RecordCard } from "@/components/ui/record-views";
import { DataCell } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { personName } from "@/lib/format/names";

export type AttendanceRecordRow = {
  id: string;
  check_in: string;
  check_out: string | null;
  worked_hours: number | string | null;
  status: string;
  employees: unknown;
};

function when(value: string) {
  return new Date(value).toLocaleString("en-IN");
}

export function AttendanceRecordsWorkspace({ records }: { records: AttendanceRecordRow[] }) {
  if (records.length === 0) {
    return null;
  }

  return (
    <DualRecordView
      items={records}
      idOf={(item) => item.id}
      searchText={(item) => `${personName(item.employees)} ${item.status}`}
      statusOf={(item) => item.status}
      statusOptions={[
        { value: "present", label: "Present" },
        { value: "late", label: "Late" },
        { value: "early_departure", label: "Early departure" },
        { value: "absent", label: "Absent" },
        { value: "overtime", label: "Overtime" },
        { value: "missing_checkout", label: "Missing checkout" },
      ]}
      tableHeaders={["Employee", "Check in", "Check out", "Hours", "Status"]}
      renderTableCells={(item) => (
        <>
          <DataCell>{personName(item.employees)}</DataCell>
          <DataCell>{when(item.check_in)}</DataCell>
          <DataCell>{item.check_out ? when(item.check_out) : "—"}</DataCell>
          <DataCell>{item.worked_hours}</DataCell>
          <DataCell>
            <StatusBadge status={item.status} />
          </DataCell>
        </>
      )}
      renderKanbanCard={(item) => (
        <RecordCard
          title={personName(item.employees)}
          subtitle={when(item.check_in)}
          meta={`${item.worked_hours ?? 0} hours`}
          badge={<StatusBadge status={item.status} />}
        />
      )}
      emptyTitle="No company records yet"
      emptyDescription="When people mark attendance, their days also appear here."
    />
  );
}
