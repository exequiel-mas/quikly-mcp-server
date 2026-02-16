import type { QuiklyClient } from "./quiklyClient.js";
import type { AnalyzeBriefInput, RecommendRateInput, ShareLinkInput } from "./schemas.js";

type ToolResult<T> = {
  content: Array<{ type: "text"; text: string }>;
  structuredContent: { result: T };
};

function asToolResult<T>(result: T): ToolResult<T> {
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    structuredContent: { result }
  };
}

export function dropUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

export function buildAnalyzeBriefPayload(params: AnalyzeBriefInput): Record<string, unknown> {
  return dropUndefined({
    brief: params.brief,
    language: params.language,
    existingRequirements: params.existing_requirements,
    apiKey: params.api_key,
    aiProvider: params.ai_provider,
    openaiApiKey: params.openai_api_key
  });
}

export function buildRecommendRatePayload(params: RecommendRateInput): Record<string, unknown> {
  return dropUndefined({
    role: params.role,
    seniority: params.seniority,
    myLocation: params.my_location,
    providerType: params.provider_type,
    clientLocation: params.client_location,
    companySize: params.company_size,
    industry: params.industry,
    clientType: params.client_type,
    language: params.language,
    currency: params.currency,
    currentRate: params.current_rate,
    apiKey: params.api_key,
    aiProvider: params.ai_provider,
    openaiApiKey: params.openai_api_key
  });
}

export function buildShareLinkPayload(params: Pick<ShareLinkInput, "emails" | "send_email">): Record<string, unknown> {
  return {
    emails: params.emails,
    send_email: params.send_email ?? false
  };
}

export function createQuiklyToolHandlers(client: QuiklyClient) {
  return {
    quikly_me: async (_args: Record<string, never>, _extra: unknown) => {
      const result = await client.get("/me");
      return asToolResult(result);
    },

    quikly_create_proposal: async ({ proposal }: { proposal: Record<string, unknown> }, _extra: unknown) => {
      const result = await client.post("/proposals", proposal);
      return asToolResult(result);
    },

    quikly_analyze_brief: async (params: AnalyzeBriefInput, _extra: unknown) => {
      const payload = buildAnalyzeBriefPayload(params);
      const result = await client.post("/ai/analyze-brief", payload);
      return asToolResult(result);
    },

    quikly_recommend_rate: async (params: RecommendRateInput, _extra: unknown) => {
      const payload = buildRecommendRatePayload(params);
      const result = await client.post("/ai/rate-recommendation", payload);
      return asToolResult(result);
    },

    quikly_get_proposal: async ({ proposal_id }: { proposal_id: string }, _extra: unknown) => {
      const result = await client.get(`/proposals/${proposal_id}`);
      return asToolResult(result);
    },

    quikly_share_link: async (params: ShareLinkInput, _extra: unknown) => {
      const payload = buildShareLinkPayload(params);
      const result = await client.post(`/proposals/${params.proposal_id}/share`, payload);
      return asToolResult(result);
    },

    quikly_list_proposal_messages: async (
      { proposal_id }: { proposal_id: string },
      _extra: unknown
    ) => {
      const result = await client.get(`/proposals/${proposal_id}/messages`);
      return asToolResult(result);
    },

    quikly_reply_proposal_message: async (
      { proposal_id, content }: { proposal_id: string; content: string },
      _extra: unknown
    ) => {
      const result = await client.post(`/proposals/${proposal_id}/messages`, { content });
      return asToolResult(result);
    }
  };
}

