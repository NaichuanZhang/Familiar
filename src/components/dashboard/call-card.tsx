"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatTime } from "@/lib/utils";

type CallCardProps = {
  title: string;
  purpose: string | null;
  callType: string;
  cadence: string;
  scheduledTime: string;
  status: "upcoming" | "completed" | "missed";
  assigneeName: string | null;
  assigneeColor: string;
  lastCompleted?: string;
  animationDelay?: number;
  onCallNow?: () => void;
  calling?: boolean;
};

export function CallCard({
  title,
  purpose,
  callType,
  cadence,
  scheduledTime,
  status,
  assigneeName,
  assigneeColor,
  animationDelay = 0,
  onCallNow,
  calling = false,
}: CallCardProps) {
  const isMedicine = callType === "medicine";
  const icon = isMedicine ? "\u{1F48A}" : "\u{1F49B}";

  return (
    <div
      className={cn(
        "bg-bg-white rounded-2xl p-5 border-l-4 shadow-sm transition-all duration-250 cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
        "animate-[fadeSlideUp_0.5s_ease_forwards] opacity-0 translate-y-3",
        isMedicine ? "border-l-warning" : "border-l-success",
        status === "completed" && "opacity-70! bg-bg-alt",
        status === "missed" && "border-l-gentle-red",
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-[14.5px] font-semibold text-text mb-0.5">
            {title}
          </div>
          <div className="text-[12.5px] text-text-secondary leading-relaxed line-clamp-2">
            {purpose}
          </div>
        </div>
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ml-3",
            isMedicine ? "bg-warning-subtle" : "bg-success-subtle",
          )}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="cadence">
          {cadence.charAt(0).toUpperCase() + cadence.slice(1)}
        </Badge>
        <Badge variant="time">{formatTime(scheduledTime)}</Badge>
        <Badge
          variant={
            status === "completed"
              ? "completed"
              : status === "missed"
                ? "missed"
                : "upcoming"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      {assigneeName && (
        <div className="flex items-center gap-1.5 text-xs text-text-muted mt-3 pt-3 border-t border-border-light">
          <Avatar name={assigneeName} color={assigneeColor} size="sm" />
          <span>{assigneeName}</span>
        </div>
      )}

      <div className="flex gap-2 mt-3.5">
        {status !== "completed" && (
          <Button variant="card-primary" onClick={onCallNow} disabled={calling}>
            {calling ? "Calling..." : "Call Now"}
          </Button>
        )}
        <Button variant="card-muted">Edit</Button>
      </div>
    </div>
  );
}
