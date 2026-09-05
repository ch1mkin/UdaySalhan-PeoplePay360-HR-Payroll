"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { NavGroup } from "@/lib/auth/permissions";
import { BrandMark } from "@/components/brand/logo";

function isActive(pathname: string, href: string) {
  if (href === "/app") {
    return pathname === "/app";
  }
  if (href === "/app/users") {
    return pathname === "/app/users" || /^\/app\/users\/[^/]+$/.test(pathname);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Group({ group, onNavigate }: { group: NavGroup; onNavigate?: () => void }) {
  const pathname = usePathname();
  const hasActive = group.items.some((item) => isActive(pathname, item.href));
  const [open, setOpen] = useState(true);

  if (!group.label) {
    return (
      <div className="mb-1">
        {group.items.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.module}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex h-10 items-center gap-2.5 rounded-pp px-2.5 text-[14px]",
                active
                  ? "bg-pp-primary-light text-pp-primary"
                  : "text-pp-text hover:bg-pp-primary-light/60",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 w-full items-center justify-between px-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-pp-gray"
      >
        {group.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open || hasActive ? "" : "-rotate-90")} />
      </button>
      {open || hasActive
        ? group.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.module}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex h-10 items-center gap-2.5 rounded-pp px-2.5 text-[14px]",
                  active
                    ? "bg-pp-primary-light font-medium text-pp-primary"
                    : "text-pp-text hover:bg-pp-primary-light/60",
                )}
              >
                <span className={cn("h-4 w-0.5 rounded", active ? "bg-pp-primary" : "bg-transparent")} />
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })
        : null}
    </div>
  );
}

export function Sidebar({
  groups,
  mobileOpen,
  onClose,
}: {
  groups: NavGroup[];
  mobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-pp-border bg-pp-surface shadow-[12px_0_40px_rgba(47,47,47,0.12)] transition-transform duration-200 ease-out lg:static lg:z-0 lg:h-auto lg:w-[220px] lg:translate-x-0 lg:pointer-events-auto lg:shadow-none",
        mobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none lg:pointer-events-auto",
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-pp-border px-3 lg:hidden">
        <BrandMark />
        <button
          type="button"
          onClick={onClose}
          className="rounded-pp p-1.5 text-pp-muted hover:bg-pp-bg hover:text-pp-text"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {groups.map((group) => (
          <Group key={group.id} group={group} onNavigate={onClose} />
        ))}
      </nav>
    </aside>
  );
}
