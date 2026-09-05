"use client";

import { DualRecordView, RecordCard } from "@/components/ui/record-views";
import { DataCell } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

export type StructureRow = {
  id: string;
  name: string;
  code: string | null;
  is_active: boolean;
};

export function StructuresWorkspace({ structures }: { structures: StructureRow[] }) {
  return (
    <DualRecordView
      items={structures}
      idOf={(item) => item.id}
      searchText={(item) => `${item.name} ${item.code ?? ""}`}
      statusOf={(item) => (item.is_active ? "active" : "archived")}
      statusOptions={[
        { value: "active", label: "Active" },
        { value: "archived", label: "Archived" },
      ]}
      tableHeaders={["Name", "Code", "Status"]}
      renderTableCells={(item) => (
        <>
          <DataCell>{item.name}</DataCell>
          <DataCell>{item.code || "—"}</DataCell>
          <DataCell>
            <StatusBadge status={item.is_active ? "active" : "archived"} />
          </DataCell>
        </>
      )}
      renderKanbanCard={(item) => (
        <RecordCard
          title={item.name}
          subtitle={item.code || "No code"}
          badge={<StatusBadge status={item.is_active ? "active" : "archived"} />}
        />
      )}
      emptyTitle="No salary structures"
      emptyDescription="Add a structure, then attach rules. Payroll will use them instead of hardcoded amounts."
    />
  );
}
