import type { NextRequest } from "next/server";
import type { z } from "zod/v4";
import { apiError } from "./response";

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; response: ReturnType<typeof apiError> };

export async function validateBody<T>(
  request: NextRequest,
  schema: z.ZodType<T>
): Promise<ValidationResult<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { success: false, response: apiError("Invalid JSON body", 400) };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return { success: false, response: apiError(`Validation error: ${issues}`, 400) };
  }

  return { success: true, data: result.data };
}

export function validateUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id
  );
}
