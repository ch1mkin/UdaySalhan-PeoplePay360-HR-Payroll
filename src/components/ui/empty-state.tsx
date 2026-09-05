import type { ReactNode } from "react";
import { FileText } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-pp border border-pp-border bg-pp-surface px-6 py-14 text-center">
      <FileText className="h-8 w-8 text-pp-gray" strokeWidth={1.5} />
      <p className="mt-3 text-sm font-medium text-pp-text">{title}</p>
      <p className="mt-1 max-w-sm text-[13px] text-pp-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
