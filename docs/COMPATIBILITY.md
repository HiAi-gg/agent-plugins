# Compatibility

Per-plugin runtime evidence. Detailed per-plugin verification lives in each
plugin's README and `docs/`.

Runtime status vocabulary:

- **Runtime verified** — the upstream server/CLI actually ran (handshake,
  tools, at least one real operation).
- **Config verified** — configuration is schema-conformant; runtime requires
  user credentials or external service.
- **User auth required** — remote OAuth endpoint; runtime requires a real
  user grant.
- **Skills-only** — no MCP; CLI-based workflow skills.

| Plugin | Status | Verified with |
|---|---|---|
| github | User auth required (Config verified) | GitHub Copilot MCP endpoint; OAuth not exercisable in CI |
| agent-browser | Runtime verified | agent-browser CLI 0.31.1 — full workflow (open/read/click/fill/navigate/close) |
| context7 | Runtime verified | @upstash/context7-mcp@3.2.5 — real docs lookup (React) |
| firecrawl | Runtime verified | firecrawl-mcp@3.23.4 — keyless search |
| redis | Runtime verified | redis-mcp-server==0.5.1 — get/dbsize on live Redis |
| sentry | User auth required (Config verified) | Sentry hosted MCP; OAuth requires a user |
| supabase | Config verified | @supabase/mcp-server-postgrest@0.1.1 — handshake + tools; project URL required |
| figma | User auth required (Config verified) | Figma hosted MCP; OAuth requires a user |
| cloudflare | User auth required (Config verified) | Cloudflare Code Mode MCP; OAuth requires a user |
| notion | User auth required (Config verified) | Notion hosted MCP; OAuth requires a user |
| docker | Skills-only | docker / docker compose CLI workflows |
| kubernetes | Runtime verified | kubernetes-mcp-server@0.0.65 — full read-only gate on disposable k3s |
| postgresql | Runtime verified | bundled HiAI MCP — PG 14–18 tested, 19 beta tested; security gate 19/19 |

## Client compatibility

All plugins target Agent Plugins 1.0.0. stdio MCP plugins (context7,
firecrawl, redis, supabase, kubernetes, postgresql) work in any stdio-capable
client. Remote MCP plugins (github, sentry, figma, cloudflare, notion)
require a client with streamable-http + OAuth support. Claims are limited to
what was actually tested; no universal compatibility is implied.
