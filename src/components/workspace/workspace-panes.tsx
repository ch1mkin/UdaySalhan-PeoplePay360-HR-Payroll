"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { isWorkspaceHrefActive, useWorkspace, type WorkspaceTab } from "@/store/workspace";

function TabPane({ tab, active }: { tab: WorkspaceTab; active: boolean }) {
  const src = useRef(`${tab.href}${tab.href.includes("?") ? "&" : "?"}detached=1`);
  return (
    <iframe
      title={tab.title}
      src={src.current}
      className={cn(
        "h-full w-full border-0 bg-pp-bg",
        active ? "relative z-10" : "invisible absolute inset-0 -z-10",
      )}
    />
  );
}

export function WorkspacePanes() {
  const pathname = usePathname();
  const tabs = useWorkspace((state) => state.tabs.filter((tab) => tab.mode === "tab" && !tab.closing));

  if (tabs.length === 0) {
    return <div className="min-h-0 flex-1 bg-pp-bg" />;
  }

  return (
    <div className="relative min-h-0 flex-1 bg-pp-bg">
      {tabs.map((tab) => (
        <TabPane key={tab.id} tab={tab} active={isWorkspaceHrefActive(pathname, tab.href)} />
      ))}
    </div>
  );
}
