import {
  pgTable,
  uuid,
  text,
  time,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { patientProfiles } from "./patient-profiles";
import { users } from "./users";

export const callSchedules = pgTable(
  "call_schedules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patientProfiles.id, { onDelete: "cascade" }),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    callType: text("call_type").notNull().default("checkin"),
    purpose: text("purpose"),
    cadence: text("cadence").notNull(),
    scheduledTime: time("scheduled_time").notNull(),
    daysOfWeek: integer("days_of_week").array(),
    assignedUserId: uuid("assigned_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    blandPathwayId: text("bland_pathway_id"),
    blandTask: text("bland_task"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_call_schedules_patient").on(table.patientId, table.isActive),
  ]
);
