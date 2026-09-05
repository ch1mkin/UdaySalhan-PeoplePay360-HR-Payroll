import type { ReactNode } from "react";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export function SearchInput({
  name = "q",
  defaultValue,
  label = "Search",
}: {
  name?: string;
  defaultValue?: string;
  label?: string;
}) {
  return (
    <label className="block min-w-[220px] flex-1">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-pp-muted">
        {label}
      </span>
      <span className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pp-gray" />
        <input
          name={name}
          defaultValue={defaultValue}
          className="h-10 w-full rounded-xl border border-pp-border bg-pp-bg/70 pl-9 pr-3 text-[13px] text-pp-text outline-none transition-colors focus:border-pp-primary focus:bg-pp-surface"
        />
      </span>
    </label>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-pp-border bg-pp-surface p-3">
      {children}
    </div>
  );
}

export function SelectFilter({
  name,
  label,
  children,
  defaultValue = "",
  className,
}: {
  name: string;
  label: string;
  children?: ReactNode;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <label className={cn("block min-w-[160px]", className)}>
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-pp-muted">
        {label}
      </span>
      <span className="relative block">
        <select
          name={name}
          defaultValue={defaultValue}
          className="h-10 w-full appearance-none rounded-xl border border-pp-border bg-pp-bg/70 py-0 pl-3 pr-8 text-[13px] text-pp-text outline-none transition-colors focus:border-pp-primary focus:bg-pp-surface"
        >
          <option value="">All</option>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-pp-gray" />
      </span>
    </label>
  );
}
