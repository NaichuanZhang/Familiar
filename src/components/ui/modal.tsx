"use client";

import { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ open, onClose, children }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-100 flex items-center justify-center transition-opacity duration-250",
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ background: "rgba(61,46,36,0.35)", backdropFilter: "blur(4px)" }}
    >
      <div
        className={cn(
          "bg-bg-white rounded-3xl p-8 w-[520px] max-w-[90vw] max-h-[85vh] overflow-y-auto shadow-lg transition-transform duration-400",
          open ? "translate-y-0" : "translate-y-5"
        )}
      >
        {children}
      </div>
    </div>
  );
}
