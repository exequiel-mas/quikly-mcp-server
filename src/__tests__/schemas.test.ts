import { describe, expect, it } from "vitest";
import { CreateProposalInputSchema, GetProposalInputSchema, ShareLinkInputSchema } from "../schemas.js";

describe("schemas", () => {
  it("CreateProposalInputSchema requires proposal", () => {
    expect(() => CreateProposalInputSchema.parse({})).toThrow(/proposal/i);
  });

  it("CreateProposalInputSchema accepts record proposal", () => {
    const parsed = CreateProposalInputSchema.parse({ proposal: { title: "Test", amount: 123 } });
    expect(parsed.proposal).toMatchObject({ title: "Test", amount: 123 });
  });

  it("GetProposalInputSchema validates uuid", () => {
    expect(() => GetProposalInputSchema.parse({ proposal_id: "not-a-uuid" })).toThrow();
  });

  it("ShareLinkInputSchema defaults send_email to false", () => {
    const parsed = ShareLinkInputSchema.parse({
      proposal_id: "37aa28de-4f0e-45ab-afeb-c1f548a195d4",
      emails: ["a@b.com"]
    });
    expect(parsed.send_email).toBe(false);
  });
});

