import { z } from "zod/v4";
import { uuidSchema } from "./uuid";

export const createCallScheduleSchema = z.object({
  patientId: uuidSchema,
  title: z.string().min(1),
  callType: z.enum(["medicine", "checkin"]).default("checkin"),
  purpose: z.string().optional(),
  cadence: z.enum(["daily", "weekly", "biweekly", "monthly", "custom"]),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  assignedUserId: uuidSchema.optional(),
  blandPathwayId: z.string().optional(),
  blandTask: z.string().optional(),
});

export const updateCallScheduleSchema = z.object({
  title: z.string().min(1).optional(),
  callType: z.enum(["medicine", "checkin"]).optional(),
  purpose: z.string().nullable().optional(),
  cadence: z.enum(["daily", "weekly", "biweekly", "monthly", "custom"]).optional(),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).nullable().optional(),
  assignedUserId: uuidSchema.nullable().optional(),
  blandPathwayId: z.string().nullable().optional(),
  blandTask: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateCallScheduleInput = z.infer<typeof createCallScheduleSchema>;
export type UpdateCallScheduleInput = z.infer<typeof updateCallScheduleSchema>;
