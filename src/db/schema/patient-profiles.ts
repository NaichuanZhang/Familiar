import { pgTable, uuid, text, date, timestamp, jsonb, index } from "drizzle-orm/pg-core";

export const patientProfiles = pgTable(
  "patient_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    nickname: text("nickname"),
    phoneNumber: text("phone_number").notNull(),
    dateOfBirth: date("date_of_birth"),
    location: text("location"),
    timezone: text("timezone").notNull().default("America/Los_Angeles"),
    healthStatus: text("health_status").default("stable"),
    medicalNotes: text("medical_notes"),
    preferences: jsonb("preferences").default({}),
    blandPathwayId: text("bland_pathway_id"),
    blandPersonaId: text("bland_persona_id"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_patient_profiles_phone").on(table.phoneNumber),
    index("idx_patient_profiles_status").on(table.status),
  ]
);
