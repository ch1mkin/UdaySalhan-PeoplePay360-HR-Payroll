"use client";

import { DualRecordView, RecordCard } from "@/components/ui/record-views";
import { DataCell } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

export type RuleRow = {
  id: string;
  name: string;
  code: string;
  sequence: number;
  category: string;
  calculation_method: string;
  is_active: boolean;
};

export function RulesWorkspace({ rules }: { rules: RuleRow[] }) {
  return (
    <DualRecordView
      items={rules}
      idOf={(item) => item.id}
      searchText={(item) => `${item.name} ${item.code} ${item.category} ${item.calculation_method}`}
      statusOf={(item) => item.category}
      statusLabel="Category"
      statusOptions={[
        { value: "basic", label: "Basic" },
        { value: "allowance", label: "Allowance" },
        { value: "deduction", label: "Deduction" },
      ]}
      tableHeaders={["Seq", "Name", "Code", "Category", "Method", "Status"]}
      renderTableCells={(item) => (
        <>
          <DataCell>{item.sequence}</DataCell>
          <DataCell>{item.name}</DataCell>
          <DataCell>{item.code}</DataCell>
          <DataCell className="capitalize">{item.category}</DataCell>
          <DataCell className="capitalize">{item.calculation_method}</DataCell>
          <DataCell>
            <StatusBadge status={item.is_active ? "active" : "archived"} />
          </DataCell>
        </>
      )}
      renderKanbanCard={(item) => (
        <RecordCard
          title={item.name}
          subtitle={`${item.code} · ${item.calculation_method}`}
          meta={`Seq ${item.sequence}`}
          badge={<StatusBadge status={item.is_active ? "active" : "archived"} />}
        />
      )}
      emptyTitle="No salary rules"
      emptyDescription="Rules belong to a salary structure and are applied in sequence during compute."
    />
  );
}
