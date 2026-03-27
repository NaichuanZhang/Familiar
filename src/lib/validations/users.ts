import { z } from "zod/v4";

export const createUserSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  authProviderId: z.string().optional(),
});

export const updateUserSchema = z.object({
  email: z.email().optional(),
  name: z.string().min(1).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  authProviderId: z.string().nullable().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
