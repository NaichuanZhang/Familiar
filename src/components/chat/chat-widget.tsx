"use client";

import { useState, useCallback } from "react";
import { ChatToggleButton } from "./chat-toggle-button";
import { ChatPanel } from "./chat-panel";
import type { ChatMessage } from "./types";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I can help answer questions about caregiving. What would you like to know?",
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSend = useCallback(async () => {
    const query = input.trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/knowledge/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      const answer =
        res.ok && data.success
          ? data.data.answer
          : data.error ?? "Sorry, something went wrong. Please try again.";

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Unable to reach the server. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return (
    <>
      <ChatPanel
        open={isOpen}
        messages={messages}
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSend={handleSend}
        onClose={handleClose}
      />
      <ChatToggleButton isOpen={isOpen} onClick={handleToggle} />
    </>
  );
}
