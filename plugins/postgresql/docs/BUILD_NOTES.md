# BUILD_NOTES — postgresql

Test/development artifact. Product rationale, architecture, decisions, and
limitations.

## Product rationale

Safe PostgreSQL inspection is a distinct agent capability that most coding
agents do not expose safely. Rather than depend on a third-party PostgreSQL
MCP (archived reference servers, or community servers with unresolved trust
decisions), this plugin **bundles its own read-only MCP** (`packages/
postgres-mcp`), maintained by HiAI as part of the plugin.

## Architecture

- stdio MCP (Bun runtime, Bun.SQL driver, official MCP TypeScript SDK, Zod).
- 13 read-only diagnostic tools; `analyze_query` deliberately omitted.
- Read-only enforced server-side via connection options (primary) + session
  set_config + no-write-tool surface + input checks + output limits.
- 5 Agent Skills mapping to the tools.

## Upstream

- Official MCP TypeScript SDK (`@modelcontextprotocol/sdk` 1.30.0, MIT).
- Bun.SQL (Bun's PostgreSQL driver, part of Bun — MIT).
- Zod (MIT).
- PostgreSQL (server, PostgreSQL License).
- See docs/UPSTREAM_TRUST.md.

## Alternatives rejected

- `@modelcontextprotocol/server-postgres` (archived reference) — deprecated
  infrastructure, not a public default.
- `@sarmadparvez/postgresql-mcp` — community (Trust C under our policy);
  not used.
- CrystalDBA Postgres MCP Pro — reported restricted-mode security concerns
  unresolved; not used as a default.
- Building on an HTTP framework — unnecessary for stdio.

## Skill decisions

Five focused skills (no single "postgresql-expert"): `inspect-database`,
`diagnose-query`, `diagnose-performance`, `diagnose-locks`,
`review-database-health`. All default to inspect/explain/recommend.

## Runtime testing

- Security gate: 30 cases on PostgreSQL 16 (19-case gate re-run on PostgreSQL
  14).
- Version matrix: PostgreSQL 14 + 16.
- Credential gate: no leakage in errors/stderr.
- `pg_stat_statements` present and absent environments.
- MCP protocol verified through a real client: initialize, tools/list, call
  each tool, shutdown.

## Limitations

- Read-only only.
- Requires `DATABASE_URL` at the client level.
- `pg_stat_statements` optional.
- Health signals are signals, not diagnoses.
