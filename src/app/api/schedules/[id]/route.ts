import { type NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api/response";
import { validateBody, validateUuid } from "@/lib/api/validate";
import { callSchedulesRepository } from "@/repositories/call-schedules";
import { updateCallScheduleSchema } from "@/lib/validations/call-schedules";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!validateUuid(id)) return apiError("Invalid schedule ID", 400);

  const schedule = await callSchedulesRepository.findById(id);
  if (!schedule) return apiError("Schedule not found", 404);
  return apiSuccess(schedule);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!validateUuid(id)) return apiError("Invalid schedule ID", 400);

  const validation = await validateBody(request, updateCallScheduleSchema);
  if (!validation.success) return validation.response;

  const schedule = await callSchedulesRepository.update(id, validation.data);
  if (!schedule) return apiError("Schedule not found", 404);
  return apiSuccess(schedule);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!validateUuid(id)) return apiError("Invalid schedule ID", 400);

  const schedule = await callSchedulesRepository.delete(id);
  if (!schedule) return apiError("Schedule not found", 404);
  return apiSuccess(schedule);
}
