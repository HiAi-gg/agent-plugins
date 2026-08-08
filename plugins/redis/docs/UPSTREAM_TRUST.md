# UPSTREAM_TRUST — redis

| Field | Value |
|---|---|
| Upstream project | Redis MCP Server |
| Upstream owner | Redis |
| Repository | https://github.com/redis/redis-mcp |
| License | MIT |
| Trust level | **TRUST A — First Party** (Redis publishes the MCP server) |
| Selected version | `redis-mcp-server==0.5.1` (pinned; 0.5.0 broken upstream) |
| Why trusted | Vendor-owned; official MCP server for Redis; documented tool set |
| Maintenance evidence | Versioned PyPI releases (0.5.1 at pin time); active project |
| Authentication model | None for local dev; client-level for authenticated/cloud Redis; no credentials in the plugin |
| Write capabilities | The server exposes write tools (set, lpush, sadd, expire, delete, ...); plugin skills are read-first; read-only enforcement via Redis ACL user is documented |
| Known limitations | 0.5.0 dependency pin broken; cloud auth is client-side |
| Verification date | 2026-08-07 |

Runtime verification: `RUNTIME_VERIFIED` — handshake, tools/list, `get`,
`dbsize` against a live Redis.
