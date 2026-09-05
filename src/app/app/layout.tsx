import type { ReactNode } from "react";
import { getAccessContext } from "@/lib/auth/access";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const access = await getAccessContext();

  return <AppShell access={access}>{children}</AppShell>;
}
