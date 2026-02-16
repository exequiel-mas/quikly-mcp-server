# Quikly MCP Server

[![npm version](https://img.shields.io/npm/v/quikly-mcp-server.svg)](https://www.npmjs.com/package/quikly-mcp-server)

MCP server that exposes [Quikly.ai](https://getquikly.com) external API (`/api/external/v1`) as tools for Cursor, Claude Code, and other MCP clients.

## Tools

| Tool | Description |
|------|-------------|
| `quikly_me` | Get current user (validate API key) |
| `quikly_create_proposal` | Create a proposal |
| `quikly_analyze_brief` | Analyze brief (AI requirements) |
| `quikly_recommend_rate` | Get rate recommendation (AI) |
| `quikly_get_proposal` | Get proposal by ID |
| `quikly_share_link` | Create/update share link for a proposal |
| `quikly_list_proposal_messages` | List messages (conversation with client) |
| `quikly_reply_proposal_message` | Reply to client on a proposal |

### Autonomous agent: conversation with client

When a client sends a message on a shared proposal, Quikly sends a webhook event `proposal.message_received`. An agent can:

1. **List messages** – `quikly_list_proposal_messages` with `proposal_id` from the webhook payload.
2. **Optionally update the proposal** – Use the external API `PUT /proposals/{id}` (e.g. from n8n or another tool) to apply changes the client requested.
3. **Reply** – `quikly_reply_proposal_message` with `proposal_id` and `content` to send a message to the client (they receive an email).

## Installation

### Option A: npx (recommended, no install)

Use directly without installing:

```bash
npx -y quikly-mcp-server
```

Configure your client to run this command with the required environment variables (see [Configuration](#configuration)).

### Option B: npm install (global or project)

```bash
# Global
npm install -g quikly-mcp-server

# Or as project dependency
npm install quikly-mcp-server
```

### Option C: From source (dev / fallback)

```bash
git clone https://github.com/exequiel-mas/quikly-mcp-server
cd quikly-mcp-server
npm install
npm run build
```

## Configuration

The server requires two environment variables:

| Variable | Description |
|----------|-------------|
| `QUIKLY_API_BASE_URL` | API base URL (e.g. `https://api.getquikly.com/api/external/v1`) |
| `QUIKLY_API_KEY` | Your Quikly API key (sent as `X-API-Key` header) |

**Never commit API keys.** Use environment variable expansion in your config.

## Client configuration

This server uses **MCP over stdio**, compatible with Cursor, Claude Desktop, Claude Code, and other MCP clients.

All clients use the same structure: `command`, `args`, and `env`. Replace `TU_API_KEY` with your [Quikly API key](https://app.getquikly.com/settings/api-keys). See `.mcp.json.example` in this package for a copy-paste template.

### Cursor

**Config file:** `~/.cursor/mcp.json` (global) or `proyecto/.cursor/mcp.json` (per-project)

```json
{
  "mcpServers": {
    "quikly": {
      "command": "npx",
      "args": ["-y", "quikly-mcp-server"],
      "env": {
        "QUIKLY_API_BASE_URL": "https://api.getquikly.com/api/external/v1",
        "QUIKLY_API_KEY": "TU_API_KEY"
      }
    }
  }
}
```

### Claude Desktop

**Config file:**
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

Edit via **Claude menu → Settings → Developer → Edit Config**.

```json
{
  "mcpServers": {
    "quikly": {
      "command": "npx",
      "args": ["-y", "quikly-mcp-server"],
      "env": {
        "QUIKLY_API_BASE_URL": "https://api.getquikly.com/api/external/v1",
        "QUIKLY_API_KEY": "TU_API_KEY"
      }
    }
  }
}
```

Restart Claude Desktop completely after saving.

### Claude Code (Claude for VS Code / CLI)

**Config file:** `.mcp.json` in project or home

```json
{
  "mcpServers": {
    "quikly": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "quikly-mcp-server"],
      "env": {
        "QUIKLY_API_BASE_URL": "https://api.getquikly.com/api/external/v1",
        "QUIKLY_API_KEY": "TU_API_KEY"
      }
    }
  }
}
```

Or via CLI:

```bash
claude mcp add --transport stdio --scope project quikly -- npx -y quikly-mcp-server
```

Set `QUIKLY_API_BASE_URL` and `QUIKLY_API_KEY` in your environment before running.

### Fallback: Windows / npx fails

If `npx` fails (e.g. on some Windows setups), use a local build:

1. `git clone https://github.com/exequiel-mas/quikly-mcp-server && cd quikly-mcp-server`
2. `npm install && npm run build`
3. Use `node` with the full path to `dist/index.js`:

```json
{
  "mcpServers": {
    "quikly": {
      "command": "node",
      "args": ["C:/path/to/quikly-mcp-server/dist/index.js"],
      "env": {
        "QUIKLY_API_BASE_URL": "https://api.getquikly.com/api/external/v1",
        "QUIKLY_API_KEY": "TU_API_KEY"
      }
    }
  }
}
```

Or install globally: `npm install -g quikly-mcp-server`, then use `"command": "quikly-mcp-server"` with no `args`.

**Windows PowerShell wrapper** (if env vars are in system, not mcp.json):

```json
"quikly": {
  "command": "powershell",
  "args": ["-ExecutionPolicy", "Bypass", "-File", "C:/path/to/node_modules/quikly-mcp-server/scripts/run-quikly-mcp.ps1"],
  "env": {}
}
```

After `npm install quikly-mcp-server` in your project, the script is at `node_modules/quikly-mcp-server/scripts/run-quikly-mcp.ps1`.

## Development

```bash
# Install
npm install

# Build
npm run build

# Run (stdio)
npm run dev

# Unit tests (no API)
npm test

# Integration tests (requires running API + QUIKLY_RUN_INTEGRATION=1)
# Windows:
cmd /c "set QUIKLY_RUN_INTEGRATION=1&& set QUIKLY_API_BASE_URL=http://localhost:8000/api/external/v1&& set QUIKLY_API_KEY=YOUR_KEY&& npm run test:integration"
# Unix:
QUIKLY_RUN_INTEGRATION=1 QUIKLY_API_BASE_URL=http://localhost:8000/api/external/v1 QUIKLY_API_KEY=YOUR_KEY npm run test:integration
```

## Troubleshooting

- **401 Unauthorized / "Invalid API key"** – The backend didn't recognize the value in `X-API-Key`. Check that `QUIKLY_API_KEY` is set and valid.
- **402 Payment Required / `api_quota_exceeded`** – API quota for that user tier is exhausted (see backend quota settings).
- **"Missing env var"** – Ensure `QUIKLY_API_BASE_URL` and `QUIKLY_API_KEY` are set in your MCP client config (with expansion if using `${VAR}`).

## License

MIT
