# AGENTS.md — instructions for coding agents

## Repository purpose

`agent-plugins` is the canonical collection repository for HiAI's portable
Agent Plugins. It is a catalog, a source repo, a reproducible Builder-based
collection, and a validation corpus. It is NOT the Agent Plugins
specification (that is https://agent-plugins.org/) and is NOT affiliated with
upstream vendors merely because their MCPs/CLIs are integrated.

## Active plugins (exactly 13)

github, agent-browser, context7, firecrawl, redis, sentry, supabase, figma,
cloudflare, notion, docker, kubernetes, postgresql — all under `plugins/`.

Do NOT add other plugins (playwright, sqlite, openapi, ssh, filesystem, git,
rest-api are excluded from the active collection). Do NOT add a new plugin
without explicit approval.

## Canonical Builder workflow

Every plugin is reproducible from:

```
plugins/<name>/plugin.yml  +  plugins/<name>/skills-src/<name>/*.md
```

through **Agent Plugins Builder 0.0.9** (public CLI:
`bunx @hiai-gg/agent-plugins-builder`). Never hand-edit generated structural
output (plugin.json, mcp.json, skills/*/SKILL.md) without updating the
declarative source. Regenerate instead:

```bash
bunx @hiai-gg/agent-plugins-builder create --config plugins/<name>/plugin.yml --output <tmp> --force
```

## Source-of-truth rules

- `plugin.yml` + skill sources are the canonical source.
- `plugin.json`, `mcp.json`, `skills/` are generated (and committed).
- Individual plugin README/CHANGELOG/LICENSE are per-plugin content.
- The official Agent Plugins / Agent Skills / MCP specifications are
  authoritative over any tooling.

## Validation commands

Per plugin:

```bash
bunx @hiai-gg/agent-plugins-builder package plugins/<name> --dry-run   # Builder validation
python3 scripts/validate_plugin.py plugins/<name>                      # official schemas (if present)
```

Collection-wide:

```bash
scripts/validate-all.sh        # regenerate → validate → compare for every plugin
```

## Documentation rules

- Root README = catalog (13-row table, no essays before it).
- Per-plugin docs live in `plugins/<name>/docs/`.
- Keep docs factual; never claim untested compatibility or vendor
  endorsement.

## Security / trust rules

- Never commit secrets (.env, keys, tokens, passwords, credential-bearing
  DATABASE_URL).
- Trust policy: Trust A (first-party), Trust B (only kubernetes,
  `containers/kubernetes-mcp-server`), HiAI Native (postgresql bundled MCP).
  See `docs/TRUST_POLICY.md`.
- No arbitrary community MCP dependencies.

## Version policy

- Product plugins: 0.0.1 → 0.0.2 → … → 0.0.10 → 0.1.0 (0.0.x first).
- Builder and Doctor keep their own independent versions.
- Root collection CHANGELOG tracks collection-level changes only.

## Release rules

- Regenerate + validate all plugins before release.
- Confirm PostgreSQL 14–18 tested, 19 beta compatibility tested (GA follow-up
  required when PG19 ships).
- No release without the collection-level audit (see
  `COLLECTION_RELEASE_REPORT.md`).
