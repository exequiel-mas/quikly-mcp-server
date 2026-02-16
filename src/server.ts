import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { QuiklyClient } from "./quiklyClient.js";
import {
  AnalyzeBriefInputSchema,
  CreateProposalInputSchema,
  GetProposalInputSchema,
  ListProposalMessagesInputSchema,
  MeInputSchema,
  RecommendRateInputSchema,
  ReplyProposalMessageInputSchema,
  ShareLinkInputSchema
} from "./schemas.js";
import { createQuiklyToolHandlers } from "./toolHandlers.js";

export function makeQuiklyMcpServer(client: QuiklyClient) {
  const server = new McpServer({
    name: "quikly-mcp-server",
    version: "0.1.0"
  });

  const handlers = createQuiklyToolHandlers(client);

  server.registerTool(
    "quikly_me",
    {
      title: "Get current user (API key)",
      description:
        "Returns information about the authenticated user using Quikly external API (/me). Useful to validate the API key and base URL are correct. Requires 'read' scope.",
      inputSchema: MeInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    handlers.quikly_me
  );

  server.registerTool(
    "quikly_create_proposal",
    {
      title: "Create Quikly proposal",
      description:
        "Create a new proposal in Quikly using the external API (/proposals). Requires an API key with 'write' scope.",
      inputSchema: CreateProposalInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    handlers.quikly_create_proposal
  );

  server.registerTool(
    "quikly_analyze_brief",
    {
      title: "Analyze brief (AI)",
      description:
        "Analyze a project brief and extract structured requirements using Quikly external API (/ai/analyze-brief). Requires 'read' scope.",
      inputSchema: AnalyzeBriefInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    handlers.quikly_analyze_brief
  );

  server.registerTool(
    "quikly_recommend_rate",
    {
      title: "Recommend rate (AI)",
      description:
        "Get AI-powered hourly rate recommendation using Quikly external API (/ai/rate-recommendation). Requires 'read' scope.",
      inputSchema: RecommendRateInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    handlers.quikly_recommend_rate
  );

  server.registerTool(
    "quikly_get_proposal",
    {
      title: "Get proposal by ID",
      description:
        "Fetch a proposal by UUID using Quikly external API (/proposals/{proposal_id}). Requires 'read' scope.",
      inputSchema: GetProposalInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    handlers.quikly_get_proposal
  );

  server.registerTool(
    "quikly_share_link",
    {
      title: "Create share link for proposal",
      description:
        "Create (or update) a proposal share link via Quikly external API (/proposals/{proposal_id}/share). Requires 'write' scope.",
      inputSchema: ShareLinkInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    handlers.quikly_share_link
  );

  server.registerTool(
    "quikly_list_proposal_messages",
    {
      title: "List proposal messages (conversation with client)",
      description:
        "List messages for a shared proposal using Quikly external API (GET /proposals/{proposal_id}/messages). Use when following a conversation with the client, e.g. after receiving webhook event proposal.message_received. Requires 'read' scope.",
      inputSchema: ListProposalMessagesInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    handlers.quikly_list_proposal_messages
  );

  server.registerTool(
    "quikly_reply_proposal_message",
    {
      title: "Reply to client on proposal",
      description:
        "Send a message as the provider to the client on a shared proposal (POST /proposals/{proposal_id}/messages). Use to respond to client messages. An autonomous agent can list messages, then reply and optionally update the proposal (PUT /proposals/{id}). Requires 'write' scope.",
      inputSchema: ReplyProposalMessageInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    handlers.quikly_reply_proposal_message
  );

  return server;
}

