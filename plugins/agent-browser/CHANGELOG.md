# Changelog

All notable changes to this plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.2] — 2026-08-08

### Changed

- Regenerated from `plugin.yml` through Agent Plugins Builder 0.0.9; generated
  artifacts reproduce byte-identically. Version bumped to 0.0.2.

### Fixed

- Removed duplicated YAML frontmatter from the generated `SKILL.md` files;
  each now has exactly one frontmatter block and parses as valid YAML.
- README installation section now states the runtime/authoring boundary:
  install the runtime files only, not `plugin.yml`, `skills-src/`, or `docs/`.
- Upstream `agent-browser` CLI license corrected to Apache-2.0 (previously
  documented as MIT) in the README, `docs/UPSTREAM_TRUST.md`, and
  `docs/BUILD_NOTES.md`. This plugin's own license remains MIT.

## [0.0.1] — 2026-08-07

### Added

- Initial public release.
- Skills-only architecture (CLI + Skills; no MCP).
- Skills: `browse-web`, `test-web-flow`, `debug-web-ui`.
- Upstream: agent-browser CLI 0.31.1 (runtime-verified workflow: install,
  doctor, open, read, click, fill, navigate, close).
