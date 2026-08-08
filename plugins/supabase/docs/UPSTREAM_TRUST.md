# UPSTREAM_TRUST — supabase

| Field | Value |
|---|---|
| Upstream project | Supabase MCP (PostgREST server) |
| Upstream owner | Supabase |
| Repository | https://github.com/supabase/mcp |
| License | Apache-2.0 |
| Trust level | **TRUST A — First Party** (Supabase publishes the MCP server) |
| Selected version | `@supabase/mcp-server-postgrest@0.1.1` (pinned) |
| Why trusted | Vendor-owned; official MCP server published by Supabase; Apache-2.0; active repo |
| Maintenance evidence | Versioned npm releases; official Supabase org repository |
| Authentication model | Project URL + optional anon key, client-managed; no secrets in the plugin |
| Write capabilities | Server supports CRUD via PostgREST; plugin skills are read-first and gate writes |
| Known limitations | `--apiUrl` is project-specific; RLS review needs SQL access; server itself is not read-only |
| Verification date | 2026-08-07 |

Runtime verification: `HANDSHAKE_VERIFIED`, `TOOLS_VERIFIED` — handshake and
tool listing succeeded; live project calls require the user's project URL.
