import { cn } from "@/lib/cn";

const styles: Record<string, string> = {
  active: "bg-pp-success-light text-pp-success",
  open: "bg-pp-success-light text-pp-success",
  paid: "bg-pp-success-light text-pp-success",
  approved: "bg-pp-secondary-light text-pp-secondary",
  validated: "bg-pp-primary-light text-pp-primary",
  computed: "bg-pp-primary-light text-pp-primary",
  draft: "bg-pp-bg text-pp-muted",
  pending: "bg-pp-warning-light text-pp-warning",
  pending_approval: "bg-pp-warning-light text-pp-warning",
  invited: "bg-pp-primary-light text-pp-primary",
  suspended: "bg-pp-danger-light text-pp-danger",
  requested: "bg-pp-warning-light text-pp-warning",
  to_approve: "bg-pp-warning-light text-pp-warning",
  refused: "bg-pp-danger-light text-pp-danger",
  rejected: "bg-pp-danger-light text-pp-danger",
  cancelled: "bg-pp-bg text-pp-muted",
  expired: "bg-pp-danger-light text-pp-danger",
  present: "bg-pp-success-light text-pp-success",
  absent: "bg-pp-danger-light text-pp-danger",
  late: "bg-pp-warning-light text-pp-warning",
  overtime: "bg-pp-primary-light text-pp-primary",
  early_departure: "bg-pp-warning-light text-pp-warning",
  missing_checkout: "bg-pp-bg text-pp-muted",
  on_leave: "bg-pp-secondary-light text-pp-secondary",
};

function labelize(value: string) {
  return value.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded px-2 py-0.5 text-[12px] font-medium capitalize",
        styles[status] ?? "bg-pp-bg text-pp-muted",
      )}
    >
      {labelize(status)}
    </span>
  );
}
