import { pgTable, uuid, text, timestamp, index, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { patientProfiles } from "./patient-profiles";

export const userPatients = pgTable(
  "user_patients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patientProfiles.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("family_member"),
    relationship: text("relationship"),
    displayColor: text("display_color"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("uq_user_patient").on(table.userId, table.patientId),
    index("idx_user_patients_user").on(table.userId),
    index("idx_user_patients_patient").on(table.patientId),
  ]
);
