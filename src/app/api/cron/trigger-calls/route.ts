import { type NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api/response";
import { callSchedulesRepository } from "@/repositories/call-schedules";
import { callLogsRepository } from "@/repositories/call-logs";
import { triggerBlandCall } from "@/lib/bland-ai/trigger-call";
import {
  shouldTriggerSchedule,
  nowInTimezone,
} from "@/lib/scheduler/should-trigger";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return apiError("Unauthorized", 401);
  }

  const baseUrl = process.env.BASE_URL ?? "";
  const webhookUrl = baseUrl ? `${baseUrl}/api/calls/webhook` : undefined;
  const webhookSecret = process.env.BLAND_WEBHOOK_SECRET;
  const windowMinutes = 5;

  const activeSchedules = await callSchedulesRepository.findAllActive();

  let triggeredCount = 0;
  const errors: string[] = [];

  for (const row of activeSchedules) {
    const { schedule, patientPhone, patientTimezone } = row;

    const nowLocal = nowInTimezone(patientTimezone);
    const shouldTrigger = shouldTriggerSchedule(
      {
        scheduledTime: schedule.scheduledTime,
        cadence: schedule.cadence,
        daysOfWeek: schedule.daysOfWeek,
        isActive: schedule.isActive,
      },
      { nowInPatientTz: nowLocal, windowMinutes },
    );

    if (!shouldTrigger) continue;

    // Dedup: check if already triggered today in patient's timezone
    const todayStr = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, "0")}-${String(nowLocal.getDate()).padStart(2, "0")}`;
    const existing = await callLogsRepository.findByScheduleIdAndDate(
      schedule.id,
      todayStr,
    );
    if (existing) continue;

    // Create queued log entry
    const log = await callLogsRepository.create({
      patientId: schedule.patientId,
      scheduleId: schedule.id,
      status: "queued",
      metadata: {
        automated: true,
        scheduledTime: schedule.scheduledTime,
        cadence: schedule.cadence,
      },
      startedAt: new Date(),
    });

    try {
      const result = await triggerBlandCall({
        phoneNumber: patientPhone,
        task: schedule.blandTask ?? schedule.purpose ?? schedule.title,
        pathwayId: schedule.blandPathwayId ?? undefined,
        metadata: {
          scheduleId: schedule.id,
          patientId: schedule.patientId,
          callLogId: log.id,
          automated: true,
        },
        webhookUrl,
        webhookSecret,
      });

      await callLogsRepository.updateStatus(log.id, "in_progress", {
        blandCallId: result.callId,
      });
      triggeredCount++;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await callLogsRepository.updateStatus(log.id, "failed");
      errors.push(`Schedule ${schedule.id}: ${message}`);
    }
  }

  return apiSuccess({
    triggered: triggeredCount,
    checked: activeSchedules.length,
    errors: errors.length > 0 ? errors : undefined,
    checkedAt: new Date().toISOString(),
  });
}
