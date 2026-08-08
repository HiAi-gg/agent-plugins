# Changelog

All notable changes to this plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] — 2026-08-07

### Changed

- Regenerated through Agent Plugin Builder v0.0.6 (declarative plugin.yml).
- Version normalized to 0.0.1.

### Added

- MCP server `redis` (stdio, `redis-mcp-server==0.5.1`, pinned).
- Skills: `inspect-redis`, `diagnose-redis-data`, `inspect-streams`,
  `analyze-memory-state`.
- Read-first posture documented; read-only enforcement via Redis ACL user
  documented (server itself exposes write tools).
