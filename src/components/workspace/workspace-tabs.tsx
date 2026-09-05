"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useWorkspace } from "@/store/workspace";

const TITLES: Record<string, string> = {
  "/app": "Dashboard",
  "/app/employees": "Employees",
  "/app/contracts": "Contracts",
  "/app/attendance": "Attendance",
  "/app/time-off": "Time Off",
  "/app/payruns": "Payruns",
  "/app/payslips": "Payslips",
  "/app/structures": "Salary Structures",
  "/app/rules": "Salary Rules",
  "/app/reports": "Reports",
  "/app/settings": "Settings",
};

export function WorkspaceTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const { tabs, openTab, closeTab } = useWorkspace();

  useEffect(() => {
    const base = Object.keys(TITLES).find((href) =>
      href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(`${href}/`),
    );
    if (!base) {
      return;
    }
    openTab({
      id: base,
      href: base,
      title: TITLES[base] ?? "Record",
    });
  }, [pathname, openTab]);

  return (
    <div className="flex h-9 items-end gap-px overflow-x-auto border-b border-pp-border bg-pp-bg px-2">
      {tabs.map((tab) => {
        const active = pathname === tab.href || (tab.href !== "/app" && pathname.startsWith(tab.href));
        return (
          <div
            key={tab.id}
            className={cn(
              "flex h-8 items-center gap-1 rounded-t-pp border border-b-0 px-2 text-[12px]",
              active
                ? "border-pp-border bg-pp-surface text-pp-primary"
                : "border-transparent bg-transparent text-pp-muted hover:bg-pp-surface",
            )}
          >
            <Link href={tab.href} className="whitespace-nowrap px-1">
              {tab.title}
              {tab.dirty ? " •" : ""}
            </Link>
            {tabs.length > 1 ? (
              <button
                type="button"
                aria-label={`Close ${tab.title}`}
                className="rounded p-0.5 hover:bg-pp-bg"
                onClick={() => {
                  const ok = closeTab(tab.id);
                  if (ok && active) {
                    const remaining = useWorkspace.getState().tabs;
                    router.push(remaining[remaining.length - 1]?.href ?? "/app");
                  }
                }}
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
