import { type NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api/response";
import { validateBody, validateUuid } from "@/lib/api/validate";
import { usersRepository } from "@/repositories/users";
import { updateUserSchema } from "@/lib/validations/users";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!validateUuid(id)) return apiError("Invalid user ID", 400);

  const user = await usersRepository.findById(id);
  if (!user) return apiError("User not found", 404);
  return apiSuccess(user);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!validateUuid(id)) return apiError("Invalid user ID", 400);

  const validation = await validateBody(request, updateUserSchema);
  if (!validation.success) return validation.response;

  const user = await usersRepository.update(id, validation.data);
  if (!user) return apiError("User not found", 404);
  return apiSuccess(user);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!validateUuid(id)) return apiError("Invalid user ID", 400);

  const user = await usersRepository.delete(id);
  if (!user) return apiError("User not found", 404);
  return apiSuccess(user);
}
