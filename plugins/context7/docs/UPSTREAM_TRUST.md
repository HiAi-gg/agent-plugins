# UPSTREAM_TRUST — context7

| Field | Value |
|---|---|
| Upstream project | Context7 |
| Upstream owner | Upstash (Context7 is an Upstash product) |
| Repository | https://github.com/upstash/context7 |
| License | MIT |
| Trust level | **TRUST A — First Party** (vendor-owned product; MCP server published by the vendor) |
| Selected version | `@upstash/context7-mcp@3.2.5` (pinned) |
| Why trusted | Vendor-owned (Upstash); publishes the MCP server itself; established product with public site, docs, and API |
| Maintenance evidence | Versioned releases on npm (3.2.5 current at pin time; later 4.0.0 exists); active product |
| Authentication model | Anonymous/basic rate limit by default; optional user-side API key (not part of the plugin) |
| Write capabilities | None — Context7 is read-only documentation lookup |
| Known limitations | Rate limits; per-package doc availability |
| Verification date | 2026-08-07 |

Runtime verification: `RUNTIME_VERIFIED` — handshake, tools/list, real library
lookup (React docs) all succeeded with 3.2.5.
