"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import type { AccessContext } from "@/lib/auth/access";
import { navGroupsForRole } from "@/lib/auth/permissions";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { WorkspaceTabs } from "@/components/workspace/workspace-tabs";
import { FloatingWindows, WindowDock } from "@/components/workspace/floating-windows";
import { useWorkspace } from "@/store/workspace";
import { useLgUp } from "@/lib/hooks/use-lg-up";

export function AppShell({
  access,
  detached = false,
  children,
}: {
  access: AccessContext;
  detached?: boolean;
  children: ReactNode;
}) {
  const groups = navGroupsForRole(access.role);
  const [mobileOpen, setMobileOpen] = useState(false);
  const desktop = useLgUp();
  const resetForUser = useWorkspace((state) => state.resetForUser);

  useLayoutEffect(() => {
    resetForUser(access.userId);
  }, [access.userId, resetForUser]);

  if (detached) {
    return <div className="min-h-screen bg-pp-bg text-pp-text">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-pp-bg text-pp-text">
      <TopBar
        companyName={access.companyName}
        userName={access.fullName}
        onMenu={() => setMobileOpen(true)}
      />
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[#2f1a28]/40 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <Sidebar groups={groups} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          {desktop ? <WorkspaceTabs detached={detached} /> : null}
          <main className="min-w-0 flex-1 px-4 py-5 md:px-6">{children}</main>
        </div>
      </div>
      {desktop ? (
        <>
          <FloatingWindows />
          <WindowDock />
        </>
      ) : null}
    </div>
  );
}
