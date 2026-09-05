"use client";

import Link from "next/link";
import { Bell, CircleHelp, Menu, Search, User } from "lucide-react";
import { BrandMark } from "@/components/brand/logo";
import { Input } from "@/components/ui/input";

export function TopBar({
  companyName,
  userName,
  onMenu,
}: {
  companyName: string;
  userName: string;
  onMenu?: () => void;
}) {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-pp-border bg-pp-surface px-3 md:px-4">
      <button
        type="button"
        className="rounded-pp p-1.5 text-pp-muted hover:bg-pp-bg md:hidden"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
      <BrandMark />
      <span className="hidden h-5 w-px bg-pp-border sm:block" />
      <span className="hidden max-w-[160px] truncate text-[13px] text-pp-muted sm:block">
        {companyName}
      </span>
      <label className="relative mx-auto hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-pp-gray" />
        <Input className="h-9 rounded-xl bg-pp-bg/70 pl-8" aria-label="Search" />
      </label>
      <div className="ml-auto flex items-center gap-1">
        <button type="button" className="rounded-pp p-2 text-pp-muted hover:bg-pp-bg" aria-label="Help">
          <CircleHelp className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="rounded-pp p-2 text-pp-muted hover:bg-pp-bg"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <Link
          href="/app/profile"
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-pp-primary-light text-[11px] font-semibold text-pp-primary"
          aria-label="Open profile"
        >
          {userName ? userName.slice(0, 1).toUpperCase() : <User className="h-3.5 w-3.5" />}
        </Link>
      </div>
    </header>
  );
}
