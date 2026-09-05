"use client";

import { DualRecordView, RecordCard } from "@/components/ui/record-views";
import { DataCell } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

export type PayrunRow = {
  id: string;
  name: string;
  period_start: string;
  period_end: string;
  status: string;
};

export function PayrunsWorkspace({ payruns }: { payruns: PayrunRow[] }) {
  return (
    <DualRecordView
      items={payruns}
      idOf={(item) => item.id}
      searchText={(item) => `${item.name} ${item.period_start} ${item.period_end} ${item.status}`}
      statusOf={(item) => item.status}
      statusOptions={[
        { value: "draft", label: "Draft" },
        { value: "computed", label: "Computed" },
        { value: "validated", label: "Validated" },
        { value: "paid", label: "Paid" },
        { value: "cancelled", label: "Cancelled" },
      ]}
      tableHeaders={["Payrun", "Period", "Status"]}
      renderTableCells={(item) => (
        <>
          <DataCell>{item.name}</DataCell>
          <DataCell>
            {item.period_start} – {item.period_end}
          </DataCell>
          <DataCell>
            <StatusBadge status={item.status} />
          </DataCell>
        </>
      )}
      renderKanbanCard={(item) => (
        <RecordCard
          title={item.name}
          subtitle={`${item.period_start} – ${item.period_end}`}
          badge={<StatusBadge status={item.status} />}
        />
      )}
      emptyTitle="No payruns"
      emptyDescription="Create a payrun after employees have contracts and salary structures."
    />
  );
}
