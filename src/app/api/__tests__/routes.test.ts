import { describe, it, expect, afterAll } from "vitest";
import { db } from "@/db";

const BASE = "http://localhost:3000";

async function api(path: string, options?: RequestInit) {
  // We test API logic by importing route handlers directly
  // This avoids needing a running server
  return null; // placeholder — see integration tests below
}

// These tests verify the validation and response utilities directly
// Full route handler tests require a running server (covered in E2E)

describe("API validation utilities", () => {
  it("validateUuid accepts valid UUIDs", async () => {
    const { validateUuid } = await import("@/lib/api/validate");
    expect(validateUuid("a1000000-0000-0000-0000-000000000001")).toBe(true);
    expect(validateUuid("not-a-uuid")).toBe(false);
    expect(validateUuid("")).toBe(false);
  });

  it("apiSuccess returns correct envelope", async () => {
    const { apiSuccess } = await import("@/lib/api/response");
    const response = apiSuccess({ test: true });
    const body = await response.json();
    expect(body).toEqual({
      success: true,
      data: { test: true },
      error: null,
    });
    expect(response.status).toBe(200);
  });

  it("apiError returns correct envelope", async () => {
    const { apiError } = await import("@/lib/api/response");
    const response = apiError("Not found", 404);
    const body = await response.json();
    expect(body).toEqual({
      success: false,
      data: null,
      error: "Not found",
    });
    expect(response.status).toBe(404);
  });
});

describe("Zod validation schemas", () => {
  it("createUserSchema validates correctly", async () => {
    const { createUserSchema } = await import("@/lib/validations/users");
    const valid = createUserSchema.safeParse({
      email: "test@example.com",
      name: "Test",
    });
    expect(valid.success).toBe(true);

    const invalid = createUserSchema.safeParse({ email: "bad", name: "" });
    expect(invalid.success).toBe(false);
  });

  it("createCallScheduleSchema validates time format", async () => {
    const { createCallScheduleSchema } = await import(
      "@/lib/validations/call-schedules"
    );
    const valid = createCallScheduleSchema.safeParse({
      patientId: "a1000000-0000-0000-0000-000000000001",
      title: "Test",
      cadence: "daily",
      scheduledTime: "09:00",
    });
    expect(valid.success).toBe(true);

    const invalidTime = createCallScheduleSchema.safeParse({
      patientId: "a1000000-0000-0000-0000-000000000001",
      title: "Test",
      cadence: "daily",
      scheduledTime: "9am",
    });
    expect(invalidTime.success).toBe(false);
  });

  it("createActionItemSchema validates priority enum", async () => {
    const { createActionItemSchema } = await import(
      "@/lib/validations/action-items"
    );
    const valid = createActionItemSchema.safeParse({
      patientId: "a1000000-0000-0000-0000-000000000001",
      title: "Test item",
      priority: "high",
    });
    expect(valid.success).toBe(true);

    const invalid = createActionItemSchema.safeParse({
      patientId: "a1000000-0000-0000-0000-000000000001",
      title: "Test",
      priority: "super-high",
    });
    expect(invalid.success).toBe(false);
  });
});

describe("API route handlers (integration)", () => {
  it("GET /api/hello returns greeting", async () => {
    const { GET } = await import("@/app/api/hello/route");
    const response = await GET();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.message).toBe("Hello from Familiar");
  });

  it("GET /api/health returns ok", async () => {
    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const body = await response.json();
    expect(body.data.status).toBe("ok");
  });

  it("GET /api/users returns seeded users", async () => {
    const { GET } = await import("@/app/api/users/route");
    const response = await GET();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(3);
  });

  it("GET /api/patients returns seeded patients", async () => {
    const { GET } = await import("@/app/api/patients/route");
    const response = await GET();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
  });
});

afterAll(async () => {
  await (db as unknown as { $client: { end: () => Promise<void> } }).$client.end();
});
