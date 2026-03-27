import { type NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api/response";
import { validateBody } from "@/lib/api/validate";
import { callSchedulesRepository } from "@/repositories/call-schedules";
import { createCallScheduleSchema } from "@/lib/validations/call-schedules";

export async function GET(request: NextRequest) {
  const patientId = request.nextUrl.searchParams.get("patientId");
  if (patientId) {
    const schedules =
      await callSchedulesRepository.findActiveByPatientId(patientId);
    return apiSuccess(schedules);
  }
  const schedules = await callSchedulesRepository.findAll();
  return apiSuccess(schedules);
}

export async function POST(request: NextRequest) {
  const validation = await validateBody(request, createCallScheduleSchema);
  if (!validation.success) return validation.response;

  const schedule = await callSchedulesRepository.create(validation.data);
  return apiSuccess(schedule);
}
