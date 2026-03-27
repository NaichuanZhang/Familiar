export type TriggerCallParams = {
  phoneNumber: string;
  task?: string;
  pathwayId?: string;
  personaId?: string;
  voice?: string;
  maxDuration?: number;
  record?: boolean;
  metadata?: Record<string, unknown>;
  webhookUrl?: string;
};

export type TriggerCallResult = {
  callId: string;
  status: string;
};

export async function triggerBlandCall(
  params: TriggerCallParams,
): Promise<TriggerCallResult> {
  const apiKey = process.env.BLAND_API_KEY;
  if (!apiKey) {
    throw new Error("BLAND_API_KEY not configured");
  }

  const defaultAgentId = process.env.BLAND_AGENT_ID;
  const hasExplicitAgent = !!(params.task || params.pathwayId || params.personaId);

  if (!hasExplicitAgent && !defaultAgentId) {
    throw new Error(
      "Provide task, pathwayId, or personaId (no default agent configured)",
    );
  }

  const payload: Record<string, unknown> = {
    phone_number: params.phoneNumber,
    voice: params.voice ?? "mason",
    max_duration: params.maxDuration ?? 10,
    record: params.record ?? true,
  };

  if (params.task) payload.task = params.task;
  if (params.pathwayId) payload.pathway_id = params.pathwayId;
  if (params.personaId) payload.persona_id = params.personaId;
  if (!hasExplicitAgent && defaultAgentId) payload.persona_id = defaultAgentId;
  if (params.metadata) payload.metadata = params.metadata;
  if (params.webhookUrl) payload.webhook = params.webhookUrl;

  const response = await fetch("https://api.bland.ai/v1/calls", {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
      "User-Agent": "Familiar/0.1.0",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Bland AI error (${response.status}): ${body}`);
  }

  const result = await response.json();
  return {
    callId: result.call_id,
    status: result.status ?? "queued",
  };
}
