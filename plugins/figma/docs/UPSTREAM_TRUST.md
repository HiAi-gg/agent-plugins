# UPSTREAM_TRUST — figma

| Field | Value |
|---|---|
| Upstream project | Figma MCP Server |
| Upstream owner | Figma |
| Repository | https://github.com/figma/mcp-server-guide (docs/guide); server is Figma-hosted |
| License | Figma Developer Terms (server usage); guide repo is Figma's |
| Trust level | **TRUST A — First Party** |
| Selected version | vendor-operated endpoint (not pinnable); `https://mcp.figma.com/mcp` |
| Why trusted | Figma operates the remote MCP server; first-party vendor ownership; official documentation |
| Maintenance evidence | Active official docs and guide repo; Figma-supported clients (VS Code, Cursor, Claude Code, Xcode) |
| Authentication model | OAuth, host/client-managed; no tokens in the plugin; only Figma MCP Catalog clients supported |
| Write capabilities | **The server can write to the canvas** (create/modify Figma content) — documented, not hidden; plugin skills are read-only |
| Known limitations | Catalog-client restriction; read-tool rate limits; write-to-canvas beta/usage-based |
| Verification date | 2026-08-07 |

Endpoint verification: `CONFIG_VALIDATED`; `AUTH_RUNTIME_REQUIRES_USER` (OAuth
requires a real user in a Figma-Catalog client).
