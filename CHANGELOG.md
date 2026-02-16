# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2026-02-16

### Added

- Claude Desktop configuration in README
- `.mcp.json.example` for copy-paste setup
- Cursor, Claude Desktop, Claude Code unified docs
- Fallback instructions for Windows when npx fails

## [0.1.1] - 2025-02-16

### Fixed

- Error logging to stderr on startup failure (helps debug Cursor MCP connection issues on Windows)

## [0.1.0] - 2025-02-16

### Added

- Initial release
- MCP server with stdio transport
- Tools: `quikly_me`, `quikly_create_proposal`, `quikly_analyze_brief`, `quikly_recommend_rate`, `quikly_get_proposal`, `quikly_share_link`, `quikly_list_proposal_messages`, `quikly_reply_proposal_message`
- npm package with `npx -y quikly-mcp-server` support
- Cursor and Claude Code configuration examples
