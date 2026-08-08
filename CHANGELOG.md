# Changelog

All notable changes to this collection (not individual plugins) will be
documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.2] — 2026-08-08

### Changed

- Full collection regeneration: all 13 plugins rebuilt from their declarative
  `plugin.yml` sources through **Agent Plugins Builder 0.0.9**. All generated
  artifacts (`plugin.json`, `mcp.json`, `skills/*/SKILL.md`) now reproduce
  byte-identically from the Builder, and all 13 plugins are at version 0.0.2.
- Builder reference updated 0.0.8 → 0.0.9 across README, AGENTS, development,
  release, and provenance docs.

### Fixed

- Duplicated YAML frontmatter blocks removed from all 50 `SKILL.md` files.
  Each skill document now has exactly one frontmatter block delimited by two
  `---` lines, so it parses as valid YAML for spec-compliant clients.
- Plugin READMEs now state the runtime/authoring boundary explicitly: only
  `plugin.json`, `mcp.json`, `skills/`, `README.md`, and `LICENSE` are
  installed; `plugin.yml`, `skills-src/`, and `docs/` are authoring sources.
- agent-browser upstream license corrected to **Apache-2.0** (previously
  documented as MIT) in the plugin README, `docs/UPSTREAM_TRUST.md`, and
  `docs/BUILD_NOTES.md`. The plugin's own license remains MIT.
- Trust policy now lists agent-browser alongside kubernetes as a Trust B
  upstream, instead of describing kubernetes as the only Trust B entry.

### Security

- **PostgreSQL hardening** (see `plugins/postgresql/CHANGELOG.md` for the full
  record): `set_config` and session read-only state changes blocked in the
  `query` tool; server-file and admin functions (`pg_read_file`, `pg_ls_dir`,
  `lo_*`, `pg_authid`, and friends) blocked as defense-in-depth;
  `DATABASE_URL` now required instead of falling back to a localhost default;
  psql backslash meta-command filter removed after it was found to reject
  legitimate identifiers. Security gate extended 19 → 30 cases and unit tests
  11 → 31, both now exiting non-zero on unexpected outcomes.
- Kubernetes upstream pin held at `kubernetes-mcp-server@0.0.65` with the
  review rationale and re-evaluation triggers recorded in the trust policy
  and `plugins/kubernetes/docs/UPSTREAM_TRUST.md`.

### Added

- **CI gates**: release-check now enforces byte-identical Builder 0.0.9
  regeneration across `plugin.json`, `mcp.json`, and the full content of every
  `SKILL.md`, plus a mandatory Agent Plugins Doctor 0.0.6 gate over all 13
  plugins. The validate workflow gained frontmatter, structure, and secret
  scan checks.

## [0.0.1] — 2026-08-08

### Added

- Initial public collection release.
- 13 product plugins (github, agent-browser, context7, firecrawl, redis,
  sentry, supabase, figma, cloudflare, notion, docker, kubernetes,
  postgresql), all at 0.0.1 and reproducible through Agent Plugins Builder
  0.0.8.
- PostgreSQL compatibility matrix: 14–18 tested, 19 beta compatibility
  tested.
- Collection tooling docs (Builder, Doctor) and policies (trust, security,
  compatibility, development, releases).
