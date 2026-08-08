# UPSTREAM_TRUST — postgresql

This plugin intentionally has a small, first-party dependency chain.

| Dependency | Owner | License | Trust level | Version | Why trusted |
|---|---|---|---|---|---|
| HiAI PostgreSQL MCP (`packages/postgres-mcp`) | HiAI (this plugin) | MIT | **First party (bundled)** | 0.0.2 | Maintained as part of this plugin; no third-party PostgreSQL MCP |
| `@modelcontextprotocol/sdk` | MCP project (Anthropic et al.) | MIT | **TRUST A — First party** (official MCP SDK) | 1.30.0 | Official protocol SDK, widely used |
| Bun.SQL (`Bun.SQL`) | Bun (Oven) | MIT | **TRUST A — First party** (bundled with Bun runtime) | Bun 1.3.x | Official Bun PostgreSQL driver, part of the Bun runtime |
| Zod | Zod contributors (Colin McDonnell) | MIT | **TRUST A — Established** | 3.25.x | De-facto standard schema library |
| PostgreSQL (server) | PostgreSQL Global Development Group | PostgreSQL License | **TRUST A — First party** (the database itself) | 14, 16 tested | The database the plugin inspects; no plugin dependency beyond the client driver |

## Chain

```
HiAI Agent Plugin
→ HiAI PostgreSQL MCP (bundled, first party)
→ official MCP TypeScript SDK (MIT)
→ Bun.SQL (MIT, part of Bun)
→ PostgreSQL (PostgreSQL License)
```

## Authentication model

`DATABASE_URL` at the client level (standard PostgreSQL connection string).
No credentials embedded in the plugin. Read-only is enforced server-side.

## Write capabilities

None exposed. The MCP has no write tool; the server session is forced
read-only.

## Verification date

2026-08-07.

## Why no third-party PostgreSQL MCP

Under the collection's upstream trust policy, archived reference servers are
not acceptable defaults, and community PostgreSQL MCP servers with unresolved
security/trust positions are Trust C. The strongest option for a *read-only,
safe* PostgreSQL plugin is a bundled first-party MCP whose security we control
and verify (see docs/SECURITY_VERIFICATION.md).
