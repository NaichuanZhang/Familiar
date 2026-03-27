import { describe, it, expect, afterAll } from "vitest";
import { patientProfilesRepository } from "../patient-profiles";
import { db } from "@/db";

afterAll(async () => {
  await (db as unknown as { $client: { end: () => Promise<void> } }).$client.end();
});

describe("patientProfilesRepository", () => {
  const PATIENT_ID = "b1000000-0000-0000-0000-000000000001";
  const SARAH_ID = "a1000000-0000-0000-0000-000000000001";

  it("findAll returns seeded patients", async () => {
    const patients = await patientProfilesRepository.findAll();
    expect(patients.length).toBeGreaterThanOrEqual(1);
    expect(patients[0].firstName).toBe("Margaret");
  });

  it("findById returns Margaret Chen", async () => {
    const patient = await patientProfilesRepository.findById(PATIENT_ID);
    expect(patient).not.toBeNull();
    expect(patient!.firstName).toBe("Margaret");
    expect(patient!.nickname).toBe("Mom");
    expect(patient!.healthStatus).toBe("stable");
  });

  it("findById returns null for non-existent id", async () => {
    const patient = await patientProfilesRepository.findById(
      "00000000-0000-0000-0000-000000000000"
    );
    expect(patient).toBeNull();
  });

  it("findByUserId returns patients for Sarah", async () => {
    const results = await patientProfilesRepository.findByUserId(SARAH_ID);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].patient.firstName).toBe("Margaret");
  });

  it("create and delete a patient", async () => {
    const created = await patientProfilesRepository.create({
      firstName: "Test",
      lastName: "Patient",
      phoneNumber: "+10000000000",
    });
    expect(created.id).toBeDefined();
    expect(created.status).toBe("active");

    const deleted = await patientProfilesRepository.delete(created.id);
    expect(deleted).not.toBeNull();
  });
});
