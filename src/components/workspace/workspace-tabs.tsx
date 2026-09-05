"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Minus, SquareArrowOutUpRight, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { isWorkspaceHrefActive, useWorkspace } from "@/store/workspace";

export function WorkspaceTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const { tabs, closeTab, finishClose, popOut, minimize } = useWorkspace();
  const strip = tabs.filter((tab) => tab.mode === "tab" || tab.closing);

  return (
    <div className="flex h-9 shrink-0 items-end gap-1 overflow-x-auto border-b border-pp-border bg-pp-bg px-2">
      {strip.map((tab) => {
        const active = !tab.closing && isWorkspaceHrefActive(pathname, tab.href);
        return (
          <div
            key={tab.id}
            className={cn(
              "flex h-8 items-center gap-0.5 rounded-t-lg border border-b-0 px-1.5 text-[12px]",
              tab.closing ? "pp-tab-out pointer-events-none" : "pp-tab-in",
              active
                ? "border-pp-border bg-pp-surface text-pp-primary"
                : "border-transparent bg-transparent text-pp-muted hover:bg-pp-surface",
            )}
            onAnimationEnd={() => {
              if (tab.closing) {
                finishClose(tab.id);
              }
            }}
          >
            <Link href={tab.href} className="whitespace-nowrap px-1">
              {tab.title}
              {tab.dirty ? " •" : ""}
            </Link>
            <button
              type="button"
              aria-label={`Pop out ${tab.title}`}
              className="rounded p-0.5 hover:bg-pp-bg"
              onClick={() => {
                popOut(tab.id);
                if (active) {
                  const remaining = useWorkspace
                    .getState()
                    .tabs.filter((item) => item.mode === "tab" && item.id !== tab.id && !item.closing);
                  router.push(remaining[remaining.length - 1]?.href ?? "/app");
                }
              }}
            >
              <SquareArrowOutUpRight className="h-3 w-3" />
            </button>
            <button
              type="button"
              aria-label={`Minimize ${tab.title}`}
              className="rounded p-0.5 hover:bg-pp-bg"
              onClick={() => {
                minimize(tab.id);
                if (active) {
                  const remaining = useWorkspace
                    .getState()
                    .tabs.filter((item) => item.mode === "tab" && item.id !== tab.id && !item.closing);
                  router.push(remaining[remaining.length - 1]?.href ?? "/app");
                }
              }}
            >
              <Minus className="h-3 w-3" />
            </button>
            {strip.filter((item) => !item.closing).length > 1 || tabs.some((item) => item.mode !== "tab") ? (
              <button
                type="button"
                aria-label={`Close ${tab.title}`}
                className="rounded p-0.5 hover:bg-pp-bg"
                onClick={() => {
                  const ok = closeTab(tab.id);
                  if (ok && active) {
                    const remaining = useWorkspace
                      .getState()
                      .tabs.filter((item) => item.id !== tab.id && item.mode === "tab" && !item.closing);
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
