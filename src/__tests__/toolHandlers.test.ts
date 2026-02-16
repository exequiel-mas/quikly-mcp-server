import { describe, expect, it } from "vitest";
import {
  buildAnalyzeBriefPayload,
  buildRecommendRatePayload,
  buildShareLinkPayload,
  createQuiklyToolHandlers
} from "../toolHandlers.js";

describe("toolHandlers payload mapping", () => {
  it("buildAnalyzeBriefPayload maps snake_case to API keys and drops undefined", () => {
    const payload = buildAnalyzeBriefPayload({
      brief: "Build a landing page for a SaaS",
      language: undefined,
      existing_requirements: undefined,
      api_key: undefined,
      ai_provider: "gemini",
      openai_api_key: undefined
    });
    expect(payload).toEqual({
      brief: "Build a landing page for a SaaS",
      aiProvider: "gemini"
    });
  });

  it("buildRecommendRatePayload maps my_location -> myLocation and drops undefined", () => {
    const payload = buildRecommendRatePayload({
      role: "Fullstack Developer",
      seniority: "Senior",
      my_location: "Argentina",
      provider_type: undefined,
      client_location: undefined,
      company_size: undefined,
      industry: undefined,
      client_type: undefined,
      language: "es",
      currency: undefined,
      current_rate: undefined,
      api_key: undefined,
      ai_provider: "openai",
      openai_api_key: "sk-test"
    });
    expect(payload).toEqual({
      role: "Fullstack Developer",
      seniority: "Senior",
      myLocation: "Argentina",
      language: "es",
      aiProvider: "openai",
      openaiApiKey: "sk-test"
    });
  });

  it("buildShareLinkPayload defaults send_email to false", () => {
    const payload = buildShareLinkPayload({
      emails: ["a@b.com"],
      send_email: undefined
    });
    expect(payload).toEqual({ emails: ["a@b.com"], send_email: false });
  });
});

describe("toolHandlers behavior", () => {
  it("quikly_create_proposal forwards body as-is", async () => {
    const calls: Array<{ method: string; path: string; body?: unknown }> = [];
    const client = {
      get: async (_path: string) => ({}),
      post: async (path: string, body?: unknown) => {
        calls.push({ method: "POST", path, body });
        return { ok: true };
      }
    } as any;

    const handlers = createQuiklyToolHandlers(client);
    const out = await handlers.quikly_create_proposal({ proposal: { title: "X" } }, {});

    expect(calls).toEqual([{ method: "POST", path: "/proposals", body: { title: "X" } }]);
    expect(out.structuredContent.result).toEqual({ ok: true });
    expect(out.content[0].type).toBe("text");
  });
});

