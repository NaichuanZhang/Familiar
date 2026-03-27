"use client";

import { cn } from "@/lib/utils";

type TabsProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: { label: string; value: T }[];
};

export function Tabs<T extends string>({
  value,
  onChange,
  options,
}: TabsProps<T>) {
  return (
    <div className="flex gap-1 bg-bg-warm rounded-full p-1 w-fit mb-5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-[18px] py-[7px] rounded-full text-[12.5px] font-semibold transition-all duration-250 cursor-pointer",
            value === opt.value
              ? "bg-bg-white text-text shadow-sm"
              : "text-text-secondary hover:text-text"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
