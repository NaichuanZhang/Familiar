import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { userPatients, users } from "@/db/schema";

type CreateUserPatientInput = {
  userId: string;
  patientId: string;
  role?: string;
  relationship?: string;
  displayColor?: string;
};

export const userPatientsRepository = {
  findByPatientId: async (patientId: string) => {
    return db
      .select({
        id: userPatients.id,
        userId: userPatients.userId,
        patientId: userPatients.patientId,
        role: userPatients.role,
        relationship: userPatients.relationship,
        displayColor: userPatients.displayColor,
        createdAt: userPatients.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(userPatients)
      .innerJoin(users, eq(users.id, userPatients.userId))
      .where(eq(userPatients.patientId, patientId));
  },

  findFamilyCircle: async (patientId: string) => {
    return db
      .select({
        name: users.name,
        email: users.email,
        relationship: userPatients.relationship,
        displayColor: userPatients.displayColor,
        role: userPatients.role,
        userId: users.id,
      })
      .from(userPatients)
      .innerJoin(users, eq(users.id, userPatients.userId))
      .where(eq(userPatients.patientId, patientId))
      .orderBy(users.name);
  },

  create: async (data: CreateUserPatientInput) => {
    const [link] = await db.insert(userPatients).values(data).returning();
    return link;
  },

  delete: async (userId: string, patientId: string) => {
    const [link] = await db
      .delete(userPatients)
      .where(
        and(
          eq(userPatients.userId, userId),
          eq(userPatients.patientId, patientId)
        )
      )
      .returning();
    return link ?? null;
  },
};
