"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";
import { punchAttendance, type AttendanceDay, type WorkHours } from "@/lib/actions/attendance";
import type { AttendanceStatus } from "@/types/hr";
import { Button } from "@/components/ui/button";
import { formatIstTime, todayISO } from "@/lib/time/ist";
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

function clockLabel(value: Date) {
  return value.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function AttendanceCalendar({
  days,
  hours,
  canPunch = false,
}: {
  days: AttendanceDay[];
  hours: WorkHours;
  canPunch?: boolean;
}) {
  const router = useRouter();
  const today = todayISO();
  const [year, month] = today.split("-").map(Number);
  const cursor = { year, month: month - 1 };
  const [now, setNow] = useState(() => new Date());
  const [pending, setPending] = useState<"in" | "out" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const byDate = useMemo(() => {
    const map = new Map<string, AttendanceDay>();
    for (const day of days) {
      map.set(day.date, day);
    }
    return map;
  }, [days]);

  const grid = cellsFor(cursor.year, cursor.month);
  const todayRecord = byDate.get(today);
  const checkedIn = Boolean(todayRecord?.checkIn);
  const checkedOut = Boolean(todayRecord?.checkOut);

  async function punch(kind: "in" | "out") {
    setPending(kind);
    setError(null);
    setBlocked(null);
    const result = await punchAttendance(kind);
    setPending(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-pp-primary">Today</p>
          <p className="text-[20px] font-semibold tracking-tight text-pp-text">
            {now.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "Asia/Kolkata",
            })}
          </p>
          <p className="mt-1 text-[13px] text-pp-muted">
            Office hours {hours.start} – {hours.end} IST · {clockLabel(now)}
          </p>
        </div>
        <p className="min-w-[150px] text-right text-[14px] font-medium">{monthLabel(cursor.year, cursor.month)}</p>
      </div>

      {canPunch ? (
        <div className="mb-5 rounded-pp border-2 border-pp-primary bg-white p-4">
          <p className="text-[13px] font-medium text-pp-text">
            Check in and check out are only for today.
            {todayRecord?.status ? ` · currently ${todayRecord.status.replaceAll("_", " ")}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-4 text-[13px] text-pp-muted">
            <span>In: {todayRecord?.checkIn ? formatIstTime(todayRecord.checkIn) : "—"}</span>
            <span>Out: {todayRecord?.checkOut ? formatIstTime(todayRecord.checkOut) : "—"}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="teal"
              disabled={pending !== null || checkedIn}
              onClick={() => void punch("in")}
            >
              <LogIn className="h-4 w-4" />
              {pending === "in" ? "Checking in…" : "Check in"}
            </Button>
            <Button
              type="button"
              disabled={pending !== null || !checkedIn || checkedOut}
              onClick={() => void punch("out")}
            >
              <LogOut className="h-4 w-4" />
              {pending === "out" ? "Checking out…" : "Check out"}
            </Button>
          </div>
          {checkedOut ? (
            <p className="mt-3 text-[13px] text-pp-secondary-dark">Attendance for today is complete.</p>
          ) : null}
          {error ? <p className="mt-2 text-[13px] text-pp-danger">{error}</p> : null}
          {blocked ? <p className="mt-2 text-[13px] text-pp-danger">{blocked}</p> : null}
        </div>
      ) : null}

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
          const record = byDate.get(cell.date);
          const meta = STATUS_META.find((item) => item.value === record?.status);
          const isToday = cell.date === today;
          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => {
                if (!canPunch) {
                  return;
                }
                if (isToday) {
                  setBlocked(null);
                  return;
                }
                setBlocked("You can only check in and out for today. Other days are blocked.");
              }}
              className={cn(
                "flex h-14 flex-col items-center justify-center rounded-pp border text-[13px] transition-colors",
                isToday ? "border-pp-primary bg-pp-primary-light" : "border-transparent",
                canPunch && !isToday ? "cursor-not-allowed opacity-60" : "hover:bg-pp-bg",
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
    </div>
  );
}
