import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { QuiklyClient } from "./quiklyClient.js";
import { makeQuiklyMcpServer } from "./server.js";

const API_BASE_URL = process.env.QUIKLY_API_BASE_URL;
const API_KEY = process.env.QUIKLY_API_KEY;

if (!API_BASE_URL) {
  throw new Error("Missing env var QUIKLY_API_BASE_URL (e.g. https://api.getquikly.com/api/external/v1)");
}
if (!API_KEY) {
  throw new Error("Missing env var QUIKLY_API_KEY (sent as X-API-Key)");
}

const client = new QuiklyClient({ baseUrl: API_BASE_URL, apiKey: API_KEY });
const server = makeQuiklyMcpServer(client);

// -------------------- Start --------------------

const transport = new StdioServerTransport();
await server.connect(transport);

