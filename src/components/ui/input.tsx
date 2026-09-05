import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-pp border border-pp-border bg-pp-surface px-3 text-sm text-pp-text outline-none transition-colors placeholder:text-pp-gray focus:border-pp-primary",
        className,
      )}
      {...props}
    />
  );
}
