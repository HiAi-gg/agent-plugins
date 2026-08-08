# Compatibility

## Agent Plugins

- Targets **Agent Plugins 1.0.0 (Working Draft)**.
- `plugin.json` and `mcp.json` validate against the official 1.0.0 schemas.
- Skills validate against the Agent Skills specification.

## PostgreSQL versions

Full matrix runtime-tested in this release (docker images; each ran the
13-tool suite and the security gate — 19 cases at release, extended to 30
cases with the F-1/F-2/F-3 regression coverage in the 0.0.2 fix):

| PostgreSQL        | Status      | Runtime     | Security   | Notes                                                      |
| ----------------- | ----------- | ----------- | ---------- | ---------------------------------------------------------- |
| 14 (alpine)       | TESTED      | 13/13 tools | 19/19 gate | older supported major                                      |
| 15 (alpine)       | TESTED      | 13/13 tools | 19/19 gate |                                                            |
| 16 (alpine)       | TESTED      | 13/13 tools | 30/30 gate | current stable major; extended 0.0.2 gate re-verified      |
| 17 (alpine)       | TESTED      | 13/13 tools | 19/19 gate |                                                            |
| 18 (alpine)       | TESTED      | 13/13 tools | 19/19 gate | current stable major; full first-class support (see below) |
| 19 beta2 (alpine) | BETA TESTED | 13/13 tools | 19/19 gate | pre-release compatibility target; NOT production-supported |

**PG14–PG18** are supported/tested stable lines. **PG19** is a pre-release
compatibility target: it is not production-supported until PG19 reaches GA
and the final compatibility suite is rerun against the GA release (see
`docs/RELEASES.md` in the collection root). The plugin does not claim blanket
"PostgreSQL 14–19" support while 19 is pre-release.

> The extended 30-case security gate (adds `set_config`, the server-file /
> admin function surface, and the F-1 identifier regressions) was re-verified
> in full on PostgreSQL 16 during the 0.0.2 security fix; the other matrix
> rows were verified against the 19-case gate.

### PostgreSQL 18 extended verification

In addition to the core matrix:

- `pg_stat_statements` enabled: `slow_queries` returns top statements.
- `pg_stat_statements` not accessible to role: returns gracefully (query
  text shows `<insufficient privilege>`, tool continues to work).
- Permission-limited user: reads allowed tables, monitoring views behave
  gracefully.
- Credential redaction: wrong password produces no credential leak.
- Timeouts: `statement_timeout` cancels a `pg_sleep` statement.
- Result limits: `row_limit` truncates with `truncated: true`.
- Full 19-case read-only security gate: PASS.

### PostgreSQL 19 beta verification

PostgreSQL 19 beta2 (alpine) ran the same core MCP contract: 13/13 tools and
the 19/19 security gate. Version-sensitive system views and `EXPLAIN` behaved
identically to stable majors in the tested surface. PG19-only EXPLAIN options
(MEMORY, IO) are not enabled in default cross-version workflows; the plugin
uses a capability layer, not per-major forks.

## Features that are environment-dependent

- `slow_queries` (pg_stat_statements): only when the extension is installed
  and accessible; otherwise returns `available: false`.
- Monitoring views (`pg_stat_activity`, `pg_locks`, `pg_stat_user_tables`):
  visibility depends on role privileges.
- `EXPLAIN (FORMAT JSON)`: supported on PostgreSQL 9.4+ (all tested).

## Runtime requirements

- `bun` (runtime for the bundled MCP).
- PostgreSQL server reachable from the MCP host.
- `DATABASE_URL` at the client level (required; there is no default host —
  the server refuses to start when it is unset).

## Client compatibility

- stdio MCP transport — supported by the widest range of MCP clients.
- OAuth is not used (local stdio MCP; credentials via DATABASE_URL env).
- Compatibility claims are limited to what was tested (see
  `docs/SECURITY_VERIFICATION.md`); we do not claim untested clients.
