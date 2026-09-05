"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { saveAttendanceDay, type AttendanceDay } from "@/lib/actions/attendance";
import type { AttendanceStatus } from "@/types/hr";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_META: { value: AttendanceStatus; label: string; dot: string }[] = [
  { value: "present", label: "Present", dot: "bg-pp-secondary" },
  { value: "late", label: "Late", dot: "bg-pp-warning" },
  { value: "absent", label: "Absent", dot: "bg-pp-danger" },
  { value: "overtime", label: "Overtime", dot: "bg-pp-primary" },
  { value: "early_departure", label: "Left early", dot: "bg-[#e07a3d]" },
  { value: "missing_checkout", label: "No checkout", dot: "bg-pp-gray" },
];

function todayISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
}

function cellsFor(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: string | null; day: number | null }> = [];
  for (let i = 0; i < startPad; i += 1) {
    cells.push({ date: null, day: null });
  }
  for (let day = 1; day <= days; day += 1) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ date, day });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: null, day: null });
  }
  return cells;
}

export function AttendanceCalendar({
  userId,
  days,
  canEdit,
}: {
  userId: string;
  days: AttendanceDay[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selected, setSelected] = useState(todayISO());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = todayISO();

  const byDate = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    for (const day of days) {
      map.set(day.date, day.status);
    }
    return map;
  }, [days]);

  const grid = cellsFor(cursor.year, cursor.month);
  const selectedStatus = byDate.get(selected);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-pp-primary">Today</p>
          <p className="text-[20px] font-semibold tracking-tight text-pp-text">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "Asia/Kolkata",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-pp border border-pp-border p-1.5 text-pp-muted hover:bg-pp-bg hover:text-pp-text"
            onClick={() =>
              setCursor((value) =>
                value.month === 0 ? { year: value.year - 1, month: 11 } : { year: value.year, month: value.month - 1 },
              )
            }
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="min-w-[150px] text-center text-[14px] font-medium">{monthLabel(cursor.year, cursor.month)}</p>
          <button
            type="button"
            className="rounded-pp border border-pp-border p-1.5 text-pp-muted hover:bg-pp-bg hover:text-pp-text"
            onClick={() =>
              setCursor((value) =>
                value.month === 11 ? { year: value.year + 1, month: 0 } : { year: value.year, month: value.month + 1 },
              )
            }
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-pp-muted">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {grid.map((cell, index) => {
          if (!cell.date || cell.day === null) {
            return <div key={`empty-${index}`} className="h-14 rounded-pp" />;
          }
          const status = byDate.get(cell.date);
          const meta = STATUS_META.find((item) => item.value === status);
          const isToday = cell.date === today;
          const isSelected = cell.date === selected;
          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => setSelected(cell.date!)}
              className={cn(
                "flex h-14 flex-col items-center justify-center rounded-pp border text-[13px] transition-colors",
                isSelected ? "border-pp-primary bg-pp-primary-light" : "border-transparent hover:bg-pp-bg",
                isToday && !isSelected ? "border-pp-primary/50" : "",
              )}
            >
              <span className={cn("leading-none", isToday ? "font-semibold text-pp-primary" : "text-pp-text")}>
                {cell.day}
              </span>
              <span className={cn("mt-1.5 h-2 w-2 rounded-full", meta?.dot ?? "bg-transparent")} />
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {STATUS_META.map((item) => (
          <span key={item.value} className="inline-flex items-center gap-1.5 text-[12px] text-pp-muted">
            <span className={cn("h-2 w-2 rounded-full", item.dot)} />
            {item.label}
          </span>
        ))}
      </div>

      {canEdit ? (
        <div className="mt-5 rounded-pp border border-pp-primary/25 bg-pp-primary-light/40 p-4">
          <p className="text-[13px] font-medium text-pp-text">
            Mark {new Date(`${selected}T12:00:00+05:30`).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
            {selectedStatus ? ` · currently ${selectedStatus.replaceAll("_", " ")}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {STATUS_META.map((item) => (
              <Button
                key={item.value}
                type="button"
                size="sm"
                variant={selectedStatus === item.value ? "primary" : "secondary"}
                disabled={pending}
                onClick={async () => {
                  setPending(true);
                  setError(null);
                  const form = new FormData();
                  form.set("user_id", userId);
                  form.set("date", selected);
                  form.set("status", item.value);
                  const result = await saveAttendanceDay(form);
                  setPending(false);
                  if (result.error) {
                    setError(result.error);
                    return;
                  }
                  router.refresh();
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>
          {error ? <p className="mt-2 text-[13px] text-pp-danger">{error}</p> : null}
        </div>
      ) : (
        <p className="mt-4 text-[13px] text-pp-muted">
          {selectedStatus
            ? `${selected} is marked ${selectedStatus.replaceAll("_", " ")}.`
            : "No attendance marked for the selected day."}
        </p>
      )}
    </div>
  );
}
