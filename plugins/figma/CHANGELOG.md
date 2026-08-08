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

## [0.0.1] — 2026-08-07

### Added

- Initial public release.
- MCP server `figma` (streamable-http → Figma's official remote endpoint).
- Skills: `inspect-design-context`, `implement-from-design`,
  `map-design-components`, `compare-code-to-design`.
- Read-only skill posture documented; Figma MCP's write-to-canvas capability
  documented (not hidden).
- Runtime status: CONFIG_VALIDATED / AUTH_RUNTIME_REQUIRES_USER.
