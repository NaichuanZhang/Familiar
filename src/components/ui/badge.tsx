import { cn } from "@/lib/utils";

type BadgeVariant =
  | "cadence"
  | "time"
  | "completed"
  | "missed"
  | "upcoming"
  | "priority-high"
  | "priority-medium"
  | "priority-low";

const variantClasses: Record<BadgeVariant, string> = {
  cadence: "bg-bg-warm text-text-secondary",
  time: "bg-primary-subtle text-primary-dark",
  completed: "bg-success-subtle text-success",
  missed: "bg-gentle-red-subtle text-gentle-red",
  upcoming: "bg-info-subtle text-info",
  "priority-high": "bg-gentle-red-subtle text-gentle-red",
  "priority-medium": "bg-warning-subtle text-warning",
  "priority-low": "bg-info-subtle text-info",
};

type BadgeProps = {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
