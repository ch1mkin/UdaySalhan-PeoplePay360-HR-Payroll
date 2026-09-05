"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveWorkingSchedule } from "@/lib/actions/records";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/form-section";
import { useAppLoader } from "@/store/loader";

const DAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

const SELECT =
  "h-10 w-full rounded-pp border border-pp-border bg-white px-3 text-sm text-pp-text outline-none focus:border-pp-primary";

export type ScheduleDayValue = {
  day_of_week: number;
  is_working_day: boolean;
  start_time: string | null;
  end_time: string | null;
  break_minutes: number;
  hours?: number;
};

export type ScheduleFormValue = {
  id?: string;
  name?: string;
  calendar_type?: string;
  timezone?: string;
  is_active?: boolean;
  rules?: string | null;
  days?: ScheduleDayValue[];
};

function defaultDays(existing?: ScheduleDayValue[]): ScheduleDayValue[] {
  return DAYS.map((day) => {
    const found = existing?.find((item) => item.day_of_week === day.value);
    if (found) {
      return {
        ...found,
        start_time: found.start_time?.slice(0, 5) ?? "09:30",
        end_time: found.end_time?.slice(0, 5) ?? "18:30",
      };
    }
    const weekday = day.value <= 5;
    return {
      day_of_week: day.value,
      is_working_day: weekday,
      start_time: weekday ? "09:30" : "09:30",
      end_time: weekday ? "18:30" : "18:30",
      break_minutes: weekday ? 60 : 0,
    };
  });
}

function hoursFor(day: ScheduleDayValue) {
  if (!day.is_working_day || !day.start_time || !day.end_time) {
    return 0;
  }
  const [startHour, startMin] = day.start_time.split(":").map(Number);
  const [endHour, endMin] = day.end_time.split(":").map(Number);
  const minutes = endHour * 60 + endMin - (startHour * 60 + startMin) - (day.break_minutes || 0);
  return Math.max(0, Math.round((minutes / 60) * 100) / 100);
}

export function ScheduleForm({ schedule }: { schedule?: ScheduleFormValue }) {
  const router = useRouter();
  const start = useAppLoader((state) => state.start);
  const stop = useAppLoader((state) => state.stop);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [days, setDays] = useState<ScheduleDayValue[]>(() => defaultDays(schedule?.days));

  const weeklyHours = useMemo(
    () => Math.round(days.reduce((sum, day) => sum + hoursFor(day), 0) * 100) / 100,
    [days],
  );
  const weeklyDays = days.filter((day) => day.is_working_day).length;

  function patchDay(dayOfWeek: number, patch: Partial<ScheduleDayValue>) {
    setDays((current) =>
      current.map((day) => (day.day_of_week === dayOfWeek ? { ...day, ...patch } : day)),
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const timer = window.setTimeout(start, 200);
        const form = new FormData(event.currentTarget);
        days.forEach((day) => {
          if (day.is_working_day) {
            form.set(`day_${day.day_of_week}_working`, "on");
          }
          form.set(`day_${day.day_of_week}_start`, day.start_time ?? "");
          form.set(`day_${day.day_of_week}_end`, day.end_time ?? "");
          form.set(`day_${day.day_of_week}_break`, String(day.break_minutes ?? 0));
        });
        const result = await saveWorkingSchedule(form);
        window.clearTimeout(timer);
        stop();
        setPending(false);
        if (result.error) {
          setError(result.error);
          return;
        }
        router.push("/app/schedules");
        router.refresh();
      }}
    >
      {schedule?.id ? <input type="hidden" name="id" value={schedule.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required defaultValue={schedule?.name ?? ""} />
        </Field>
        <Field>
          <Label htmlFor="calendar_type">Calendar type</Label>
          <select
            id="calendar_type"
            name="calendar_type"
            defaultValue={schedule?.calendar_type ?? "standard"}
            className={SELECT}
          >
            <option value="standard">Standard</option>
            <option value="flexible">Flexible</option>
            <option value="shift">Shift</option>
          </select>
        </Field>
        <Field>
          <Label htmlFor="timezone">Timezone</Label>
          <Input id="timezone" name="timezone" defaultValue={schedule?.timezone ?? "Asia/Kolkata"} />
        </Field>
        <Field>
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={schedule?.is_active ?? true}
              className="h-4 w-4 accent-[var(--pp-primary)]"
            />
            Active
          </Label>
          <p className="text-[12px] text-pp-muted">Inactive schedules stay in the list but are not assigned.</p>
        </Field>
      </div>

      <div>
        <div className="mb-2 flex items-end justify-between">
          <div>
            <h2 className="text-[15px] font-semibold">Weekly pattern</h2>
            <p className="text-[12px] text-pp-muted">Hours are calculated from start, end and break.</p>
          </div>
          <p className="text-[13px] font-medium text-pp-primary">
            {weeklyDays} days · {weeklyHours} hours / week
          </p>
        </div>
        <div className="overflow-x-auto rounded-pp border border-pp-border">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead className="bg-pp-bg text-pp-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Day</th>
                <th className="px-3 py-2 font-medium">Working</th>
                <th className="px-3 py-2 font-medium">Start</th>
                <th className="px-3 py-2 font-medium">End</th>
                <th className="px-3 py-2 font-medium">Break (min)</th>
                <th className="px-3 py-2 font-medium">Hours</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => {
                const label = DAYS.find((item) => item.value === day.day_of_week)?.label ?? "";
                return (
                  <tr key={day.day_of_week} className="border-t border-pp-border">
                    <td className="px-3 py-2 font-medium">{label}</td>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={day.is_working_day}
                        onChange={(event) => patchDay(day.day_of_week, { is_working_day: event.target.checked })}
                        className="h-4 w-4 accent-[var(--pp-primary)]"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="time"
                        value={day.start_time ?? "09:30"}
                        disabled={!day.is_working_day}
                        onChange={(event) => patchDay(day.day_of_week, { start_time: event.target.value })}
                        className="h-9 rounded-pp border border-pp-border px-2 disabled:bg-pp-bg"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="time"
                        value={day.end_time ?? "18:30"}
                        disabled={!day.is_working_day}
                        onChange={(event) => patchDay(day.day_of_week, { end_time: event.target.value })}
                        className="h-9 rounded-pp border border-pp-border px-2 disabled:bg-pp-bg"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        value={day.break_minutes}
                        disabled={!day.is_working_day}
                        onChange={(event) =>
                          patchDay(day.day_of_week, { break_minutes: Number(event.target.value) || 0 })
                        }
                        className="h-9 w-20 rounded-pp border border-pp-border px-2 disabled:bg-pp-bg"
                      />
                    </td>
                    <td className="px-3 py-2">{hoursFor(day)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Field>
        <Label htmlFor="rules">Shift / flexible rules</Label>
        <textarea
          id="rules"
          name="rules"
          defaultValue={schedule?.rules ?? ""}
          rows={3}
          className="w-full rounded-pp border border-pp-border px-3 py-2 text-sm outline-none focus:border-pp-primary"
          placeholder="Optional: flexible hours, night shift, roster rules"
        />
      </Field>

      {error ? <p className="text-[13px] text-pp-danger">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : schedule?.id ? "Save schedule" : "Create schedule"}
        </Button>
        <Button href="/app/schedules" variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
}
