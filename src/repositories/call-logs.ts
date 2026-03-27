import { eq, desc } from "drizzle-orm";
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
    const [log] = await db
      .select()
      .from(callLogs)
      .where(eq(callLogs.id, id));
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

  create: async (data: CreateCallLogInput) => {
    const [log] = await db.insert(callLogs).values(data).returning();
    return log;
  },

  updateStatus: async (
    id: string,
    status: string,
    extra?: Partial<CreateCallLogInput>
  ) => {
    const [log] = await db
      .update(callLogs)
      .set({ status, ...extra })
      .where(eq(callLogs.id, id))
      .returning();
    return log ?? null;
  },
};
