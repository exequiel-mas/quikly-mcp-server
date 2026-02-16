import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { QuiklyClient } from "./quiklyClient.js";
import { makeQuiklyMcpServer } from "./server.js";

// Log errors to stderr (MCP uses stdio; Cursor can show stderr in MCP logs)
function logError(msg: string, err?: unknown) {
  const line = `[quikly-mcp-server] ${msg}${err instanceof Error ? `: ${err.message}` : ""}\n`;
  process.stderr.write(line);
}

async function main() {
  const API_BASE_URL = process.env.QUIKLY_API_BASE_URL;
  const API_KEY = process.env.QUIKLY_API_KEY;

  if (!API_BASE_URL) {
    logError("Missing env var QUIKLY_API_BASE_URL");
    throw new Error("Missing env var QUIKLY_API_BASE_URL (e.g. https://api.getquikly.com/api/external/v1)");
  }
  if (!API_KEY) {
    logError("Missing env var QUIKLY_API_KEY");
    throw new Error("Missing env var QUIKLY_API_KEY (sent as X-API-Key)");
  }

  const client = new QuiklyClient({ baseUrl: API_BASE_URL, apiKey: API_KEY });
  const server = makeQuiklyMcpServer(client);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  logError("Fatal error", err);
  process.exit(1);
});

