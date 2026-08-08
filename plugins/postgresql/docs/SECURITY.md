# Security

## Threat model

The plugin gives an agent read access to a PostgreSQL database. The primary
risks are:

1. Write/DDL/DCL execution through the MCP (data loss, schema damage).
2. Credential leakage (connection string echoed in logs/errors/output).
3. Excessive output (context-window flooding).
4. Privilege-escalation paths (COPY PROGRAM, extensions, roles).

## Defense in depth (5 layers)

### Layer 1 — Server-side read-only (primary)

Every connection is created with PostgreSQL connection options:

- `default_transaction_read_only=on` — PostgreSQL itself rejects writes,
  DDL, DCL, and `SELECT INTO` on every pooled connection.
- `statement_timeout=10000`, `lock_timeout=5000`,
  `idle_in_transaction_session_timeout=60000` — bound runaway work.
- `application_name=hiai-agent-plugin-postgresql` — the server identifies
  itself.

### Layer 2 — Session reinforcement

`set_config` calls re-apply read-only and timeouts to the active connection.

### Layer 3 — Tool surface

The MCP exposes **no write tool**. `analyze_query` (`EXPLAIN ANALYZE`) is
deliberately omitted in v0.0.1. The only SQL-executing tool is `query`,
documented read-only.

### Layer 4 — Input checks (`query-safety.ts`)

- One statement per request (semicolon counting + trailing-terminator rule).
- Dollar-quoted bodies rejected.
- Forbidden keywords rejected: INSERT, UPDATE, DELETE, MERGE, TRUNCATE,
  CREATE, ALTER, DROP, GRANT, REVOKE, VACUUM, ANALYZE, CLUSTER, COPY, CALL,
  DO, **INTO** (SELECT INTO), BEGIN/COMMIT/ROLLBACK/SAVEPOINT, SET/RESET,
  PREPARE/EXECUTE/DEALLOCATE, LISTEN/NOTIFY, psql meta-commands.

These checks are **not** the primary boundary — Layer 1 is. They are
defense-in-depth to fail fast and reduce server chatter.

### Layer 5 — Output limits

- Default row limit 100; maximum 500.
- Maximum result bytes 1,000,000; truncation is explicit (`truncated: true`),
  never silent.

## Credential handling

- Connection strings are never echoed as-is.
- `redactUrl` masks user/password for display.
- `scrubSecrets` scrubs `password=...` and `://user:pass@` patterns from
  error and diagnostic text.
- stderr at startup is minimal; fatal errors are scrubbed.

## Permission-aware behavior

Monitoring views may be restricted by role. Tools catch permission errors and
return a structured `available: false` / `error` (scrubbed) result instead of
crashing. `slow_queries` returns `available: false` with a clear reason when
`pg_stat_statements` is missing.

## Non-goals

- No write mode in v0.0.1.
- No recommendation to grant superuser casually.
- No automatic `VACUUM`, `REINDEX`, `pg_terminate_backend`.
