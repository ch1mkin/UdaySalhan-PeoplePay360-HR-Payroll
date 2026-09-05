"use client";

import { DualRecordView, RecordCard } from "@/components/ui/record-views";
import { DataCell } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export type ScheduleRow = {
  id: string;
  name: string;
  timezone?: string | null;
  days_per_week: number | string;
  hours_per_week: number | string;
  is_active: boolean;
  calendar_type?: string | null;
};

function calendarLabel(value?: string | null) {
  if (value === "flexible") {
    return "Flexible";
  }
  if (value === "shift") {
    return "Shift";
  }
  return "Standard";
}

export function SchedulesWorkspace({
  schedules,
  companyName,
}: {
  schedules: ScheduleRow[];
  companyName: string;
}) {
  return (
    <DualRecordView
      items={schedules}
      idOf={(item) => item.id}
      searchText={(item) => `${item.name} ${calendarLabel(item.calendar_type)}`}
      statusOf={(item) => (item.is_active ? "active" : "archived")}
      statusOptions={[
        { value: "active", label: "Active" },
        { value: "archived", label: "Archived" },
      ]}
      tableHeaders={["Name", "Calendar type", "Days/week", "Hours/week", "Company", "Status"]}
      hrefOf={(item) => `/app/schedules/${item.id}`}
      renderTableCells={(item) => (
        <>
          <DataCell>{item.name}</DataCell>
          <DataCell>{calendarLabel(item.calendar_type)}</DataCell>
          <DataCell>{item.days_per_week}</DataCell>
          <DataCell>{item.hours_per_week}</DataCell>
          <DataCell>{companyName}</DataCell>
          <DataCell>
            <StatusBadge status={item.is_active ? "active" : "archived"} />
          </DataCell>
        </>
      )}
      renderKanbanCard={(item) => (
        <RecordCard
          title={item.name}
          subtitle={`${calendarLabel(item.calendar_type)} · ${item.days_per_week} days`}
          meta={`${item.hours_per_week} hours / week`}
          badge={<StatusBadge status={item.is_active ? "active" : "archived"} />}
        />
      )}
      emptyTitle="No working schedules"
      emptyDescription="Create a weekly pattern, then assign it on an employee or contract."
      emptyAction={<Button href="/app/schedules/new">New schedule</Button>}
    />
  );
}
