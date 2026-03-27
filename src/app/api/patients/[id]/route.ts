import { type NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api/response";
import { validateBody, validateUuid } from "@/lib/api/validate";
import { patientProfilesRepository } from "@/repositories/patient-profiles";
import { updatePatientSchema } from "@/lib/validations/patient-profiles";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!validateUuid(id)) return apiError("Invalid patient ID", 400);

  const patient = await patientProfilesRepository.findById(id);
  if (!patient) return apiError("Patient not found", 404);
  return apiSuccess(patient);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!validateUuid(id)) return apiError("Invalid patient ID", 400);

  const validation = await validateBody(request, updatePatientSchema);
  if (!validation.success) return validation.response;

  const patient = await patientProfilesRepository.update(id, validation.data);
  if (!patient) return apiError("Patient not found", 404);
  return apiSuccess(patient);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!validateUuid(id)) return apiError("Invalid patient ID", 400);

  const patient = await patientProfilesRepository.delete(id);
  if (!patient) return apiError("Patient not found", 404);
  return apiSuccess(patient);
}
