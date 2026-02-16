import { z } from "zod";

export const CreateProposalInputSchema = z
  .object({
    proposal: z
      .record(z.string(), z.unknown())
      .describe("Proposal payload (matches Quikly ProposalCreate schema)")
  })
  .strict();

export const AnalyzeBriefInputSchema = z
  .object({
    brief: z.string().min(5).describe("Project brief text"),
    language: z.string().optional().describe("Output language (e.g. 'en' | 'es')"),
    existing_requirements: z
      .array(z.record(z.string(), z.unknown()))
      .optional()
      .describe("Existing requirements to refine"),
    api_key: z.string().optional().describe("Optional Gemini API key override (if you want to provide your own)"),
    ai_provider: z.string().optional().describe("AI provider override (e.g. 'gemini' | 'openai')"),
    openai_api_key: z.string().optional().describe("Optional OpenAI key override when provider=openai")
  })
  .strict();

export const RecommendRateInputSchema = z
  .object({
    role: z.string().describe("Role (e.g. 'Fullstack Developer')"),
    seniority: z.string().describe("Seniority (e.g. 'Senior')"),
    my_location: z.string().describe("Your location / country (e.g. 'Argentina')"),
    provider_type: z.string().optional().describe("Provider type (freelancer | agency | team)"),
    client_location: z.string().optional().describe("Client location/country"),
    company_size: z.string().optional().describe("Client company size"),
    industry: z.string().optional().describe("Client industry"),
    client_type: z.string().optional().describe("Client type (startup/enterprise/etc)"),
    language: z.string().optional().describe("Output language"),
    currency: z.string().optional().describe("Currency code (e.g. USD)"),
    current_rate: z.number().optional().describe("Your current hourly rate (if any)"),
    api_key: z.string().optional().describe("Optional Gemini API key override (if you want to provide your own)"),
    ai_provider: z.string().optional().describe("AI provider override (e.g. 'gemini' | 'openai')"),
    openai_api_key: z.string().optional().describe("Optional OpenAI key override when provider=openai")
  })
  .strict();

export const GetProposalInputSchema = z
  .object({
    proposal_id: z.string().uuid().describe("Proposal UUID")
  })
  .strict();

export const ShareLinkInputSchema = z
  .object({
    proposal_id: z.string().uuid().describe("Proposal UUID"),
    emails: z.array(z.string().email()).min(1).max(2).describe("Authorized emails (max 2)"),
    send_email: z.boolean().optional().default(false).describe("If true, Quikly will send email invites")
  })
  .strict();

export const MeInputSchema = z.object({}).strict();

export const ListProposalMessagesInputSchema = z
  .object({
    proposal_id: z.string().uuid().describe("Proposal UUID")
  })
  .strict();

export const ReplyProposalMessageInputSchema = z
  .object({
    proposal_id: z.string().uuid().describe("Proposal UUID"),
    content: z.string().min(1).describe("Message content to send to the client")
  })
  .strict();

export type CreateProposalInput = z.infer<typeof CreateProposalInputSchema>;
export type AnalyzeBriefInput = z.infer<typeof AnalyzeBriefInputSchema>;
export type RecommendRateInput = z.infer<typeof RecommendRateInputSchema>;
export type GetProposalInput = z.infer<typeof GetProposalInputSchema>;
export type ShareLinkInput = z.infer<typeof ShareLinkInputSchema>;
export type ListProposalMessagesInput = z.infer<typeof ListProposalMessagesInputSchema>;
export type ReplyProposalMessageInput = z.infer<typeof ReplyProposalMessageInputSchema>;

