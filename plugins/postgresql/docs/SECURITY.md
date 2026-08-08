# Security

## Threat model

The plugin gives an agent read access to a PostgreSQL database. The primary
risks are:

1. Write/DDL/DCL execution through the MCP (data loss, schema damage).
2. Disabling the session-level read-only boundary from inside the `query`
   tool (`set_config`).
3. Server-file read / disclosure of sensitive catalog data under a
   privileged role (`pg_read_file`, `pg_ls_dir`, `pg_authid`, ...).
4. Credential leakage (connection string echoed in logs/errors/output).
5. Excessive output (context-window flooding).
6. Privilege-escalation paths (COPY PROGRAM, extensions, roles).

## Operating requirement: least-privilege role

> **The plugin should be used with a least-privilege PostgreSQL role.
> PostgreSQL role privileges remain part of the security boundary.**

The plugin's filters are defense-in-depth, not the primary boundary. The
authority that actually decides what the `query` tool may touch is the
PostgreSQL role in `DATABASE_URL`. **Never use a superuser `DATABASE_URL`**
(including the default role of a stock `docker run postgres`): under a
superuser role, read-only inspection would also allow reading arbitrary
server files and role password verifiers. Do **not** grant
`pg_read_server_files`, `pg_write_server_files`, `pg_execute_server_program`,
or `pg_signal_backend`.

Recommended least-privilege recipe:

```sql
CREATE ROLE readonly LOGIN PASSWORD 'change-me';
GRANT CONNECT ON DATABASE <db> TO readonly;
GRANT USAGE ON SCHEMA app TO readonly;              -- per application schema
GRANT SELECT ON ALL TABLES IN SCHEMA app TO readonly;
GRANT pg_monitor TO readonly;                       -- optional: diagnostic views
```

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
`set_config` can also _disable_ these settings, so the `query` tool blocks the
function at the application layer (Layer 4) as defense-in-depth; the
connection-level options in Layer 1 remain in force.

### Layer 3 — Tool surface

The MCP exposes **no write tool**. `analyze_query` (`EXPLAIN ANALYZE`) is
deliberately omitted. The only SQL-executing tool is `query`,
documented read-only.

### Layer 4 — Input checks (`query-safety.ts`)

- One statement per request (semicolon counting + trailing-terminator rule).
- Dollar-quoted bodies rejected.
- Forbidden keywords rejected: INSERT, UPDATE, DELETE, MERGE, TRUNCATE,
  CREATE, ALTER, DROP, GRANT, REVOKE, VACUUM, ANALYZE, CLUSTER, COPY (as a
  statement-leading keyword), CALL, DO, **INTO** (SELECT INTO),
  BEGIN/COMMIT/ROLLBACK/SAVEPOINT, SET/RESET,
  PREPARE/EXECUTE/DEALLOCATE, LISTEN/NOTIFY. psql backslash meta-commands
  (`\g`, `\o`, `\copy`, `\ir`, `\!`) are **not** filtered — the MCP sends SQL
  directly to PostgreSQL through the driver, never through interactive psql,
  so they cannot be executed.
- Forbidden functions rejected (defense-in-depth; the role is the primary
  boundary):
  - `set_config` — can disable `default_transaction_read_only` /
    `statement_timeout` and other session GUCs.
  - Server file access: `pg_read_file`, `pg_read_binary_file`, `pg_ls_dir`,
    `pg_ls_waldir`, `pg_ls_archive_statusdir`, `pg_ls_logdir`,
    `pg_ls_tmpdir`, `pg_stat_file`, `pg_file_rename`, `pg_file_unlink`,
    `pg_file_write`, `pg_logdir_files`, `pg_walfile_name`,
    `pg_walfile_name_offset`.
  - Server / session administration: `pg_reload_conf`, `pg_rotate_logfile`,
    `pg_switch_wal`, `pg_terminate_backend`, `pg_cancel_backend`.
  - Large objects (server-side write surface): `lo_import`, `lo_export`,
    `lo_from_bytea`, `lo_put`.
  - Credential-bearing catalog relations: `pg_authid`, `pg_shadow`.

These checks are **not** the primary boundary — Layer 1 and the database role
are. They are defense-in-depth to fail fast and reduce server chatter.

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

- No write mode.
- No recommendation to grant superuser casually.
- No automatic `VACUUM`, `REINDEX`, `pg_terminate_backend`.
