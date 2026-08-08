# Changelog

All notable changes to this plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.2] — 2026-08-08

### Fixed

- **F-1**: psql backslash meta-commands (`\g`, `\o`, `\copy`, `\ir`, `\!`)
  removed from the keyword filter. They were compiled through JavaScript
  identity escapes into bare-letter word matches (`\bg\b`, `\bo\b`, ...) that
  rejected legitimate identifiers (`SELECT g FROM generate_series(1,1000)
AS x(g)`, `SELECT o.total FROM app.orders o`, `SELECT copy FROM ...`,
  `SELECT role FROM ...`). The MCP sends SQL directly to PostgreSQL, never
  through interactive psql, so these meta-commands cannot be executed and are
  no longer filtered. `COPY ... TO/FROM` remains blocked as a
  statement-leading keyword.
- **F-2**: `set_config` (and any function that can change session-level
  read-only state) is now blocked in the `query` tool, closing the
  `SELECT set_config('default_transaction_read_only','off',false)` bypass.
  Server-side `default_transaction_read_only=on` enforcement is unchanged.
- **F-3**: server-file and admin functions are now blocked in the `query`
  tool: `pg_read_file`, `pg_read_binary_file`, `pg_ls_dir` and friends,
  `pg_stat_file`, `pg_file_rename`, `pg_file_unlink`, `pg_logdir_files`,
  `pg_walfile_name`, plus `pg_reload_conf`, `pg_switch_wal`,
  `pg_terminate_backend`, `pg_cancel_backend`, `lo_*`, and
  `pg_authid`/`pg_shadow`. These blocks are defense-in-depth; the plugin
  must be used with a least-privilege PostgreSQL role.
- **DATABASE_URL is now required**: the server refuses to start with a clear
  error when it is unset instead of silently falling back to
  `postgresql://localhost:5432/postgres`.
- Security gate extended from 19 to 30 cases (set_config path, function
  surface, F-1 identifier regressions) and now exits non-zero on unexpected
  outcomes. Unit tests extended from 11 to 31.

### Added

- Skill-level `license`, `compatibility`, and `metadata` in `plugin.yml` for
  all 5 skills (they were present in the generated `SKILL.md` files but
  missing from the declarative source).
- Least-privilege role requirement and `GRANT` recipe documented in README
  and `docs/SECURITY.md`.

## [0.0.1] — 2026-08-07

### Added

- Initial release (deliberately read-only).
- Bundled HiAI PostgreSQL MCP (`packages/postgres-mcp`): 13 read-only
  diagnostic tools over stdio.
- Server-side read-only enforcement via connection options
  (`default_transaction_read_only=on`, timeouts) plus tool/input/output
  defense-in-depth layers.
- Skills: `inspect-database`, `diagnose-query`, `diagnose-performance`,
  `diagnose-locks`, `review-database-health`.
- Security gate (19 cases) verified on PostgreSQL 14 and 16.
- Credential redaction verified.
