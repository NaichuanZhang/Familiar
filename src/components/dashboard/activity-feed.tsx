import { cn } from "@/lib/utils";

type ActivityItem = {
  type: string;
  detail: string;
  timestamp: Date;
  entityId: string;
};

type ActivityFeedProps = {
  items: ActivityItem[];
};

const dotColors: Record<string, string> = {
  "call-completed": "bg-success",
  "call-missed": "bg-gentle-red",
  "action-added": "bg-warning",
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <ul className="list-none">
      {items.map((item, i) => (
        <li
          key={item.entityId}
          className="flex items-start gap-3.5 py-3.5 border-b border-border-light last:border-b-0 animate-[fadeSlideUp_0.4s_ease_forwards] opacity-0 translate-y-2"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div
            className={cn(
              "w-2 h-2 rounded-full mt-1.5 shrink-0",
              dotColors[item.type] ?? "bg-info"
            )}
          />
          <div>
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
        </li>
      ))}
    </ul>
  );
}
