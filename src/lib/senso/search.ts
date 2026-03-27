export type SearchParams = {
  query: string;
  maxResults?: number;
};

export type SearchResult = {
  answer: string;
};

export async function searchSenso(
  params: SearchParams,
): Promise<SearchResult> {
  const apiKey = process.env.SENSO_KEY;
  if (!apiKey) {
    throw new Error("SENSO_KEY not configured");
  }

  const response = await fetch("https://apiv2.senso.ai/api/v1/org/search", {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
      "User-Agent": "Familiar/0.1.0",
    },
    body: JSON.stringify({
      query: params.query,
      max_results: params.maxResults ?? 3,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Senso AI error (${response.status}): ${body}`);
  }

  const result = await response.json();

  if (typeof result !== "object" || result === null || Array.isArray(result)) {
    throw new Error("Senso AI returned an invalid response format");
  }

  return { answer: result.answer ?? "" };
}
