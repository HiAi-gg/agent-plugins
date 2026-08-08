# UPSTREAM_TRUST — cloudflare

| Field | Value |
|---|---|
| Upstream project | Cloudflare MCP (Code Mode) |
| Upstream owner | Cloudflare |
| Repository | https://github.com/cloudflare/mcp |
| License | Cloudflare's (project); endpoint operated by vendor |
| Trust level | **TRUST A — First Party** |
| Selected version | vendor-operated endpoint (not pinnable); `https://mcp.cloudflare.com/mcp` |
| Why trusted | Cloudflare operates the MCP server and the underlying project; first-party vendor ownership; official documentation |
| Maintenance evidence | Active official repo; documented OAuth and token modes; Code Mode pattern is Cloudflare's own |
| Authentication model | OAuth (recommended) or API token, client-managed; no tokens in the plugin |
| Write capabilities | Server can execute Cloudflare API calls (including mutations); plugin skills are read-first and gate mutations |
| Known limitations | Code mode may be restricted by some clients; paid-plan features; endpoint version not pinnable |
| Verification date | 2026-08-07 |

Endpoint verification: `CONFIG_VALIDATED` (endpoint reachable, 401 without
auth); `AUTH_RUNTIME_REQUIRES_USER` (OAuth requires a real user).
