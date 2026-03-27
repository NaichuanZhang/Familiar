import { type NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api/response";
import { validateBody } from "@/lib/api/validate";
import { usersRepository } from "@/repositories/users";
import { createUserSchema } from "@/lib/validations/users";

export async function GET() {
  const users = await usersRepository.findAll();
  return apiSuccess(users);
}

export async function POST(request: NextRequest) {
  const validation = await validateBody(request, createUserSchema);
  if (!validation.success) return validation.response;

  const user = await usersRepository.create(validation.data);
  return apiSuccess(user);
}
