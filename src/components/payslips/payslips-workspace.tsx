"use client";

import { DualRecordView, RecordCard } from "@/components/ui/record-views";
import { DataCell } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/stat-card";
import { personName } from "@/lib/format/names";

export type PayslipRow = {
  id: string;
  period_start: string;
  period_end: string;
  net: number | string | null;
  gross: number | string | null;
  status: string;
  employees: unknown;
};

export function PayslipsWorkspace({ payslips }: { payslips: PayslipRow[] }) {
  return (
    <DualRecordView
      items={payslips}
      idOf={(item) => item.id}
      searchText={(item) => `${personName(item.employees)} ${item.period_start} ${item.status}`}
      statusOf={(item) => item.status}
      statusOptions={[
        { value: "draft", label: "Draft" },
        { value: "computed", label: "Computed" },
        { value: "validated", label: "Validated" },
        { value: "paid", label: "Paid" },
        { value: "cancelled", label: "Cancelled" },
      ]}
      tableHeaders={["Employee", "Period", "Gross", "Net", "Status"]}
      renderTableCells={(item) => (
        <>
          <DataCell>{personName(item.employees)}</DataCell>
          <DataCell>
            {item.period_start} – {item.period_end}
          </DataCell>
          <DataCell>
            <MoneyDisplay amount={Number(item.gross)} />
          </DataCell>
          <DataCell>
            <MoneyDisplay amount={Number(item.net)} />
          </DataCell>
          <DataCell>
            <StatusBadge status={item.status} />
          </DataCell>
        </>
      )}
      renderKanbanCard={(item) => (
        <RecordCard
          title={personName(item.employees)}
          subtitle={`${item.period_start} – ${item.period_end}`}
          meta={`Net ${Number(item.net || 0)}`}
          badge={<StatusBadge status={item.status} />}
        />
      )}
      emptyTitle="No payslips found"
      emptyDescription="Payslips generated during payroll processing will appear here."
    />
  );
}
