"use client";

import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatToggleButtonProps = {
  isOpen: boolean;
  onClick: () => void;
};

export function ChatToggleButton({ isOpen, onClick }: ChatToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Close care assistant" : "Open care assistant"}
      className={cn(
        "fixed bottom-6 right-6 z-[200] flex h-14 w-14 items-center justify-center",
        "rounded-full bg-primary text-text-on-primary shadow-warm",
        "transition-all duration-300 hover:bg-primary-dark hover:scale-105",
        "cursor-pointer max-md:bottom-4 max-md:right-4"
      )}
    >
      <MessageCircle
        size={24}
        className={cn(
          "absolute transition-all duration-300",
          isOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        )}
      />
      <X
        size={24}
        className={cn(
          "absolute transition-all duration-300",
          isOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        )}
      />
    </button>
  );
}
