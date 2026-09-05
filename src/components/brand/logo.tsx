import Image from "next/image";
import { cn } from "@/lib/cn";

export function Logo({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logoHR360.png"
      alt="PeoplePay360"
      width={size}
      height={size}
      className={cn("rounded-pp object-contain bg-black", className)}
      priority
    />
  );
}

export function BrandMark({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Logo size={32} />
      <span
        className={cn(
          "text-[15px] font-semibold tracking-tight",
          inverted ? "text-white" : "text-pp-text",
        )}
      >
        PeoplePay360
      </span>
    </span>
  );
}
