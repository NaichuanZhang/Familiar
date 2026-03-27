import { describe, it, expect, afterAll } from "vitest";
import { usersRepository } from "../users";
import { db } from "@/db";

afterAll(async () => {
  await (db as unknown as { $client: { end: () => Promise<void> } }).$client.end();
});

describe("usersRepository", () => {
  it("findAll returns seeded users", async () => {
    const users = await usersRepository.findAll();
    expect(users.length).toBeGreaterThanOrEqual(3);
    expect(users.map((u) => u.name)).toEqual(
      expect.arrayContaining(["Sarah Chen", "David Chen", "Lisa Wong"])
    );
  });

  it("findById returns a user by id", async () => {
    const user = await usersRepository.findById(
      "a1000000-0000-0000-0000-000000000001"
    );
    expect(user).not.toBeNull();
    expect(user!.name).toBe("Sarah Chen");
    expect(user!.email).toBe("sarah@chen.family");
  });

  it("findById returns null for non-existent id", async () => {
    const user = await usersRepository.findById(
      "00000000-0000-0000-0000-000000000000"
    );
    expect(user).toBeNull();
  });

  it("findByEmail returns user by email", async () => {
    const user = await usersRepository.findByEmail("david@chen.family");
    expect(user).not.toBeNull();
    expect(user!.name).toBe("David Chen");
  });

  it("findByEmail returns null for unknown email", async () => {
    const user = await usersRepository.findByEmail("nobody@example.com");
    expect(user).toBeNull();
  });

  it("create and delete a user", async () => {
    const created = await usersRepository.create({
      email: "test-repo@example.com",
      name: "Test User",
    });
    expect(created.id).toBeDefined();
    expect(created.email).toBe("test-repo@example.com");

    const deleted = await usersRepository.delete(created.id);
    expect(deleted).not.toBeNull();
    expect(deleted!.id).toBe(created.id);
  });

  it("update a user", async () => {
    const created = await usersRepository.create({
      email: "update-test@example.com",
      name: "Before Update",
    });

    const updated = await usersRepository.update(created.id, {
      name: "After Update",
    });
    expect(updated).not.toBeNull();
    expect(updated!.name).toBe("After Update");

    await usersRepository.delete(created.id);
  });
});
