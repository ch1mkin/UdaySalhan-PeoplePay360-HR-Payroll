import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "teal" | "danger" | "ghost";
  size?: "sm" | "md";
  href?: string;
};

const variants = {
  primary: "bg-pp-primary text-white hover:bg-pp-primary-dark",
  secondary: "border border-pp-border bg-pp-surface text-pp-text hover:bg-pp-bg",
  teal: "bg-pp-secondary text-white hover:bg-pp-secondary-dark",
  danger: "bg-pp-danger text-white hover:bg-[#c74743]",
  ghost: "text-pp-muted hover:text-pp-text hover:bg-pp-bg",
};

const sizes = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-[38px] px-3.5 text-[13px]",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  href,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-pp font-medium transition-colors disabled:pointer-events-none disabled:opacity-40",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {props.children}
      </Link>
    );
  }

  return <button type={type} className={classes} {...props} />;
}
