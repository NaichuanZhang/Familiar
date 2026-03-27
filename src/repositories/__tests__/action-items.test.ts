import { describe, it, expect, afterAll } from "vitest";
import { actionItemsRepository } from "../action-items";
import { db } from "@/db";

afterAll(async () => {
  await (db as unknown as { $client: { end: () => Promise<void> } }).$client.end();
});

describe("actionItemsRepository", () => {
  const PATIENT_ID = "b1000000-0000-0000-0000-000000000001";

  it("findByPatientId returns seeded items", async () => {
    const items = await actionItemsRepository.findByPatientId(PATIENT_ID);
    expect(items.length).toBe(5);
  });

  it("findPendingByPatientId excludes completed items", async () => {
    const items =
      await actionItemsRepository.findPendingByPatientId(PATIENT_ID);
    expect(items.length).toBe(4);
    items.forEach((item) => {
      expect(item.status).toBe("pending");
    });
  });

  it("create and delete an action item", async () => {
    const created = await actionItemsRepository.create({
      patientId: PATIENT_ID,
      title: "Test action item",
      priority: "low",
    });
    expect(created.id).toBeDefined();
    expect(created.title).toBe("Test action item");

    const deleted = await actionItemsRepository.delete(created.id);
    expect(deleted).not.toBeNull();
  });

  it("toggleComplete flips status", async () => {
    const created = await actionItemsRepository.create({
      patientId: PATIENT_ID,
      title: "Toggle test item",
    });

    const completed = await actionItemsRepository.toggleComplete(created.id);
    expect(completed!.status).toBe("completed");
    expect(completed!.completedAt).not.toBeNull();

    const reopened = await actionItemsRepository.toggleComplete(created.id);
    expect(reopened!.status).toBe("pending");
    expect(reopened!.completedAt).toBeNull();

    await actionItemsRepository.delete(created.id);
  });
});
