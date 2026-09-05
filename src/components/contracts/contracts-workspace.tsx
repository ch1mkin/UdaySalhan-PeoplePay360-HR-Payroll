"use client";

import { DualRecordView, RecordCard } from "@/components/ui/record-views";
import { DataCell } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/stat-card";
import { personName } from "@/lib/format/names";
import { NewContractButton } from "@/components/contracts/contract-form";

export type ContractRow = {
  id: string;
  name: string | null;
  start_date: string;
  end_date: string | null;
  wage: number | string;
  status: string;
  employee_id: string;
  employees: unknown;
};

export function ContractsWorkspace({
  contracts,
  employees,
  schedules,
}: {
  contracts: ContractRow[];
  employees: { id: string; first_name: string; last_name: string }[];
  schedules: { id: string; name: string }[];
}) {
  return (
    <DualRecordView
      items={contracts}
      idOf={(item) => item.id}
      searchText={(item) => `${personName(item.employees)} ${item.name ?? ""} ${item.status}`}
      statusOf={(item) => item.status}
      statusOptions={[
        { value: "draft", label: "Draft" },
        { value: "open", label: "Open" },
        { value: "close_to_expire", label: "Close to expire" },
        { value: "expired", label: "Expired" },
        { value: "cancelled", label: "Cancelled" },
      ]}
      tableHeaders={["Employee", "Contract", "Start", "End", "Wage", "Status"]}
      hrefOf={(item) => `/app/employees/${item.employee_id}`}
      renderTableCells={(item) => (
        <>
          <DataCell>{personName(item.employees)}</DataCell>
          <DataCell>{item.name || "—"}</DataCell>
          <DataCell>{item.start_date}</DataCell>
          <DataCell>{item.end_date || "—"}</DataCell>
          <DataCell>
            <MoneyDisplay amount={Number(item.wage)} />
          </DataCell>
          <DataCell>
            <StatusBadge status={item.status} />
          </DataCell>
        </>
      )}
      renderKanbanCard={(item) => (
        <RecordCard
          title={item.name || "Contract"}
          subtitle={personName(item.employees)}
          meta={`${item.start_date} → ${item.end_date || "open"}`}
          badge={<StatusBadge status={item.status} />}
        />
      )}
      emptyTitle="No contracts"
      emptyDescription="Create a contract after adding an employee. Payroll uses the contract that covers the pay period."
      emptyAction={<NewContractButton employees={employees} schedules={schedules} />}
    />
  );
}
