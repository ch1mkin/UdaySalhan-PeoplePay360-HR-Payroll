"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

export function PasswordInput({
  className,
  id,
  type: _type,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        {...props}
        type={visible ? "text" : "password"}
        className={cn(
          "h-11 w-full rounded-pp border border-pp-border bg-pp-surface px-3 pr-11 text-sm text-pp-text outline-none transition-colors focus:border-pp-primary",
          className,
        )}
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-pp p-1.5 text-pp-muted transition-colors hover:bg-pp-bg hover:text-pp-text"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
