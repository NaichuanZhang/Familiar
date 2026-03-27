import { describe, it, expect, afterAll } from "vitest";
import { callSchedulesRepository } from "../call-schedules";
import { db } from "@/db";

afterAll(async () => {
  await (
    db as unknown as { $client: { end: () => Promise<void> } }
  ).$client.end();
});

describe("callSchedulesRepository", () => {
  const PATIENT_ID = "b1000000-0000-0000-0000-000000000001";

  it("findByPatientId returns seeded schedules", async () => {
    const schedules = await callSchedulesRepository.findByPatientId(PATIENT_ID);
    expect(schedules.length).toBeGreaterThanOrEqual(6);
  });

  it("findActiveByPatientId returns only active schedules", async () => {
    const schedules =
      await callSchedulesRepository.findActiveByPatientId(PATIENT_ID);
    expect(schedules.length).toBeGreaterThanOrEqual(1);
    schedules.forEach((s) => {
      expect(s.schedule.isActive).toBe(true);
    });
  });

  it("findById returns a schedule", async () => {
    const schedule = await callSchedulesRepository.findById(
      "c1000000-0000-0000-0000-000000000001",
    );
    expect(schedule).not.toBeNull();
    expect(schedule!.title).toBe("Morning Medicine Reminder");
    expect(schedule!.callType).toBe("medicine");
  });

  it("schedules include assignee name", async () => {
    const schedules = await callSchedulesRepository.findByPatientId(PATIENT_ID);
    const morning = schedules.find(
      (s) => s.schedule.title === "Morning Medicine Reminder",
    );
    expect(morning!.assigneeName).toBe("Sarah Chen");
  });
});
