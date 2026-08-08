# Changelog

All notable changes to this plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.2] — 2026-08-08

### Changed

- Documented the upstream pin decision: `kubernetes-mcp-server` stays at
  `0.0.65`. Upstream `0.0.66` is a breaking release
  (`feat!(mcp): add 2026-07-28 spec support`); its security fixes are
  HTTP/wellknown-proxy only and unreachable in this stdio configuration, and
  no advisory affects `0.0.65`. Rationale and re-evaluation triggers recorded
  in `docs/UPSTREAM_TRUST.md`, README, and the collection trust policy.
  Docs-only change — no change to `plugin.yml`, `mcp.json`, or skills.

## [0.0.1] — 2026-08-07

### Changed

- Regenerated through Agent Plugin Builder v0.0.6 (declarative plugin.yml).
- Version normalized to 0.0.1.

### Added

- MCP server `kubernetes` (stdio, `kubernetes-mcp-server@0.0.65`,
  `--read-only --disable-multi-cluster`).
- Skills: `diagnose-pod`, `review-cluster`, `explain-kubernetes-resource`.
- Read-only enforcement runtime-verified against a disposable k3s cluster.
- Trust B upstream documented (trusted community server, not official).
