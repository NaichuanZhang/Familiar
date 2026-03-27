import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { actionItems } from "@/db/schema";
import type {
  CreateActionItemInput,
  UpdateActionItemInput,
} from "@/lib/validations/action-items";

export const actionItemsRepository = {
  findAll: async () => {
    return db
      .select()
      .from(actionItems)
      .orderBy(desc(actionItems.createdAt));
  },

  findById: async (id: string) => {
    const [item] = await db
      .select()
      .from(actionItems)
      .where(eq(actionItems.id, id));
    return item ?? null;
  },

  findByPatientId: async (patientId: string) => {
    return db
      .select()
      .from(actionItems)
      .where(eq(actionItems.patientId, patientId))
      .orderBy(desc(actionItems.createdAt));
  },

  findPendingByPatientId: async (patientId: string) => {
    return db
      .select()
      .from(actionItems)
      .where(
        and(
          eq(actionItems.patientId, patientId),
          eq(actionItems.status, "pending")
        )
      )
      .orderBy(desc(actionItems.createdAt));
  },

  create: async (data: CreateActionItemInput & { createdByUserId?: string }) => {
    const [item] = await db.insert(actionItems).values(data).returning();
    return item;
  },

  update: async (id: string, data: UpdateActionItemInput) => {
    const [item] = await db
      .update(actionItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(actionItems.id, id))
      .returning();
    return item ?? null;
  },

  toggleComplete: async (id: string, userId?: string) => {
    const existing = await actionItemsRepository.findById(id);
    if (!existing) return null;

    const isCompleting = existing.status !== "completed";
    const [item] = await db
      .update(actionItems)
      .set({
        status: isCompleting ? "completed" : "pending",
        completedAt: isCompleting ? new Date() : null,
        completedByUserId: isCompleting ? (userId ?? null) : null,
        updatedAt: new Date(),
      })
      .where(eq(actionItems.id, id))
      .returning();
    return item ?? null;
  },

  delete: async (id: string) => {
    const [item] = await db
      .delete(actionItems)
      .where(eq(actionItems.id, id))
      .returning();
    return item ?? null;
  },
};
