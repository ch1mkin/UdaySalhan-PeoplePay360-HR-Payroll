"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createContract } from "@/lib/actions/records";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/form-section";
import { Modal } from "@/components/ui/modal";
import { useAppLoader } from "@/store/loader";

const SELECT =
  "h-10 w-full rounded-pp border border-pp-border bg-white px-3 text-sm text-pp-text outline-none focus:border-pp-primary";

export type ContractOptionEmployee = { id: string; first_name: string; last_name: string };
export type ContractOptionSchedule = { id: string; name: string };

export function ContractForm({
  employees,
  schedules,
  employeeId,
  contract,
  onDone,
}: {
  employees: ContractOptionEmployee[];
  schedules: ContractOptionSchedule[];
  employeeId?: string;
  contract?: {
    id: string;
    name: string | null;
    employee_id: string;
    start_date: string;
    end_date: string | null;
    wage: number;
    wage_type: string;
    status: string;
    job_position: string | null;
    working_schedule_id: string | null;
    notes?: string | null;
  };
  onDone?: () => void;
}) {
  const router = useRouter();
  const start = useAppLoader((state) => state.start);
  const stop = useAppLoader((state) => state.stop);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const timer = window.setTimeout(start, 200);
        const result = await createContract(new FormData(event.currentTarget));
        window.clearTimeout(timer);
        stop();
        setPending(false);
        if (result.error) {
          setError(result.error);
          return;
        }
        onDone?.();
        router.refresh();
      }}
    >
      {contract?.id ? <input type="hidden" name="id" value={contract.id} /> : null}
      <Field className="sm:col-span-2">
        <Label htmlFor="employee_id">Employee</Label>
        <select
          id="employee_id"
          name="employee_id"
          required
          defaultValue={contract?.employee_id ?? employeeId ?? ""}
          className={SELECT}
        >
          <option value="">Select employee</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.first_name} {employee.last_name}
            </option>
          ))}
        </select>
      </Field>
      <Field>
        <Label htmlFor="name">Contract name</Label>
        <Input id="name" name="name" defaultValue={contract?.name ?? ""} placeholder="e.g. 2026 full-time" />
      </Field>
      <Field>
        <Label htmlFor="status">Status</Label>
        <select id="status" name="status" defaultValue={contract?.status ?? "open"} className={SELECT}>
          <option value="draft">Draft</option>
          <option value="open">Open</option>
          <option value="close_to_expire">Close to expire</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </Field>
      <Field>
        <Label htmlFor="start_date">Start date</Label>
        <Input id="start_date" name="start_date" type="date" required defaultValue={contract?.start_date ?? ""} />
      </Field>
      <Field>
        <Label htmlFor="end_date">End date</Label>
        <Input id="end_date" name="end_date" type="date" defaultValue={contract?.end_date ?? ""} />
      </Field>
      <Field>
        <Label htmlFor="wage">Wage</Label>
        <Input id="wage" name="wage" type="number" min={0} step="0.01" required defaultValue={contract?.wage ?? ""} />
      </Field>
      <Field>
        <Label htmlFor="wage_type">Wage type</Label>
        <select id="wage_type" name="wage_type" defaultValue={contract?.wage_type ?? "monthly"} className={SELECT}>
          <option value="monthly">Monthly</option>
          <option value="hourly">Hourly</option>
        </select>
      </Field>
      <Field>
        <Label htmlFor="job_position">Job position</Label>
        <Input id="job_position" name="job_position" defaultValue={contract?.job_position ?? ""} />
      </Field>
      <Field>
        <Label htmlFor="working_schedule_id">Working schedule</Label>
        <select
          id="working_schedule_id"
          name="working_schedule_id"
          defaultValue={contract?.working_schedule_id ?? ""}
          className={SELECT}
        >
          <option value="">None</option>
          {schedules.map((schedule) => (
            <option key={schedule.id} value={schedule.id}>
              {schedule.name}
            </option>
          ))}
        </select>
      </Field>
      <Field className="sm:col-span-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={contract?.notes ?? ""}
          rows={2}
          className="w-full rounded-pp border border-pp-border px-3 py-2 text-sm outline-none focus:border-pp-primary"
        />
      </Field>
      {error ? <p className="sm:col-span-2 text-[13px] text-pp-danger">{error}</p> : null}
      <div className="sm:col-span-2 flex justify-end gap-2 border-t border-pp-primary/20 pt-4">
        {onDone ? (
          <Button type="button" variant="secondary" onClick={onDone}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : contract?.id ? "Save contract" : "Create contract"}
        </Button>
      </div>
    </form>
  );
}

export function NewContractButton({
  employees,
  schedules,
  employeeId,
}: {
  employees: ContractOptionEmployee[];
  schedules: ContractOptionSchedule[];
  employeeId?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        New contract
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New contract"
        description="Payroll uses the contract whose dates cover the pay period."
      >
        <ContractForm
          employees={employees}
          schedules={schedules}
          employeeId={employeeId}
          onDone={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
