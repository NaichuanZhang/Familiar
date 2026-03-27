import { type NextRequest } from "next/server";
import { z } from "zod/v4";
import { apiSuccess, apiError } from "@/lib/api/response";
import { validateBody } from "@/lib/api/validate";
import { patientProfilesRepository } from "@/repositories/patient-profiles";
import { triggerBlandCall } from "@/lib/bland-ai/trigger-call";

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

  try {
    const result = await triggerBlandCall({
      phoneNumber: phone,
      task: req.task,
      pathwayId: req.pathwayId,
      personaId: req.personaId,
      voice: req.voice,
      maxDuration: req.maxDuration,
      record: req.record,
      metadata: req.metadata,
      webhookUrl,
    });
    return apiSuccess(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("not configured") || message.includes("Provide task")) {
      return apiError(message, 400);
    }
    return apiError(`Failed to trigger call: ${message}`, 502);
  }
}
