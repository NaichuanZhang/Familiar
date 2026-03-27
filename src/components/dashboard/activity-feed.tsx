import { cn } from "@/lib/utils";

export type CallData = {
  transcript: string | null;
  recordingUrl: string | null;
  callDurationSecs: number | null;
  status: string;
  sentiment: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
};

export type ActivityItem = {
  type: string;
  detail: string;
  timestamp: Date;
  entityId: string;
  callData?: CallData;
};

type ActivityFeedProps = {
  items: ActivityItem[];
  onItemClick?: (item: ActivityItem) => void;
};

const dotColors: Record<string, string> = {
  "call-completed": "bg-success",
  "call-missed": "bg-gentle-red",
  "action-added": "bg-warning",
};

export function ActivityFeed({ items, onItemClick }: ActivityFeedProps) {
  return (
    <ul className="list-none">
      {items.map((item, i) => {
        const isCall = item.type.startsWith("call-");
        return (
          <li
            key={item.entityId}
            className={cn(
              "flex items-start gap-3.5 py-3.5 px-2 -mx-2 border-b border-border-light last:border-b-0 animate-[fadeSlideUp_0.4s_ease_forwards] opacity-0 translate-y-2 rounded-lg",
              isCall &&
                "cursor-pointer hover:bg-bg-warm transition-colors duration-150",
            )}
            style={{ animationDelay: `${i * 60}ms` }}
            onClick={isCall ? () => onItemClick?.(item) : undefined}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full mt-1.5 shrink-0",
                dotColors[item.type] ?? "bg-info",
              )}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-text leading-relaxed">
                {item.detail}
              </div>
              <div className="text-[11.5px] text-text-muted mt-0.5">
                {new Date(item.timestamp).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </div>
            {isCall && (
              <div className="text-text-muted mt-1 shrink-0 text-xs opacity-0 group-hover:opacity-100">
                &#8250;
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
