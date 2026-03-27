"use client";

import { cn, getInitials } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "w-[22px] h-[22px] text-[9px]",
  md: "w-[38px] h-[38px] text-[13px]",
  lg: "w-16 h-16 text-[22px]",
};

type AvatarProps = {
  name: string;
  color: string;
  size?: AvatarSize;
  className?: string;
};

export function Avatar({ name, color, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shrink-0 relative",
        sizeClasses[size],
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
      }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
