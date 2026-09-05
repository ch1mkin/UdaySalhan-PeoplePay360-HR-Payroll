import { cn } from "@/lib/cn";

export function RupeeLoader({
  size = 64,
  className,
  label = "Loading",
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("inline-flex flex-col items-center justify-center gap-3", className)}
    >
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
        <circle cx="32" cy="32" r="26" stroke="var(--pp-primary-light)" strokeWidth="3" />
        <circle
          className="pp-orbit"
          cx="32"
          cy="32"
          r="26"
          stroke="var(--pp-primary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="42 122"
        />
        <text
          x="32"
          y="39"
          textAnchor="middle"
          fill="var(--pp-primary)"
          fontSize="22"
          fontWeight="700"
          fontFamily="var(--font-sans), Inter, system-ui, sans-serif"
        >
          ₹
        </text>
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function LoaderOverlay({ label = "Loading" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-pp-bg/55 backdrop-blur-[2px]">
      <RupeeLoader label={label} />
    </div>
  );
}
