import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { CreateUserInput, UpdateUserInput } from "@/lib/validations/users";

export const usersRepository = {
  findAll: async () => {
    return db.select().from(users).orderBy(users.name);
  },

  findById: async (id: string) => {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ?? null;
  },

  findByEmail: async (email: string) => {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user ?? null;
  },

  create: async (data: CreateUserInput) => {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },

  update: async (id: string, data: UpdateUserInput) => {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user ?? null;
  },

  delete: async (id: string) => {
    const [user] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return user ?? null;
  },
};
