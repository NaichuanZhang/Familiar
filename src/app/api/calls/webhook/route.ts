import { type NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api/response";
import { callLogsRepository } from "@/repositories/call-logs";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const callId = body.call_id ?? "unknown";
  const transcript = body.concatenated_transcript ?? "";
  const recordingUrl = body.recording_url;
  const callLength = body.call_length;
  const status = body.status ?? "completed";
  const metadata = body.metadata;

  console.info(`Call completed | id=${callId} status=${status} length=${callLength}`);

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
  }

  return apiSuccess({ received: true });
}
