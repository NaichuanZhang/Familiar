import { type NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api/response";
import { validateUuid } from "@/lib/api/validate";
import { actionItemsRepository } from "@/repositories/action-items";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!validateUuid(id)) return apiError("Invalid action item ID", 400);

  const item = await actionItemsRepository.toggleComplete(id);
  if (!item) return apiError("Action item not found", 404);
  return apiSuccess(item);
}
