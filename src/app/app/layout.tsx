import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { accountGatePath, getAccessContext } from "@/lib/auth/access";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const access = await getAccessContext();
  const headerStore = await headers();
  const detached = headerStore.get("x-pp-detached") === "1";
  const pathname = headerStore.get("x-pp-pathname") ?? "/app";
  const gate = accountGatePath(access);
  if (gate && pathname.startsWith("/app")) {
    redirect(gate);
  }

  return (
    <AppShell access={access} detached={detached}>
      {children}
    </AppShell>
  );
}
