# PostgreSQL Agent Plugin

**Safe, read-only PostgreSQL inspection, query diagnosis, performance analysis,
and database health workflows for AI agents.**

An [Agent Plugin](https://agent-plugins.org/) (spec **1.0.0**), version
**0.0.1**.

## What the plugin does

- Inspects PostgreSQL databases: identity, schemas, tables, columns,
  relationships, indexes, sizes.
- Diagnoses slow queries with `EXPLAIN (FORMAT JSON)` (never executes the
  target statement).
- Investigates performance: activity, long transactions, locks, table health,
  `pg_stat_statements` (when available).
- Produces compact health reviews.
- All through a **bundled HiAI PostgreSQL MCP server** — no third-party
  PostgreSQL MCP dependency.

## Why it exists

Most coding agents already expose filesystem and general tools, but safe
PostgreSQL inspection is a distinct capability. This plugin ships a
read-only MCP that uses PostgreSQL's own server-side read-only enforcement —
not a regex — as the primary safety boundary.

**It is NOT**:

- an AI database administrator,
- a generic arbitrary SQL executor,
- a migration tool,
- a write-capable database automation system.

Version 0.0.1 is **deliberately read-only**. There is no write mode.

## Read-only guarantee

Read-only is enforced in layers (defense in depth):

1. **Server-side (primary)**: every pooled connection is created with
   `default_transaction_read_only=on`, `statement_timeout`, `lock_timeout`,
   and `idle_in_transaction_session_timeout` via PostgreSQL connection
   options. PostgreSQL itself rejects writes.
2. **Session reinforcement**: `set_config` calls apply read-only and timeouts
   to the active connection. Because `set_config` can also _disable_ these
   settings, the `query` tool blocks it (and every function that can change
   session-level read-only state) at the application layer.
3. **Tool-level**: the server exposes no write tool at all.
4. **Input checks**: the `query` tool enforces one statement, rejects
   forbidden keywords (DML/DDL/DCL/transaction/COPY) and dangerous functions
   (`set_config`, `pg_read_file`, `pg_ls_dir`, `pg_stat_file`, and other
   server-file / admin functions), and caps results.
5. **Output limits**: row and byte caps with an explicit `truncated` flag.

The security gate (30 cases) and the two-PostgreSQL-version matrix are
recorded in `docs/SECURITY_VERIFICATION.md`.

## Bundled HiAI MCP

The MCP is maintained by **HiAI as part of this plugin** (it is not a
third-party server):

```
agent-plugin-postgresql
└── packages/postgres-mcp   (the HiAI PostgreSQL MCP, stdio)
```

Dependency chain (intentionally small):

```
HiAI Agent Plugin
→ HiAI PostgreSQL MCP (packages/postgres-mcp)
→ official MCP TypeScript SDK
→ Bun.SQL (Bun's PostgreSQL driver)
→ PostgreSQL
```

See `docs/UPSTREAM_TRUST.md` for licenses.

## How connection configuration works

The MCP **requires** the **`DATABASE_URL`** environment variable (standard
PostgreSQL connection string), for example:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```

- Set it at the **client level** (env for the MCP subprocess). Do **not**
  commit real values.
- If `DATABASE_URL` is unset the server refuses to start (it does **not**
  silently fall back to localhost):

  ```
  Error: DATABASE_URL environment variable is required. Set it to your PostgreSQL connection string.
  ```

- Credentials are **never** embedded in the plugin, and are **never echoed**:
  any displayed connection string is redacted
  (`postgresql://user:***@host:5432/database`).

## Available Skills

| Skill                    | Use when                             |
| ------------------------ | ------------------------------------ |
| `inspect-database`       | understanding an unfamiliar database |
| `diagnose-query`         | a query is slow or suspicious        |
| `diagnose-performance`   | database-wide performance issues     |
| `diagnose-locks`         | queries hang / lock contention       |
| `review-database-health` | overall health assessment            |

All skills default to inspect / explain / recommend — never modify, terminate,
or vacuum automatically.

## Available MCP tools

| Tool                | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| `database_info`     | version, database, user, settings, extensions      |
| `list_schemas`      | visible schemas                                    |
| `list_tables`       | tables with size estimates                         |
| `describe_table`    | columns, types, PK, FKs, constraints, indexes      |
| `list_indexes`      | index definitions and sizes                        |
| `query`             | single read-only SQL statement (with limits)       |
| `explain_query`     | `EXPLAIN (FORMAT JSON)` — not executed             |
| `database_activity` | sessions, long transactions, waits                 |
| `locks`             | blocked vs blocking sessions                       |
| `slow_queries`      | top statements via `pg_stat_statements` (optional) |
| `table_health`      | maintenance signals                                |
| `database_sizes`    | database, largest tables/indexes                   |
| `health_summary`    | compact diagnostic summary                         |

`analyze_query` (`EXPLAIN ANALYZE`) is intentionally **not** exposed in v0.0.1.

## Supported PostgreSQL versions

Tested against:

- **PostgreSQL 14** (older supported major)
- **PostgreSQL 16** (current stable major)
- **PostgreSQL 15, 17, 18, and 19 beta2** (see `docs/COMPATIBILITY.md` for
  the full matrix and the PG19 pre-release caveat)

See `docs/COMPATIBILITY.md` for details.

## Required privileges

> **The plugin should be used with a least-privilege PostgreSQL role.
> PostgreSQL role privileges remain part of the security boundary.**

The plugin's own filters are defense-in-depth; the real authority is the role
in `DATABASE_URL`. A least-privilege role keeps the `query` tool safe even for
server-file functions (`pg_read_file`, `pg_ls_dir`, ...) and sensitive catalog
relations (`pg_authid`), which PostgreSQL blocks unless the role is privileged.

**Never use a superuser `DATABASE_URL`** (including the default role created
by a stock `docker run postgres`): under a superuser role, read-only
inspection would also allow reading arbitrary server files and role password
verifiers. Do **not** grant `pg_read_server_files`, `pg_write_server_files`,
`pg_execute_server_program`, or `pg_signal_backend`.

Recommended least-privilege role recipe:

```sql
CREATE ROLE readonly LOGIN PASSWORD 'change-me';
GRANT CONNECT ON DATABASE <db> TO readonly;
GRANT USAGE ON SCHEMA app TO readonly;              -- per application schema
GRANT SELECT ON ALL TABLES IN SCHEMA app TO readonly;
GRANT pg_monitor TO readonly;                       -- optional: diagnostic views
```

Functional needs:

- Read access to `pg_catalog` and `information_schema` (most roles have this).
- Monitoring views (`pg_stat_activity`, `pg_stat_user_tables`,
  `pg_stat_user_indexes`, `pg_locks`) require the role to see them — some
  require elevated privileges.
- `slow_queries` requires `pg_stat_statements` **and** access to it.

Insufficient privileges return a structured `available: false` + reason —
never a crash. The plugin does not recommend granting superuser casually.

## pg_stat_statements behavior

`slow_queries` uses `pg_stat_statements` **when available**. If the extension
is not installed or not accessible, it returns:

```json
{
  "available": false,
  "reason": "pg_stat_statements is not installed or accessible"
}
```

It never fails the plugin and never installs the extension.

## Security model

- Read-only enforced server-side (primary) + tool/input/output layers.
- One statement per query; forbidden keywords and dangerous functions
  (`set_config`, server-file / admin functions) rejected.
- The plugin should be used with a least-privilege PostgreSQL role;
  PostgreSQL role privileges remain part of the security boundary.
- Row/byte limits; explicit `truncated`.
- Credential redaction in logs, errors, and diagnostics.
- Permission-aware: missing privileges are handled gracefully.

See `docs/SECURITY.md` and `docs/SECURITY_VERIFICATION.md`.

## Limitations

- Read-only by design (v0.0.1); no write mode.
- No `EXPLAIN ANALYZE` (deliberately omitted).
- `DATABASE_URL` is required; the server will not start without it.
- `pg_stat_statements` optional and environment-dependent.
- Health signals are signals, not exact diagnoses.

## Requirements

- `bun` (runtime for the bundled MCP).
- A reachable PostgreSQL server.
- `DATABASE_URL` at the client level (required; there is no default host).

## Installation

Copy the plugin's **runtime files** (`plugin.json`, `mcp.json`, `skills/`,
`packages/postgres-mcp/`, `README.md`, `LICENSE`) into your Agent Plugins
client's plugin folder, or use your client's plugin install flow. Do **not**
copy the authoring sources (`plugin.yml`, `skills-src/`, `docs/`) — see the
collection README for the full boundary. Set `DATABASE_URL` for the MCP
subprocess. The plugin launches its bundled MCP via `${PLUGIN_ROOT}` — no
global install required.

## Configuration (mcp.json)

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "postgresql": {
      "type": "stdio",
      "command": "bun",
      "args": ["run", "${PLUGIN_ROOT}/packages/postgres-mcp/src/index.ts"]
    }
  }
}
```

## CHANGELOG

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT. See [LICENSE](LICENSE).
