import { type NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api/response";
import { validateBody } from "@/lib/api/validate";
import { patientProfilesRepository } from "@/repositories/patient-profiles";
import { createPatientSchema } from "@/lib/validations/patient-profiles";

export async function GET() {
  const patients = await patientProfilesRepository.findAll();
  return apiSuccess(patients);
}

export async function POST(request: NextRequest) {
  const validation = await validateBody(request, createPatientSchema);
  if (!validation.success) return validation.response;

  const patient = await patientProfilesRepository.create(validation.data);
  return apiSuccess(patient);
}
