import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format/money";

export function StatCard({
  label,
  value,
  accent = "primary",
}: {
  label: string;
  value: string;
  accent?: "primary" | "secondary" | "success" | "neutral";
}) {
  const bar = {
    primary: "bg-pp-primary",
    secondary: "bg-pp-secondary",
    success: "bg-pp-success",
    neutral: "bg-pp-gray",
  }[accent];

  return (
    <div className="rounded-pp border border-pp-border bg-pp-surface p-4">
      <div className={cn("mb-3 h-0.5 w-8", bar)} />
      <p className="text-[12px] text-pp-muted">{label}</p>
      <p className="mt-1 text-[22px] font-semibold text-pp-text">{value}</p>
    </div>
  );
}

export function MoneyDisplay({
  amount,
  className,
}: {
  amount: number | null | undefined;
  className?: string;
}) {
  return <span className={cn("font-medium tabular-nums", className)}>{formatMoney(amount)}</span>;
}
