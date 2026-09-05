import type { AttendanceStatus } from "@/types/hr";

export const IST = "Asia/Kolkata";
export const DEFAULT_WORK_START = "09:30";
export const DEFAULT_WORK_END = "18:30";

export function todayISO(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: IST }).format(value);
}

export function sliceTime(value: string | null | undefined, fallback: string) {
  const raw = (value ?? "").trim();
  if (/^\d{2}:\d{2}/.test(raw)) {
    return raw.slice(0, 5);
  }
  return fallback;
}

export function parseTimeToMinutes(value: string) {
  const [hour, minute] = sliceTime(value, "00:00").split(":").map(Number);
  return hour * 60 + minute;
}

export function minutesInIst(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(value);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export function formatIstTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleTimeString("en-IN", {
    timeZone: IST,
    hour: "numeric",
    minute: "2-digit",
  });
}

export function attendanceStatusFromTimes(
  checkIn: Date,
  checkOut: Date | null,
  workStart: string,
  workEnd: string,
): AttendanceStatus {
  const start = parseTimeToMinutes(workStart);
  const end = parseTimeToMinutes(workEnd);
  const late = minutesInIst(checkIn) > start;
  if (!checkOut) {
    return late ? "late" : "missing_checkout";
  }
  const outMinutes = minutesInIst(checkOut);
  if (outMinutes > end) {
    return "overtime";
  }
  if (outMinutes < end) {
    return "early_departure";
  }
  if (late) {
    return "late";
  }
  return "present";
}

export function workedHours(checkIn: Date, checkOut: Date) {
  return Math.max(0, Math.round(((checkOut.getTime() - checkIn.getTime()) / 3_600_000) * 100) / 100);
}

export function overtimeHours(checkOut: Date, workEnd: string) {
  const extra = minutesInIst(checkOut) - parseTimeToMinutes(workEnd);
  return extra > 0 ? Math.round((extra / 60) * 100) / 100 : 0;
}

export function istDayEnd(dateISO: string) {
  return `${dateISO}T23:59:59.000+05:30`;
}
