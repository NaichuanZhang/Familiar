import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { patientProfiles } from "./patient-profiles";
import { callSchedules } from "./call-schedules";

export const callLogs = pgTable(
  "call_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patientProfiles.id, { onDelete: "cascade" }),
    scheduleId: uuid("schedule_id").references(() => callSchedules.id, {
      onDelete: "set null",
    }),
    blandCallId: text("bland_call_id").unique(),
    status: text("status").notNull().default("queued"),
    transcript: text("transcript"),
    summary: text("summary"),
    recordingUrl: text("recording_url"),
    callDurationSecs: integer("call_duration_secs"),
    sentiment: text("sentiment"),
    metadata: jsonb("metadata").default({}),
    startedAt: timestamp("started_at", { withTimezone: true }),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_call_logs_patient").on(table.patientId, table.createdAt),
    index("idx_call_logs_bland_id").on(table.blandCallId),
  ]
);
