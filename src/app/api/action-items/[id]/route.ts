import { type NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api/response";
import { validateBody, validateUuid } from "@/lib/api/validate";
import { actionItemsRepository } from "@/repositories/action-items";
import { updateActionItemSchema } from "@/lib/validations/action-items";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!validateUuid(id)) return apiError("Invalid action item ID", 400);

  const item = await actionItemsRepository.findById(id);
  if (!item) return apiError("Action item not found", 404);
  return apiSuccess(item);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!validateUuid(id)) return apiError("Invalid action item ID", 400);

  const validation = await validateBody(request, updateActionItemSchema);
  if (!validation.success) return validation.response;

  const item = await actionItemsRepository.update(id, validation.data);
  if (!item) return apiError("Action item not found", 404);
  return apiSuccess(item);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!validateUuid(id)) return apiError("Invalid action item ID", 400);

  const item = await actionItemsRepository.delete(id);
  if (!item) return apiError("Action item not found", 404);
  return apiSuccess(item);
}
