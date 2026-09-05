"use client";

import { useRef } from "react";
import { ExternalLink, Minus, X } from "lucide-react";
import { useWorkspace, type WorkspaceTab } from "@/store/workspace";
import { cn } from "@/lib/cn";

function FloatingWindow({ tab }: { tab: WorkspaceTab }) {
  const { closeTab, finishClose, minimize, moveWindow, focusWindow } = useWorkspace();
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const src = `${tab.href}${tab.href.includes("?") ? "&" : "?"}detached=1`;

  return (
    <div
      className={cn(
        "fixed flex flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/92 shadow-[0_24px_60px_rgba(47,47,47,0.2)] backdrop-blur-xl",
        tab.closing ? "pp-window-out pointer-events-none" : "pp-tab-in",
      )}
      style={{
        left: tab.x,
        top: tab.y,
        width: tab.w,
        height: tab.h,
        zIndex: 40 + tab.z,
        resize: "both",
      }}
      onMouseDown={() => focusWindow(tab.id)}
      onAnimationEnd={() => {
        if (tab.closing) {
          finishClose(tab.id);
        }
      }}
    >
      <div
        className="flex h-10 cursor-grab items-center gap-1 border-b border-pp-border bg-pp-bg/80 px-2 active:cursor-grabbing"
        onMouseDown={(event) => {
          if ((event.target as HTMLElement).closest("button")) {
            return;
          }
          drag.current = { dx: event.clientX - tab.x, dy: event.clientY - tab.y };
          const onMove = (move: MouseEvent) => {
            if (!drag.current) {
              return;
            }
            moveWindow(
              tab.id,
              Math.max(8, move.clientX - drag.current.dx),
              Math.max(48, move.clientY - drag.current.dy),
            );
          };
          const onUp = () => {
            drag.current = null;
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
          };
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
        }}
      >
        <p className="min-w-0 flex-1 truncate px-2 text-[13px] font-medium text-pp-text">{tab.title}</p>
        <button
          type="button"
          className="rounded-pp p-1 text-pp-muted hover:bg-pp-surface"
          aria-label="Open in a new browser window"
          onClick={() => {
            window.open(src, `pp-${tab.id}`, "noopener,noreferrer,width=1100,height=740");
          }}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="rounded-pp p-1 text-pp-muted hover:bg-pp-surface"
          aria-label={`Minimize ${tab.title}`}
          onClick={() => minimize(tab.id)}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="rounded-pp p-1 text-pp-muted hover:bg-pp-surface"
          aria-label={`Close ${tab.title}`}
          onClick={() => closeTab(tab.id)}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <iframe title={tab.title} src={src} className="min-h-0 flex-1 border-0 bg-pp-bg" />
    </div>
  );
}

export function FloatingWindows() {
  const tabs = useWorkspace((state) => state.tabs);
  return (
    <>
      {tabs
        .filter((tab) => tab.mode === "float")
        .map((tab) => (
          <FloatingWindow key={tab.id} tab={tab} />
        ))}
    </>
  );
}

export function WindowDock() {
  const tabs = useWorkspace((state) => state.tabs);
  const restore = useWorkspace((state) => state.restore);
  const closeTab = useWorkspace((state) => state.closeTab);
  const minimized = tabs.filter((tab) => tab.mode === "minimized" && !tab.closing);

  if (minimized.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[70] flex justify-center px-3">
      <div className="pointer-events-auto flex max-w-full gap-2 overflow-x-auto rounded-2xl border border-white/70 bg-white/80 p-1.5 shadow-[0_12px_40px_rgba(47,47,47,0.14)] backdrop-blur-xl">
        {minimized.map((tab) => (
          <div key={tab.id} className="pp-dock-in flex items-center">
            <button
              type="button"
              onClick={() => restore(tab.id)}
              className="rounded-xl px-3 py-2 text-[12px] font-medium text-pp-text hover:bg-pp-primary-light"
            >
              {tab.title}
            </button>
            <button
              type="button"
              aria-label={`Close ${tab.title}`}
              className="mr-1 rounded-full p-1 text-pp-muted hover:bg-pp-bg"
              onClick={() => closeTab(tab.id)}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
