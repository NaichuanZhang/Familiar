import { type NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api/response";
import { validateUuid } from "@/lib/api/validate";
import { callLogsRepository } from "@/repositories/call-logs";
import { actionItemsRepository } from "@/repositories/action-items";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!validateUuid(id)) return apiError("Invalid patient ID", 400);

  const limit = 10;

  const [callLogs, actionItems] = await Promise.all([
    callLogsRepository.findRecentByPatientId(id, limit),
    actionItemsRepository.findByPatientId(id),
  ]);

  const activity = [
    ...callLogs.map((log) => ({
      type: `call-${log.status}` as const,
      detail: `${log.status === "completed" ? `Call completed — ${Math.round((log.callDurationSecs ?? 0) / 60)} min` : `Call ${log.status}`}`,
      timestamp: log.createdAt,
      entityId: log.id,
    })),
    ...actionItems
      .filter((item) => item.status === "completed" || item.status === "pending")
      .slice(0, limit)
      .map((item) => ({
        type: "action-added" as const,
        detail: `Added: ${item.title}`,
        timestamp: item.createdAt,
        entityId: item.id,
      })),
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit);

  return apiSuccess(activity);
}
