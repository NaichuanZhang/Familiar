"use client";

import { useEffect, useRef, useCallback } from "react";
import { Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "./types";

type ChatPanelProps = {
  open: boolean;
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onClose: () => void;
};

export function ChatPanel({
  open,
  messages,
  input,
  isLoading,
  onInputChange,
  onSend,
  onClose,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend();
  };

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed bottom-24 right-6 z-[200]",
        "flex w-[380px] max-w-[calc(100vw-48px)] flex-col",
        "h-[500px] max-h-[calc(100vh-120px)]",
        "rounded-2xl border border-border-light bg-bg-white shadow-lg",
        "animate-[chatSlideUp_0.3s_ease-out]",
        "max-md:bottom-20 max-md:right-4"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
        <h3 className="font-display text-lg font-semibold text-text">
          Care Assistant
        </h3>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-warm hover:text-text cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "rounded-br-sm bg-primary text-text-on-primary"
                  : "rounded-bl-sm bg-bg-warm text-text"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-bg-warm px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-text-muted animate-[chatDotPulse_1.4s_ease-in-out_infinite]" />
                <span className="h-2 w-2 rounded-full bg-text-muted animate-[chatDotPulse_1.4s_ease-in-out_0.2s_infinite]" />
                <span className="h-2 w-2 rounded-full bg-text-muted animate-[chatDotPulse_1.4s_ease-in-out_0.4s_infinite]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border-light px-4 py-3"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ask a question..."
          disabled={isLoading}
          className={cn(
            "flex-1 rounded-xl border-[1.5px] border-border bg-bg px-3.5 py-2.5 text-sm text-text",
            "placeholder:text-text-muted outline-none",
            "transition-all duration-200",
            "focus:border-primary focus:shadow-[0_0_0_3px_rgba(212,113,78,0.1)]",
            "disabled:opacity-50"
          )}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          aria-label="Send message"
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            "bg-primary text-text-on-primary transition-all duration-200",
            "hover:bg-primary-dark cursor-pointer",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
