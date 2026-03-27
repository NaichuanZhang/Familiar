import { apiSuccess } from "@/lib/api/response";

export async function GET() {
  return apiSuccess({ message: "Hello from Familiar" });
}
