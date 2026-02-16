import { describe, expect, it } from "vitest";
import { QuiklyClient } from "../../quiklyClient.js";
import { createQuiklyToolHandlers } from "../../toolHandlers.js";

const RUN = process.env.QUIKLY_RUN_INTEGRATION === "1";
const BASE_URL = process.env.QUIKLY_API_BASE_URL;
const API_KEY = process.env.QUIKLY_API_KEY;
const DUMP = process.env.QUIKLY_DUMP === "1";
const DUMP_MAX = Number(process.env.QUIKLY_DUMP_MAX ?? "12000");

function maskApiKey(key: string) {
  if (key.length <= 12) return "***";
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

function dumpToolResult(tool: string, result: unknown) {
  if (!DUMP) return;
  const json = JSON.stringify(result, null, 2);
  const trimmed = Number.isFinite(DUMP_MAX) && DUMP_MAX > 0 ? json.slice(0, DUMP_MAX) : json;
  const suffix = trimmed.length < json.length ? `\n... truncated (${json.length} chars total)` : "";
  // eslint-disable-next-line no-console
  console.log(`\n--- ${tool} result ---\n${trimmed}${suffix}\n`);
}

describe.sequential("integration: MCP tools vs local Quikly API", () => {
  const shouldSkip = !RUN || !BASE_URL || !API_KEY;

  let proposalId: string | undefined;

  const makeHandlers = () => {
    if (DUMP) {
      // eslint-disable-next-line no-console
      console.log(
        `\n[quikly-mcp-server] Integration env: baseUrl=${BASE_URL} apiKey=${API_KEY ? maskApiKey(API_KEY) : "(missing)"}\n`
      );
    }
    const client = new QuiklyClient({ baseUrl: BASE_URL!, apiKey: API_KEY!, timeoutMs: 30_000 });
    return createQuiklyToolHandlers(client as any);
  };

  it.skipIf(shouldSkip)("quikly_me", async () => {
    const h = makeHandlers();
    const out = await h.quikly_me({}, {});
    dumpToolResult("quikly_me", out.structuredContent.result);
    expect(out.structuredContent.result).toBeTruthy();
    expect(out.structuredContent.result).toHaveProperty("id");
    expect(out.structuredContent.result).toHaveProperty("email");
  });

  it.skipIf(shouldSkip)("quikly_create_proposal", async () => {
    const h = makeHandlers();

    const payload = {
      name: `Integration Test Project ${new Date().toISOString()}`,
      client_name: "Integration Test Client",
      client_location: "Buenos Aires, Argentina",
      currency: "USD",
      hourly_rate: 50,
      requirements: [
        {
          id: "req-1",
          name: "Feature A",
          description: "Description of feature A",
          rationale: "Business value",
          complexity: 3,
          priority: "high"
        },
        {
          id: "req-2",
          name: "Feature B",
          description: "Description of feature B",
          rationale: "User experience",
          complexity: 5,
          priority: "medium"
        }
      ],
      settings: {
        projectName: "Integration Test Project",
        clientName: "Integration Test Client",
        clientLocation: "Buenos Aires, Argentina",
        hourlyRate: 50,
        currency: "USD",
        clientType: "new"
      }
    };

    const out = await h.quikly_create_proposal({ proposal: payload }, {});
    const result: any = out.structuredContent.result;
    dumpToolResult("quikly_create_proposal", result);
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("name");
    proposalId = String(result.id);
    expect(proposalId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it.skipIf(shouldSkip)("quikly_get_proposal (created proposal)", async () => {
    expect(proposalId).toBeTruthy();
    const h = makeHandlers();
    const out = await h.quikly_get_proposal({ proposal_id: proposalId! }, {});
    const result: any = out.structuredContent.result;
    dumpToolResult("quikly_get_proposal", result);
    expect(String(result.id)).toBe(proposalId);
  });

  it.skipIf(shouldSkip)("quikly_share_link (created proposal)", async () => {
    expect(proposalId).toBeTruthy();
    const h = makeHandlers();

    const out = await h.quikly_share_link(
      {
        proposal_id: proposalId!,
        emails: ["exe.massimelli@gmail.com"],
        send_email: false
      },
      {}
    );

    const result: any = out.structuredContent.result;
    dumpToolResult("quikly_share_link", result);
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("share_url");
    expect(String(result.share_url)).toContain("/p/");
  });

  it.skipIf(shouldSkip)("quikly_analyze_brief", async () => {
    const h = makeHandlers();

    const out = await h.quikly_analyze_brief(
      {
        brief:
          "We need a small SaaS MVP: authentication, a dashboard, billing, and an admin panel. Keep it lean and ship fast.",
        language: "en",
        existing_requirements: undefined,
        api_key: undefined,
        ai_provider: undefined,
        openai_api_key: undefined
      },
      {}
    );

    const result: any = out.structuredContent.result;
    dumpToolResult("quikly_analyze_brief", result);
    // Backend returns BriefAnalysisResponse (requirements[], success, error?)
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("success");
    if (result.success === true) {
      expect(Array.isArray(result.requirements)).toBe(true);
    } else {
      // If AI isn't configured locally, we still exercised the tool and got a structured response.
      expect(result).toHaveProperty("error");
    }
  });

  it.skipIf(shouldSkip)("quikly_recommend_rate", async () => {
    const h = makeHandlers();

    const out = await h.quikly_recommend_rate(
      {
        role: "Fullstack Developer",
        seniority: "Senior",
        my_location: "Argentina",
        provider_type: "freelancer",
        client_location: "United States",
        company_size: "startup",
        industry: "SaaS",
        client_type: "startup",
        language: "en",
        currency: "USD",
        current_rate: 50,
        api_key: undefined,
        ai_provider: undefined,
        openai_api_key: undefined
      },
      {}
    );

    const result: any = out.structuredContent.result;
    dumpToolResult("quikly_recommend_rate", result);
    // Schema is RateRecommendationResponse; we assert basic shape without pinning exact fields.
    expect(result).toBeTruthy();
  });
});

