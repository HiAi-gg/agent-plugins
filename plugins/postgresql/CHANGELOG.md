# Changelog

All notable changes to this plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
