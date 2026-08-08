# Security Verification

Verification date: 2026-08-07.
Method: real MCP client (JSON-RPC over stdio) driving the bundled HiAI
PostgreSQL MCP against Docker PostgreSQL containers.

## Critical read-only gate (30 cases)

Attempted through the MCP `query` tool. Expected: all writes rejected,
SELECT allowed (including legitimate identifiers `g` / `o` / `copy` / `role`
— F-1 regression).

| #   | Statement                                                        | Result                       |
| --- | ---------------------------------------------------------------- | ---------------------------- |
| 1   | `SELECT count(*) FROM app.users`                                 | **ALLOWED** (rows returned)  |
| 2   | `SELECT g FROM generate_series(1,1000) AS x(g)`                  | **ALLOWED** (F-1 regression) |
| 3   | `SELECT o.total FROM app.orders o WHERE o.id = 1`                | **ALLOWED** (F-1 regression) |
| 4   | `SELECT 1 AS copy`                                               | **ALLOWED** (F-1 regression) |
| 5   | `SELECT 1 AS role`                                               | **ALLOWED** (F-1 regression) |
| 6   | `INSERT INTO app.users (email) VALUES ('hax@x.y')`               | REJECTED                     |
| 7   | `UPDATE app.users SET name='hax' WHERE id=1`                     | REJECTED                     |
| 8   | `DELETE FROM app.users WHERE id=1`                               | REJECTED                     |
| 9   | `TRUNCATE app.users`                                             | REJECTED                     |
| 10  | `CREATE TABLE hacked (id int)`                                   | REJECTED                     |
| 11  | `ALTER TABLE app.users ADD COLUMN x int`                         | REJECTED                     |
| 12  | `DROP TABLE app.orders`                                          | REJECTED                     |
| 13  | `CREATE EXTENSION hstore`                                        | REJECTED                     |
| 14  | `CREATE ROLE hacker`                                             | REJECTED                     |
| 15  | `GRANT ALL ON app.users TO public`                               | REJECTED                     |
| 16  | `REVOKE SELECT ON app.users FROM public`                         | REJECTED                     |
| 17  | `COPY app.users TO PROGRAM 'rm -rf /tmp/x'`                      | REJECTED                     |
| 18  | `SELECT 1; DELETE FROM app.users` (multi-statement)              | REJECTED                     |
| 19  | `BEGIN`                                                          | REJECTED                     |
| 20  | `SET default_transaction_read_only = off`                        | REJECTED                     |
| 21  | `SET statement_timeout = 0`                                      | REJECTED                     |
| 22  | `SELECT set_config('default_transaction_read_only','off',false)` | REJECTED (F-2)               |
| 23  | `SELECT pg_read_file('/etc/passwd')`                             | REJECTED (F-3)               |
| 24  | `SELECT pg_read_binary_file('PG_VERSION')`                       | REJECTED (F-3)               |
| 25  | `SELECT count(*) FROM pg_ls_dir('/')`                            | REJECTED (F-3)               |
| 26  | `SELECT pg_stat_file('PG_VERSION')`                              | REJECTED (F-3)               |
| 27  | `SELECT rolname, rolpassword FROM pg_authid`                     | REJECTED (F-3)               |
| 28  | `SELECT pg_reload_conf()`                                        | REJECTED (F-3)               |
| 29  | `SELECT * INTO hacked FROM app.users`                            | REJECTED                     |
| 30  | `ANALYZE app.users`                                              | REJECTED                     |

**All 30 cases behave as expected.**

> Note: case 29 (`SELECT INTO`) initially exposed a real bug: per-session
> `set_config` did not apply to every pooled connection, so the first attempt
> created a table. Fixed by moving read-only enforcement into the connection
> options (`buildSafeUrl`) so PostgreSQL applies it to **every** pooled
> connection. Re-verified: rejected, and no `hacked` table exists after the
> fix.

> Note: the F-2 / F-3 blocks (`set_config`, `pg_read_file`, `pg_ls_dir`,
> `pg_stat_file`, `pg_authid`, `pg_reload_conf`, ...) are defense-in-depth at
> the application layer. The plugin should still be used with a
> least-privilege PostgreSQL role — PostgreSQL role privileges remain part of
> the security boundary.

## Version matrix

| PostgreSQL          | Safe tools                           | Writes       | Result |
| ------------------- | ------------------------------------ | ------------ | ------ |
| 14 (docker, alpine) | database_info, list_tables, query OK | all rejected | PASS   |
| 16 (docker, alpine) | all 13 tools OK                      | all rejected | PASS   |

## Credential gate

| Scenario                    | Behavior                                                                     |
| --------------------------- | ---------------------------------------------------------------------------- |
| wrong password              | `password authentication failed for user "postgres"` — no password in output |
| unavailable host            | `Connection closed` — no URL/credentials in output                           |
| malformed URL (`not-a-url`) | `Connection closed` — no crash, no credential leak                           |
| stderr scan                 | 0 occurrences of the actual password in stderr                               |

## pg_stat_statements absence

Environment without `pg_stat_statements`:

```json
{
  "available": false,
  "reason": "pg_stat_statements is not installed or accessible"
}
```

Plugin continues to work; `slow_queries` degrades gracefully.

## Safe operations verified

- `SELECT` with parameters and limits.
- Catalog inspection (`list_schemas`, `list_tables`, `describe_table`,
  `list_indexes`).
- `EXPLAIN (FORMAT JSON)` (statement not executed).
- Monitoring views (`database_activity`, `locks`, `table_health`,
  `database_sizes`, `health_summary`).
- `slow_queries` with `pg_stat_statements` enabled.

## Unit tests

`packages/postgres-mcp/tests/query-safety.test.ts`: 31 tests covering single-
statement enforcement, forbidden keywords, `SELECT INTO`, false-positive
avoidance (`SELECT ... WHERE a IN (...)`), the F-1 identifier regressions
(`g` / `o` / `copy` / `role`), and the F-2/F-3 blocked-function surface
(`set_config`, `pg_read_file`, `pg_ls_dir`, `pg_stat_file`, ...).
