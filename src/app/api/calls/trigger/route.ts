import { type NextRequest } from "next/server";
import { z } from "zod/v4";
import { apiSuccess, apiError } from "@/lib/api/response";
import { validateBody } from "@/lib/api/validate";
import { patientProfilesRepository } from "@/repositories/patient-profiles";

const triggerCallSchema = z.object({
  phoneNumber: z.string().optional(),
  patientId: z.string().optional(),
  task: z.string().optional(),
  pathwayId: z.string().optional(),
  personaId: z.string().optional(),
  voice: z.string().default("mason"),
  maxDuration: z.number().int().positive().default(10),
  record: z.boolean().default(true),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const apiKey = process.env.BLAND_API_KEY;
  if (!apiKey) {
    return apiError("BLAND_API_KEY not configured", 500);
  }

  const validation = await validateBody(request, triggerCallSchema);
  if (!validation.success) return validation.response;

  const req = validation.data;
  const baseUrl = process.env.BASE_URL ?? "";
  const webhookUrl = baseUrl ? `${baseUrl}/api/calls/webhook` : undefined;

  let phone = req.phoneNumber;
  if (!phone && req.patientId) {
    const patient = await patientProfilesRepository.findById(req.patientId);
    if (patient) phone = patient.phoneNumber;
  }
  if (!phone) phone = process.env.DEFAULT_PHONE_NUMBER;
  if (!phone) {
    return apiError("No phone number provided", 400);
  }

  const defaultAgentId = process.env.BLAND_AGENT_ID;
  const hasExplicitAgent = !!(req.task || req.pathwayId || req.personaId);

  if (!hasExplicitAgent && !defaultAgentId) {
    return apiError(
      "Provide task, pathwayId, or personaId (no default agent configured)",
      400,
    );
  }

  const payload: Record<string, unknown> = {
    phone_number: phone,
    voice: req.voice,
    max_duration: req.maxDuration,
    record: req.record,
  };

  if (req.task) payload.task = req.task;
  if (req.pathwayId) payload.pathway_id = req.pathwayId;
  if (req.personaId) payload.persona_id = req.personaId;
  if (!hasExplicitAgent && defaultAgentId) payload.persona_id = defaultAgentId;
  if (req.metadata) payload.metadata = req.metadata;
  if (webhookUrl) payload.webhook = webhookUrl;

  try {
    const response = await fetch("https://api.bland.ai/v1/calls", {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
        "User-Agent": "Familiar/0.1.0",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      return apiError(`Bland AI error: ${body}`, response.status);
    }

    const result = await response.json();
    return apiSuccess({
      callId: result.call_id,
      status: result.status ?? "queued",
    });
  } catch (e) {
    return apiError(`Failed to reach Bland AI: ${e}`, 502);
  }
}
