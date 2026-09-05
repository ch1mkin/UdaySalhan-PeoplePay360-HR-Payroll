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
      className={cn("rounded-pp object-cover", className)}
      priority
    />
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Logo size={32} />
      <span className="text-[15px] font-semibold tracking-tight text-pp-text">
        PeoplePay360
      </span>
    </span>
  );
}
