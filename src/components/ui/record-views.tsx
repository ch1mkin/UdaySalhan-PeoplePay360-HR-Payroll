"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Kanban, List } from "lucide-react";
import { FilterBar } from "@/components/ui/filter-bar";
import { DataRow, DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";

export type RecordViewMode = "kanban" | "list";

export type StatusOption = { value: string; label: string };

export function ViewToggle({
  value,
  onChange,
}: {
  value: RecordViewMode;
  onChange: (value: RecordViewMode) => void;
}) {
  return (
    <div className="ml-auto flex h-10 items-center gap-1 self-end rounded-xl border border-pp-border bg-pp-bg/70 p-1">
      <button
        type="button"
        onClick={() => onChange("kanban")}
        className={cn("rounded-lg p-1.5", value === "kanban" ? "bg-white text-pp-primary" : "text-pp-muted")}
        aria-label="Kanban view"
      >
        <Kanban className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn("rounded-lg p-1.5", value === "list" ? "bg-white text-pp-primary" : "text-pp-muted")}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}

export function DualRecordView<T>({
  items,
  idOf,
  searchText,
  statusOf,
  statusOptions,
  tableHeaders,
  renderTableCells,
  renderKanbanCard,
  hrefOf,
  emptyTitle,
  emptyDescription,
  emptyAction,
  extraFilters,
  statusLabel = "Status",
}: {
  items: T[];
  idOf: (item: T) => string;
  searchText: (item: T) => string;
  statusOf: (item: T) => string;
  statusOptions: StatusOption[];
  tableHeaders: string[];
  renderTableCells: (item: T) => ReactNode;
  renderKanbanCard: (item: T) => ReactNode;
  hrefOf?: (item: T) => string | undefined;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: ReactNode;
  extraFilters?: ReactNode;
  statusLabel?: string;
}) {
  const router = useRouter();
  const [view, setView] = useState<RecordViewMode>("list");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (status && statusOf(item) !== status) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return searchText(item).toLowerCase().includes(needle);
    });
  }, [items, query, status, searchText, statusOf]);

  const columns = statusOptions.map((option) => ({
    ...option,
    cards: filtered.filter((item) => statusOf(item) === option.value),
  }));

  return (
    <>
      <FilterBar>
        <label className="block min-w-[220px] flex-1">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-pp-muted">
            Search
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-xl border border-pp-border bg-pp-bg/70 px-3 text-[13px] outline-none focus:border-pp-primary focus:bg-pp-surface"
          />
        </label>
        {extraFilters}
        <label className="block min-w-[160px]">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-pp-muted">
            {statusLabel}
          </span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 w-full rounded-xl border border-pp-border bg-pp-bg/70 px-3 text-[13px] outline-none focus:border-pp-primary"
          >
            <option value="">All</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <ViewToggle value={view} onChange={setView} />
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : view === "list" ? (
        <DataTable headers={tableHeaders}>
          {filtered.map((item) => {
            const href = hrefOf?.(item);
            return (
              <DataRow
                key={idOf(item)}
                onClick={
                  href
                    ? () => {
                        router.push(href);
                      }
                    : undefined
                }
              >
                {renderTableCells(item)}
              </DataRow>
            );
          })}
        </DataTable>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {columns.map((column) => (
            <div
              key={column.value}
              className="w-[260px] shrink-0 rounded-2xl border border-pp-border bg-pp-bg/50 p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-pp-muted">
                  {column.label}
                </p>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-pp-muted">
                  {column.cards.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {column.cards.length === 0 ? (
                  <p className="rounded-pp border border-dashed border-pp-border bg-white/60 px-3 py-6 text-center text-[12px] text-pp-muted">
                    None
                  </p>
                ) : (
                  column.cards.map((item) => {
                    const href = hrefOf?.(item);
                    const card = renderKanbanCard(item);
                    if (!href) {
                      return <div key={idOf(item)}>{card}</div>;
                    }
                    return (
                      <button
                        key={idOf(item)}
                        type="button"
                        className="text-left"
                        onClick={() => router.push(href)}
                      >
                        {card}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function RecordCard({
  title,
  subtitle,
  meta,
  badge,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: ReactNode;
}) {
  return (
    <div className="rounded-pp border border-pp-border bg-white p-3 shadow-[0_1px_0_rgba(47,47,47,0.04)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-pp-text">{title}</p>
        {badge}
      </div>
      {subtitle ? <p className="mt-1 text-[12px] text-pp-muted">{subtitle}</p> : null}
      {meta ? <p className="mt-2 text-[11px] text-pp-gray">{meta}</p> : null}
    </div>
  );
}
