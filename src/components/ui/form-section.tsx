import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format/money";

export function Avatar({ name, className }: { name: string; className?: string }) {
  const letters = initials(name);
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full bg-pp-primary-light text-[11px] font-semibold text-pp-primary",
        className,
      )}
    >
      {letters || "•"}
    </span>
  );
}

export function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-pp-border py-5 last:border-b-0">
      <h2 className="mb-4 text-[15px] font-semibold text-pp-text">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function Field({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col", className)}>{children}</div>;
}
