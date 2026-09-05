"use client";

import { DualRecordView, RecordCard } from "@/components/ui/record-views";
import { DataCell } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/form-section";
import { NewEmployeeButton } from "@/components/employees/employee-form";

export type EmployeeRow = {
  id: string;
  first_name: string;
  last_name: string;
  job_position: string | null;
  employment_status: string;
  work_email: string | null;
  employee_number: string;
  work_location?: string | null;
};

export function EmployeesWorkspace({
  employees,
  schedules,
}: {
  employees: EmployeeRow[];
  schedules: { id: string; name: string }[];
}) {
  return (
    <DualRecordView
      items={employees}
      idOf={(item) => item.id}
      searchText={(item) =>
        [item.first_name, item.last_name, item.job_position, item.work_email, item.employee_number].join(" ")
      }
      statusOf={(item) => item.employment_status}
      statusOptions={[
        { value: "draft", label: "Draft" },
        { value: "active", label: "Active" },
        { value: "on_leave", label: "On leave" },
        { value: "terminated", label: "Terminated" },
      ]}
      tableHeaders={["Employee", "Number", "Job Position", "Email", "Status"]}
      hrefOf={(item) => `/app/employees/${item.id}`}
      renderTableCells={(item) => {
        const name = `${item.first_name} ${item.last_name}`;
        return (
          <>
            <DataCell>
              <span className="flex items-center gap-2">
                <Avatar name={name} />
                {name}
              </span>
            </DataCell>
            <DataCell>{item.employee_number}</DataCell>
            <DataCell>{item.job_position || "—"}</DataCell>
            <DataCell>{item.work_email || "—"}</DataCell>
            <DataCell>
              <StatusBadge status={item.employment_status} />
            </DataCell>
          </>
        );
      }}
      renderKanbanCard={(item) => (
        <RecordCard
          title={`${item.first_name} ${item.last_name}`}
          subtitle={item.job_position || item.work_email || "No job title"}
          meta={item.employee_number}
          badge={<StatusBadge status={item.employment_status} />}
        />
      )}
      emptyTitle="No employees yet"
      emptyDescription="Add people here. They will then appear in contracts, attendance and payroll."
      emptyAction={<NewEmployeeButton schedules={schedules} />}
    />
  );
}
