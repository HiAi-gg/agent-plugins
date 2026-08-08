# UPSTREAM_TRUST — notion

| Field | Value |
|---|---|
| Upstream project | Notion MCP (hosted) |
| Upstream owner | Notion |
| Repository | https://developers.notion.com/guides/mcp/overview (docs; server is Notion-hosted) |
| License | Notion's terms |
| Trust level | **TRUST A — First Party** |
| Selected version | vendor-operated endpoint (not pinnable); `https://mcp.notion.com/mcp` |
| Why trusted | Notion operates the hosted MCP server; first-party vendor ownership; official documentation; actively maintained (vs deprecated open-source server) |
| Maintenance evidence | Active official docs and client guides; OAuth + PAT support documented |
| Authentication model | OAuth via host (recommended) or PAT at client level; no tokens in the plugin |
| Write capabilities | Server can create/update content; plugin skills are read-first; writes require explicit confirmation |
| Known limitations | Requires remote-MCP-capable client + OAuth; endpoint version not pinnable |
| Verification date | 2026-08-07 |

Endpoint verification: `CONFIG_VALIDATED` (endpoint reachable, 401 without
auth); `AUTH_RUNTIME_REQUIRES_USER` (OAuth requires a real user).
