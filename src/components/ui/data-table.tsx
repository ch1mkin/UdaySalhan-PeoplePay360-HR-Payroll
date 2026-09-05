import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function DataTable({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: ReactNode;
  empty?: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-pp border border-pp-border bg-pp-surface">
      <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
        <thead>
          <tr className="bg-pp-bg text-pp-muted">
            {headers.map((header) => (
              <th key={header} className="px-4 py-2.5 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty}
    </div>
  );
}

export function DataRow({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      className={cn(
        "h-14 border-t border-pp-border hover:bg-pp-hover",
        onClick ? "cursor-pointer" : "",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function DataCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 text-pp-text", className)}>{children}</td>;
}
