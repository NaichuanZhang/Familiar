"use client";

import { useState, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { GreetingBanner } from "./greeting-banner";
import { CallCard } from "./call-card";
import { ActivityFeed } from "./activity-feed";
import { NewCallModal } from "./new-call-modal";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Schedule = {
  schedule: {
    id: string;
    title: string;
    callType: string;
    purpose: string | null;
    cadence: string;
    scheduledTime: string;
    isActive: boolean;
  };
  assigneeName: string | null;
  assigneeColor?: string;
};

type DashboardProps = {
  userName: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    nickname: string | null;
    healthStatus: string | null;
    location: string | null;
    dateOfBirth: string | null;
  };
  family: { name: string; displayColor: string; userId: string }[];
  schedules: Schedule[];
  actionItems: {
    id: string;
    title: string;
    priority: string;
    status: string;
    createdAt: Date;
  }[];
  activity: {
    type: string;
    detail: string;
    timestamp: Date;
    entityId: string;
  }[];
  users: { id: string; name: string }[];
};

type TabFilter = "today" | "week" | "all";

const tabOptions = [
  { label: "Today", value: "today" as const },
  { label: "This Week", value: "week" as const },
  { label: "All", value: "all" as const },
];

function filterSchedules(schedules: Schedule[], filter: TabFilter): Schedule[] {
  if (filter === "all") return schedules;
  if (filter === "today") {
    return schedules.filter((s) => s.schedule.cadence === "daily");
  }
  // week: daily + weekly
  return schedules.filter(
    (s) => s.schedule.cadence === "daily" || s.schedule.cadence === "weekly",
  );
}

// Map assignee colors from family circle
function getAssigneeColor(
  family: { name: string; displayColor: string }[],
  assigneeName: string | null,
): string {
  if (!assigneeName) return "#A89888";
  const member = family.find((m) => m.name === assigneeName);
  return member?.displayColor ?? "#A89888";
}

export function DashboardClient({
  userName,
  patient,
  family,
  schedules,
  actionItems: initialActionItems,
  activity,
  users,
}: DashboardProps) {
  const [tab, setTab] = useState<TabFilter>("today");
  const [modalOpen, setModalOpen] = useState(false);
  const [actionItems, setActionItems] = useState(initialActionItems);
  const [callingScheduleId, setCallingScheduleId] = useState<string | null>(
    null,
  );

  const filtered = filterSchedules(schedules, tab);
  const pendingCount = actionItems.filter((i) => i.status === "pending").length;
  const todayCalls = filterSchedules(schedules, "today").length;

  const handleCallNow = useCallback(
    async (scheduleId: string) => {
      const schedule = schedules.find((s) => s.schedule.id === scheduleId);
      if (!schedule) return;

      setCallingScheduleId(scheduleId);
      try {
        const res = await fetch("/api/calls/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: patient.id,
            task: schedule.schedule.purpose ?? schedule.schedule.title,
            metadata: { scheduleId, patientId: patient.id },
          }),
        });
        const data = await res.json();
        if (!data.success) {
          alert(`Call failed: ${data.error}`);
        }
      } catch {
        alert("Failed to trigger call. Check your connection.");
      } finally {
        setCallingScheduleId(null);
      }
    },
    [schedules, patient.id],
  );

  const handleToggleItem = useCallback(async (id: string) => {
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "completed" ? "pending" : "completed",
            }
          : item,
      ),
    );
    await fetch(`/api/action-items/${id}/toggle`, { method: "PATCH" });
  }, []);

  return (
    <AppShell
      family={family}
      patient={patient}
      actionItems={actionItems}
      callsThisWeek={schedules.length}
      itemsPending={pendingCount}
      dayStreak={8}
      onToggleItem={handleToggleItem}
    >
      <GreetingBanner
        userName={userName}
        patientNickname={patient.nickname ?? patient.firstName}
        callsToday={todayCalls}
        pendingItems={pendingCount}
      />

      <div className="flex items-center justify-between mb-[18px]">
        <h2 className="font-display text-xl font-medium text-text">
          Call Schedule
        </h2>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={14} strokeWidth={2.5} />
          New Call Task
        </Button>
      </div>

      <Tabs value={tab} onChange={setTab} options={tabOptions} />

      <div className="grid grid-cols-2 gap-4 mb-9 max-md:grid-cols-1">
        {filtered.map((s, i) => (
          <CallCard
            key={s.schedule.id}
            title={s.schedule.title}
            purpose={s.schedule.purpose}
            callType={s.schedule.callType}
            cadence={s.schedule.cadence}
            scheduledTime={s.schedule.scheduledTime}
            status="upcoming"
            assigneeName={s.assigneeName}
            assigneeColor={getAssigneeColor(family, s.assigneeName)}
            animationDelay={i * 80}
            onCallNow={() => handleCallNow(s.schedule.id)}
            calling={callingScheduleId === s.schedule.id}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mb-[18px]">
        <h2 className="font-display text-xl font-medium text-text">
          Recent Activity
        </h2>
      </div>
      <ActivityFeed items={activity} />

      <NewCallModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        patientId={patient.id}
        users={users}
      />
    </AppShell>
  );
}
