import { type NextRequest } from "next/server";
import { z } from "zod/v4";
import { apiSuccess, apiError } from "@/lib/api/response";
import { validateBody } from "@/lib/api/validate";
import { searchSenso } from "@/lib/senso/search";

const searchSchema = z.object({
  query: z.string().min(1).max(500),
});

export async function POST(request: NextRequest) {
  const validation = await validateBody(request, searchSchema);
  if (!validation.success) return validation.response;

  try {
    const result = await searchSenso({ query: validation.data.query });
    return apiSuccess({ answer: result.answer });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("not configured")) {
      return apiError(message, 400);
    }
    return apiError(`Knowledge search failed: ${message}`, 502);
  }
}
