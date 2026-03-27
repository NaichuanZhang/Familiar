"use client";

import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CallData } from "./activity-feed";

type CallTranscriptModalProps = {
  open: boolean;
  onClose: () => void;
  callData: CallData | null;
  timestamp: Date;
};

function formatDuration(secs: number): string {
  const mins = Math.floor(secs / 60);
  const remaining = secs % 60;
  if (mins === 0) return `${remaining}s`;
  return remaining > 0 ? `${mins}m ${remaining}s` : `${mins}m`;
}

function statusBadgeVariant(status: string) {
  if (status === "completed") return "completed" as const;
  if (status === "missed" || status === "failed" || status === "no-answer")
    return "missed" as const;
  return "upcoming" as const;
}

export function CallTranscriptModal({
  open,
  onClose,
  callData,
  timestamp,
}: CallTranscriptModalProps) {
  if (!callData) return null;

  const dateStr = new Date(timestamp).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-display text-xl font-medium text-text">
            Call Details
          </h2>
          <p className="text-[13px] text-text-muted mt-0.5">{dateStr}</p>
        </div>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text text-xl leading-none p-1 cursor-pointer"
        >
          &times;
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <Badge variant={statusBadgeVariant(callData.status)}>
          {callData.status.charAt(0).toUpperCase() + callData.status.slice(1)}
        </Badge>
        {callData.callDurationSecs != null && (
          <span className="text-[13px] text-text-secondary">
            {formatDuration(callData.callDurationSecs)}
          </span>
        )}
        {callData.sentiment && (
          <span className="text-[13px] text-text-secondary capitalize">
            {callData.sentiment}
          </span>
        )}
      </div>

      <div className="border-t border-border-light pt-5">
        <h3 className="text-sm font-semibold text-text mb-3">Transcript</h3>
        {callData.transcript ? (
          <div className="bg-bg-warm rounded-xl p-4 max-h-[50vh] overflow-y-auto">
            <p className="text-[13px] text-text leading-relaxed whitespace-pre-wrap">
              {callData.transcript}
            </p>
          </div>
        ) : (
          <p className="text-[13px] text-text-muted italic">
            No transcript available for this call.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-light">
        {callData.recordingUrl ? (
          <a
            href={callData.recordingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Play Recording &rarr;
          </a>
        ) : (
          <span />
        )}
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
