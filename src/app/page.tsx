import { db } from "@/db";
import {
  users,
  patientProfiles,
  userPatients,
  callSchedules,
  callLogs,
  actionItems,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

// Hard-coded current user and patient for MVP
const CURRENT_USER_ID = "a1000000-0000-0000-0000-000000000001";
const PATIENT_ID = "b1000000-0000-0000-0000-000000000001";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [
    currentUser,
    patient,
    familyCircle,
    scheduleRows,
    activityLogs,
    items,
    allUsers,
  ] = await Promise.all([
    db.select().from(users).where(eq(users.id, CURRENT_USER_ID)).then((r) => r[0]),
    db.select().from(patientProfiles).where(eq(patientProfiles.id, PATIENT_ID)).then((r) => r[0]),
    db
      .select({
        name: users.name,
        displayColor: userPatients.displayColor,
        userId: users.id,
        relationship: userPatients.relationship,
      })
      .from(userPatients)
      .innerJoin(users, eq(users.id, userPatients.userId))
      .where(eq(userPatients.patientId, PATIENT_ID))
      .orderBy(users.name),
    db
      .select({
        schedule: callSchedules,
        assigneeName: users.name,
      })
      .from(callSchedules)
      .leftJoin(users, eq(users.id, callSchedules.assignedUserId))
      .where(
        and(
          eq(callSchedules.patientId, PATIENT_ID),
          eq(callSchedules.isActive, true)
        )
      )
      .orderBy(callSchedules.scheduledTime),
    db
      .select()
      .from(callLogs)
      .where(eq(callLogs.patientId, PATIENT_ID))
      .orderBy(desc(callLogs.createdAt))
      .limit(10),
    db
      .select()
      .from(actionItems)
      .where(eq(actionItems.patientId, PATIENT_ID))
      .orderBy(desc(actionItems.createdAt)),
    db.select({ id: users.id, name: users.name }).from(users).orderBy(users.name),
  ]);

  if (!currentUser || !patient) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">Loading data...</p>
      </main>
    );
  }

  const activity = [
    ...activityLogs.map((log) => ({
      type: `call-${log.status}`,
      detail:
        log.status === "completed"
          ? `Call completed — ${Math.round((log.callDurationSecs ?? 0) / 60)} min`
          : `Call ${log.status}`,
      timestamp: log.createdAt,
      entityId: log.id,
    })),
    ...items
      .filter((item) => item.createdAt)
      .map((item) => ({
        type: "action-added",
        detail: `Added: ${item.title}`,
        timestamp: item.createdAt,
        entityId: item.id,
      })),
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 10);

  return (
    <DashboardClient
      userName={currentUser.name}
      patient={{
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        nickname: patient.nickname,
        healthStatus: patient.healthStatus,
        location: patient.location,
        dateOfBirth: patient.dateOfBirth,
      }}
      family={familyCircle.map((f) => ({
        name: f.name,
        displayColor: f.displayColor ?? "#A89888",
        userId: f.userId,
      }))}
      schedules={scheduleRows}
      actionItems={items.map((i) => ({
        id: i.id,
        title: i.title,
        priority: i.priority,
        status: i.status,
        createdAt: i.createdAt,
      }))}
      activity={activity}
      users={allUsers}
    />
  );
}
