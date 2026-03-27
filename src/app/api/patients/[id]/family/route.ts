import { type NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api/response";
import { validateUuid } from "@/lib/api/validate";
import { userPatientsRepository } from "@/repositories/user-patients";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!validateUuid(id)) return apiError("Invalid patient ID", 400);

  const family = await userPatientsRepository.findFamilyCircle(id);
  return apiSuccess(family);
}
