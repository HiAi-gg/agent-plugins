# Changelog

All notable changes to this plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] — 2026-08-07

### Added

- Initial public release.
- MCP server `cloudflare` (streamable-http → Cloudflare Code Mode MCP).
- Skills: `debug-worker`, `inspect-dns`, `investigate-request`,
  `review-cloudflare-config`.
- Read-first skill posture; mutations require explicit user intent.
- Runtime status: CONFIG_VALIDATED / AUTH_RUNTIME_REQUIRES_USER.
