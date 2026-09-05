"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { NavGroup } from "@/lib/auth/permissions";

function isActive(pathname: string, href: string) {
  if (href === "/app") {
    return pathname === "/app";
  }
  if (href === "/app/users") {
    return pathname === "/app/users";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Group({ group }: { group: NavGroup }) {
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

export function Sidebar({ groups }: { groups: NavGroup[] }) {
  return (
    <aside className="hidden w-[220px] shrink-0 border-r border-pp-border bg-pp-surface px-2 py-3 md:block">
      {groups.map((group) => (
        <Group key={group.id} group={group} />
      ))}
    </aside>
  );
}
