import { z } from "zod/v4";
import { uuidSchema } from "./uuid";

export const createActionItemSchema = z.object({
  patientId: uuidSchema,
  callId: uuidSchema.optional(),
  assignedUserId: uuidSchema.optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  dueDate: z.string().optional(),
});

export const updateActionItemSchema = z.object({
  assignedUserId: uuidSchema.nullable().optional(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z.enum(["pending", "in_progress", "completed", "dismissed"]).optional(),
  dueDate: z.string().nullable().optional(),
});

export type CreateActionItemInput = z.infer<typeof createActionItemSchema>;
export type UpdateActionItemInput = z.infer<typeof updateActionItemSchema>;
