import { type NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api/response";
import { callLogsRepository } from "@/repositories/call-logs";

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.BLAND_WEBHOOK_SECRET;
  if (expectedSecret) {
    const secret = request.headers.get("x-webhook-secret");
    if (secret !== expectedSecret) {
      return apiError("Unauthorized", 401);
    }
  }

  const body = await request.json();

  const callId = body.call_id ?? "unknown";
  const transcript = body.concatenated_transcript ?? "";
  const recordingUrl = body.recording_url;
  const callLength = body.call_length;
  const status = body.status ?? "completed";
  const metadata = body.metadata;

  console.info(
    `Webhook received | call_id=${callId} status=${status} length=${callLength}`,
  );

  try {
    const existing = await callLogsRepository.findByBlandCallId(callId);
    if (existing) {
      await callLogsRepository.updateStatus(existing.id, status, {
        transcript,
        recordingUrl,
        callDurationSecs: callLength ? Math.round(callLength) : undefined,
        metadata,
        endedAt: new Date(),
      });
    } else if (metadata?.patientId) {
      await callLogsRepository.create({
        patientId: metadata.patientId as string,
        blandCallId: callId,
        status,
        transcript,
        recordingUrl,
        callDurationSecs: callLength ? Math.round(callLength) : undefined,
        metadata,
        endedAt: new Date(),
      });
    } else {
      console.warn(
        `Webhook data dropped | call_id=${callId} — no matching log and no patientId in metadata`,
      );
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`Webhook processing failed | call_id=${callId}: ${message}`);
    return apiError("Failed to process webhook", 500);
  }

  return apiSuccess({ received: true });
}
