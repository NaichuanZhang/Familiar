"use client";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "card-primary" | "card-muted";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-text-on-primary shadow-sm hover:bg-primary-light hover:shadow-warm hover:-translate-y-0.5 font-semibold px-[18px] py-[9px]",
  secondary:
    "bg-bg-white text-text border border-border hover:border-primary hover:text-primary hover:bg-primary-subtle font-semibold px-4 py-2",
  "card-primary":
    "bg-primary text-text-on-primary hover:bg-primary-light px-3.5 py-1.5 text-[11.5px]",
  "card-muted":
    "bg-bg-warm text-text-secondary hover:bg-border hover:text-text px-3.5 py-1.5 text-[11.5px]",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full text-[13px] font-semibold transition-all duration-250 cursor-pointer",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
