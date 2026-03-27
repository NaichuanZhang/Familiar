import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { callSchedules, users, patientProfiles } from "@/db/schema";
import type {
  CreateCallScheduleInput,
  UpdateCallScheduleInput,
} from "@/lib/validations/call-schedules";

export const callSchedulesRepository = {
  findAll: async () => {
    return db.select().from(callSchedules).orderBy(callSchedules.scheduledTime);
  },

  findById: async (id: string) => {
    const [schedule] = await db
      .select()
      .from(callSchedules)
      .where(eq(callSchedules.id, id));
    return schedule ?? null;
  },

  findByPatientId: async (patientId: string) => {
    return db
      .select({
        schedule: callSchedules,
        assigneeName: users.name,
      })
      .from(callSchedules)
      .leftJoin(users, eq(users.id, callSchedules.assignedUserId))
      .where(eq(callSchedules.patientId, patientId))
      .orderBy(callSchedules.scheduledTime);
  },

  findActiveByPatientId: async (patientId: string) => {
    return db
      .select({
        schedule: callSchedules,
        assigneeName: users.name,
      })
      .from(callSchedules)
      .leftJoin(users, eq(users.id, callSchedules.assignedUserId))
      .where(
        and(
          eq(callSchedules.patientId, patientId),
          eq(callSchedules.isActive, true),
        ),
      )
      .orderBy(callSchedules.scheduledTime);
  },

  findAllActive: async () => {
    return db
      .select({
        schedule: callSchedules,
        patientPhone: patientProfiles.phoneNumber,
        patientTimezone: patientProfiles.timezone,
        patientStatus: patientProfiles.status,
      })
      .from(callSchedules)
      .innerJoin(
        patientProfiles,
        eq(patientProfiles.id, callSchedules.patientId),
      )
      .where(
        and(
          eq(callSchedules.isActive, true),
          eq(patientProfiles.status, "active"),
        ),
      )
      .orderBy(callSchedules.scheduledTime);
  },

  create: async (
    data: CreateCallScheduleInput & { createdByUserId?: string },
  ) => {
    const [schedule] = await db.insert(callSchedules).values(data).returning();
    return schedule;
  },

  update: async (id: string, data: UpdateCallScheduleInput) => {
    const [schedule] = await db
      .update(callSchedules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(callSchedules.id, id))
      .returning();
    return schedule ?? null;
  },

  delete: async (id: string) => {
    const [schedule] = await db
      .delete(callSchedules)
      .where(eq(callSchedules.id, id))
      .returning();
    return schedule ?? null;
  },
};
