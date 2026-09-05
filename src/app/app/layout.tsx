import type { ReactNode } from "react";
import { headers } from "next/headers";
import { getAccessContext } from "@/lib/auth/access";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const access = await getAccessContext();
  const detached = (await headers()).get("x-pp-detached") === "1";

  return (
    <AppShell access={access} detached={detached}>
      {children}
    </AppShell>
  );
}
