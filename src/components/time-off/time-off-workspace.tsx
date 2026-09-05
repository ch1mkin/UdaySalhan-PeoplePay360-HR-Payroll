"use client";

import { DualRecordView, RecordCard } from "@/components/ui/record-views";
import { DataCell } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { personName } from "@/lib/format/names";

export type TimeOffRow = {
  id: string;
  start_date: string;
  end_date: string;
  duration: number | string;
  status: string;
  employees: unknown;
  time_off_types: unknown;
};

export function TimeOffWorkspace({ requests }: { requests: TimeOffRow[] }) {
  return (
    <DualRecordView
      items={requests}
      idOf={(item) => item.id}
      searchText={(item) =>
        `${personName(item.employees)} ${personName(item.time_off_types)} ${item.status}`
      }
      statusOf={(item) => item.status}
      statusOptions={[
        { value: "requested", label: "Requested" },
        { value: "to_approve", label: "To approve" },
        { value: "approved", label: "Approved" },
        { value: "refused", label: "Refused" },
      ]}
      tableHeaders={["Employee", "Type", "From", "To", "Duration", "Status"]}
      renderTableCells={(item) => (
        <>
          <DataCell>{personName(item.employees)}</DataCell>
          <DataCell>{personName(item.time_off_types)}</DataCell>
          <DataCell>{item.start_date}</DataCell>
          <DataCell>{item.end_date}</DataCell>
          <DataCell>{item.duration}</DataCell>
          <DataCell>
            <StatusBadge status={item.status} />
          </DataCell>
        </>
      )}
      renderKanbanCard={(item) => (
        <RecordCard
          title={personName(item.employees)}
          subtitle={personName(item.time_off_types)}
          meta={`${item.start_date} → ${item.end_date}`}
          badge={<StatusBadge status={item.status} />}
        />
      )}
      emptyTitle="No time off requests"
      emptyDescription="Submitted leave will show here with approval status and remaining balance."
    />
  );
}
