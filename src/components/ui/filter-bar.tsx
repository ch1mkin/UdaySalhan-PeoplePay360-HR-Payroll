import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchInput({
  placeholder = "Search...",
  name = "q",
  defaultValue,
}: {
  placeholder?: string;
  name?: string;
  defaultValue?: string;
}) {
  return (
    <label className="relative block min-w-[200px] flex-1">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-pp-gray" />
      <Input name={name} defaultValue={defaultValue} placeholder={placeholder} className="pl-8" />
    </label>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-center gap-2">{children}</div>;
}

export function SelectFilter({
  name,
  label,
  children,
}: {
  name: string;
  label: string;
  children?: ReactNode;
}) {
  return (
    <select
      name={name}
      defaultValue=""
      aria-label={label}
      className="h-10 rounded-pp border border-pp-border bg-pp-surface px-3 text-[13px] text-pp-text outline-none focus:border-pp-primary"
    >
      <option value="">{label}</option>
      {children}
    </select>
  );
}
