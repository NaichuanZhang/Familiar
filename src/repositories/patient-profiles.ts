import { eq } from "drizzle-orm";
import { db } from "@/db";
import { patientProfiles, userPatients } from "@/db/schema";
import type {
  CreatePatientInput,
  UpdatePatientInput,
} from "@/lib/validations/patient-profiles";

export const patientProfilesRepository = {
  findAll: async () => {
    return db.select().from(patientProfiles).orderBy(patientProfiles.lastName);
  },

  findById: async (id: string) => {
    const [patient] = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.id, id));
    return patient ?? null;
  },

  findByUserId: async (userId: string) => {
    return db
      .select({ patient: patientProfiles })
      .from(patientProfiles)
      .innerJoin(userPatients, eq(userPatients.patientId, patientProfiles.id))
      .where(eq(userPatients.userId, userId));
  },

  create: async (data: CreatePatientInput) => {
    const [patient] = await db
      .insert(patientProfiles)
      .values(data)
      .returning();
    return patient;
  },

  update: async (id: string, data: UpdatePatientInput) => {
    const [patient] = await db
      .update(patientProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(patientProfiles.id, id))
      .returning();
    return patient ?? null;
  },

  delete: async (id: string) => {
    const [patient] = await db
      .delete(patientProfiles)
      .where(eq(patientProfiles.id, id))
      .returning();
    return patient ?? null;
  },
};
