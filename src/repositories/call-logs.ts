import { eq, and, desc, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { callLogs } from "@/db/schema";

type CreateCallLogInput = {
  patientId: string;
  scheduleId?: string;
  blandCallId?: string;
  status?: string;
  transcript?: string;
  summary?: string;
  recordingUrl?: string;
  callDurationSecs?: number;
  sentiment?: string;
  metadata?: Record<string, unknown>;
  startedAt?: Date;
  endedAt?: Date;
};

export const callLogsRepository = {
  findById: async (id: string) => {
    const [log] = await db.select().from(callLogs).where(eq(callLogs.id, id));
    return log ?? null;
  },

  findByBlandCallId: async (blandCallId: string) => {
    const [log] = await db
      .select()
      .from(callLogs)
      .where(eq(callLogs.blandCallId, blandCallId));
    return log ?? null;
  },

  findByPatientId: async (patientId: string) => {
    return db
      .select()
      .from(callLogs)
      .where(eq(callLogs.patientId, patientId))
      .orderBy(desc(callLogs.createdAt));
  },

  findRecentByPatientId: async (patientId: string, limit: number = 10) => {
    return db
      .select()
      .from(callLogs)
      .where(eq(callLogs.patientId, patientId))
      .orderBy(desc(callLogs.createdAt))
      .limit(limit);
  },

  findByScheduleIdAndDate: async (scheduleId: string, dateStr: string) => {
    const startOfDay = new Date(`${dateStr}T00:00:00Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
    const [log] = await db
      .select()
      .from(callLogs)
      .where(
        and(
          eq(callLogs.scheduleId, scheduleId),
          gte(callLogs.createdAt, startOfDay),
          lte(callLogs.createdAt, endOfDay),
        ),
      );
    return log ?? null;
  },

  create: async (data: CreateCallLogInput) => {
    const [log] = await db.insert(callLogs).values(data).returning();
    return log;
  },

  updateStatus: async (
    id: string,
    status: string,
    extra?: Partial<CreateCallLogInput>,
  ) => {
    const [log] = await db
      .update(callLogs)
      .set({ status, ...extra })
      .where(eq(callLogs.id, id))
      .returning();
    return log ?? null;
  },
};
