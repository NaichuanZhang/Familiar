import { type NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api/response";
import { validateBody } from "@/lib/api/validate";
import { actionItemsRepository } from "@/repositories/action-items";
import { createActionItemSchema } from "@/lib/validations/action-items";

export async function GET(request: NextRequest) {
  const patientId = request.nextUrl.searchParams.get("patientId");
  if (patientId) {
    const items = await actionItemsRepository.findByPatientId(patientId);
    return apiSuccess(items);
  }
  const items = await actionItemsRepository.findAll();
  return apiSuccess(items);
}

export async function POST(request: NextRequest) {
  const validation = await validateBody(request, createActionItemSchema);
  if (!validation.success) return validation.response;

  const item = await actionItemsRepository.create(validation.data);
  return apiSuccess(item);
}
