import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  max_results: z.number().int().positive().optional().default(3),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, max_results } = searchSchema.parse(body);

    const sensoKey = process.env.SENSO_KEY;
    if (!sensoKey) {
      return apiError('SENSO_KEY not configured', 500);
    }

    const response = await fetch('https://apiv2.senso.ai/api/v1/org/search', {
      method: 'POST',
      headers: {
        'X-API-Key': sensoKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        max_results,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return apiError(
        `Senso AI API error: ${response.status} - ${errorText}`,
        response.status
      );
    }

    const data = await response.json();
    return apiSuccess({ answer: data.answer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError('Invalid request data', 400);
    }
    return apiError(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}
