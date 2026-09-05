import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-pp-text">{title}</h1>
        {description ? (
          <p className="mt-1 text-[13px] text-pp-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-[1200px]", className)}>{children}</div>;
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-pp border border-pp-border bg-pp-surface p-5", className)}>
      {children}
    </div>
  );
}
