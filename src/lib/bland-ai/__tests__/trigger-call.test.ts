import { describe, it, expect, vi, beforeEach } from "vitest";
import { triggerBlandCall } from "../trigger-call";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.stubEnv("BLAND_API_KEY", "test-api-key");
  vi.stubEnv("BLAND_AGENT_ID", "test-agent-id");
  mockFetch.mockReset();
});

describe("triggerBlandCall", () => {
  it("calls Bland AI API with correct payload", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ call_id: "call-123", status: "queued" }),
    });

    const result = await triggerBlandCall({
      phoneNumber: "+12125551234",
      task: "Check on medications",
      voice: "mason",
      maxDuration: 10,
    });

    expect(result).toEqual({ callId: "call-123", status: "queued" });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.bland.ai/v1/calls",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "test-api-key",
          "Content-Type": "application/json",
        }),
      }),
    );

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.phone_number).toBe("+12125551234");
    expect(body.task).toBe("Check on medications");
    expect(body.voice).toBe("mason");
  });

  it("uses default agent ID when no explicit agent provided", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ call_id: "call-456", status: "queued" }),
    });

    await triggerBlandCall({ phoneNumber: "+12125551234" });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.persona_id).toBe("test-agent-id");
  });

  it("throws when BLAND_API_KEY is not set", async () => {
    vi.stubEnv("BLAND_API_KEY", "");

    await expect(
      triggerBlandCall({ phoneNumber: "+12125551234", task: "test" }),
    ).rejects.toThrow("BLAND_API_KEY not configured");
  });

  it("throws when no agent configured and no task/pathway/persona", async () => {
    vi.stubEnv("BLAND_AGENT_ID", "");

    await expect(
      triggerBlandCall({ phoneNumber: "+12125551234" }),
    ).rejects.toThrow("Provide task, pathwayId, or personaId");
  });

  it("throws on non-OK response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => "Bad request",
    });

    await expect(
      triggerBlandCall({ phoneNumber: "+12125551234", task: "test" }),
    ).rejects.toThrow("Bland AI error (400): Bad request");
  });

  it("includes webhook URL when provided", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ call_id: "call-789", status: "queued" }),
    });

    await triggerBlandCall({
      phoneNumber: "+12125551234",
      task: "test",
      webhookUrl: "https://example.com/webhook",
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.webhook).toBe("https://example.com/webhook");
  });

  it("includes metadata when provided", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ call_id: "call-101", status: "queued" }),
    });

    await triggerBlandCall({
      phoneNumber: "+12125551234",
      task: "test",
      metadata: { scheduleId: "sched-1", automated: true },
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.metadata).toEqual({ scheduleId: "sched-1", automated: true });
  });
});
