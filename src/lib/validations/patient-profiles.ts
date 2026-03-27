import { z } from "zod/v4";

export const createPatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nickname: z.string().optional(),
  phoneNumber: z.string().min(1),
  dateOfBirth: z.string().optional(),
  location: z.string().optional(),
  timezone: z.string().default("America/Los_Angeles"),
  healthStatus: z.enum(["stable", "needs_attention", "critical"]).default("stable"),
  medicalNotes: z.string().optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
  blandPathwayId: z.string().optional(),
  blandPersonaId: z.string().optional(),
});

export const updatePatientSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  nickname: z.string().nullable().optional(),
  phoneNumber: z.string().min(1).optional(),
  dateOfBirth: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  timezone: z.string().optional(),
  healthStatus: z.enum(["stable", "needs_attention", "critical"]).optional(),
  medicalNotes: z.string().nullable().optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
  blandPathwayId: z.string().nullable().optional(),
  blandPersonaId: z.string().nullable().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
