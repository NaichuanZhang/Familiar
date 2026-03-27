"use client";

import { Avatar } from "@/components/ui/avatar";

type Patient = {
  firstName: string;
  lastName: string;
  nickname: string | null;
  healthStatus: string | null;
  location: string | null;
  dateOfBirth: string | null;
};

type ActionItem = {
  id: string;
  title: string;
  priority: string;
  status: string;
  createdAt: Date;
};

type RightPanelProps = {
  patient: Patient;
  actionItems: ActionItem[];
  onToggleItem: (id: string) => void;
};

function getAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

const priorityColors: Record<string, string> = {
  high: "bg-gentle-red",
  urgent: "bg-gentle-red",
  medium: "bg-warning",
  low: "bg-info",
};

export function RightPanel({
  patient,
  actionItems,
  onToggleItem,
}: RightPanelProps) {
  const age = getAge(patient.dateOfBirth);
  const pendingCount = actionItems.filter((i) => i.status === "pending").length;

  return (
    <aside className="w-[340px] fixed top-0 right-0 bottom-0 overflow-y-auto p-8 px-6 border-l border-border-light bg-bg-alt max-lg:hidden">
      {/* Patient Card */}
      <div className="text-center mb-7 pb-6 border-b border-border-light">
        <Avatar
          name={`${patient.firstName} ${patient.lastName}`}
          color="#B85A3A"
          size="lg"
          className="mx-auto mb-3.5"
        />
        <div className="font-display text-xl font-medium">
          {patient.firstName} {patient.lastName}
        </div>
        {patient.nickname && (
          <div className="italic text-text-muted text-[13px]">
            &ldquo;{patient.nickname}&rdquo;
          </div>
        )}
        <div className="text-[12.5px] text-text-secondary mt-2">
          {age && `${age} years old`}
          {age && patient.location && " · "}
          {patient.location}
        </div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold mt-3 bg-success-subtle text-success">
          <span className="w-[7px] h-[7px] rounded-full bg-current animate-pulse" />
          {patient.healthStatus === "stable"
            ? "Stable"
            : patient.healthStatus === "needs_attention"
              ? "Needs Attention"
              : "Critical"}
        </div>
      </div>

      {/* Action Items */}
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-sm font-semibold">Action Items</h3>
        <div className="text-[11px] font-bold bg-primary text-text-on-primary w-[22px] h-[22px] rounded-full flex items-center justify-center">
          {pendingCount}
        </div>
      </div>
      <ul className="list-none mb-7">
        {actionItems.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-2.5 py-2.5 border-b border-border-light last:border-b-0"
          >
            <button
              onClick={() => onToggleItem(item.id)}
              className={`w-[18px] h-[18px] rounded-[5px] border-2 shrink-0 mt-0.5 cursor-pointer transition-all duration-150 flex items-center justify-center ${
                item.status === "completed"
                  ? "bg-primary border-primary"
                  : "border-border bg-bg-white hover:border-primary"
              }`}
            >
              {item.status === "completed" && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M2 5L4 7L8 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            <div>
              <div
                className={`text-[13px] leading-relaxed ${item.status === "completed" ? "line-through text-text-muted" : "text-text"}`}
              >
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle ${priorityColors[item.priority] ?? "bg-info"}`}
                />
                {item.title}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
