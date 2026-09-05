"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  className,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-[#2f1a28]/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pp-modal-title"
        className={cn(
          "relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border-2 border-pp-primary bg-white shadow-[0_24px_64px_rgba(147,70,125,0.22)]",
          className,
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-pp-primary/30 bg-pp-primary-light px-6 py-4">
          <div className="min-w-0">
            <h2 id="pp-modal-title" className="text-[18px] font-semibold tracking-tight text-pp-primary-dark">
              {title}
            </h2>
            {description ? <p className="mt-1 text-[13px] leading-5 text-pp-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 shrink-0 rounded-full p-1.5 text-pp-primary hover:bg-white hover:text-pp-primary-dark"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
