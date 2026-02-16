import { describe, expect, it } from "vitest";
import { QuiklyClient } from "../../quiklyClient.js";

const RUN = process.env.QUIKLY_RUN_INTEGRATION === "1";
const BASE_URL = process.env.QUIKLY_API_BASE_URL;
const API_KEY = process.env.QUIKLY_API_KEY;

describe("integration: /me", () => {
  const shouldSkip = !RUN || !BASE_URL || !API_KEY;

  it.skipIf(shouldSkip)("returns current user", async () => {
    const client = new QuiklyClient({ baseUrl: BASE_URL!, apiKey: API_KEY!, timeoutMs: 15_000 });
    const me = await client.get<any>("/me");

    // Assert only the shape; don't depend on exact values
    expect(me).toBeTruthy();
    expect(me).toHaveProperty("id");
    expect(me).toHaveProperty("email");
  });
});

