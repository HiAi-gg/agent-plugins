# Contributing

Thanks for considering contributing to the Agent Plugins collection.

## Scope

This repository contains exactly 13 active product plugins. Changes should
improve an existing plugin, its documentation, or the collection tooling —
not expand the plugin set without explicit approval.

## How to change an existing plugin

1. Identify the plugin under `plugins/<name>/`.
2. Change the **canonical source** first:
   - `plugin.yml` — manifest metadata, skills list, MCP server config;
   - `skills-src/<name>/*.md` — skill bodies;
   - `packages/` (postgresql only) — the bundled HiAI MCP;
   - `docs/` — per-plugin documentation.
3. Do not hand-edit generated structural files (`plugin.json`, `mcp.json`,
   `skills/*/SKILL.md`) without updating the source.

## Regenerate through Builder

```bash
bunx @hiai-gg/agent-plugins-builder create \
  --config plugins/<name>/plugin.yml \
  --output /tmp/plugin-regen
```

Compare the regenerated structural files to the committed ones; they should
match (except intentional content edits such as README/LICENSE/CHANGELOG).

## Validate

```bash
bunx @hiai-gg/agent-plugins-builder package plugins/<name> --dry-run
```

If a validation script exists in `scripts/`, run it too (official schemas +
Agent Skills rules).

## Test MCP/CLI runtime

- For MCP plugins: start the server per `mcp.json`, verify `initialize`,
  `tools/list`, and at least one real tool call.
- For CLI/Skills plugins: run the documented commands.
- For postgresql: run the package tests
  (`cd plugins/postgresql/packages/postgres-mcp && bun test`) and, when a
  container is available, the security gate
  (`DATABASE_URL=... bun run tests/security-gate.mjs`).

## Update trust docs

If you change an upstream dependency, update `docs/TRUST_POLICY.md` and the
plugin's `docs/UPSTREAM_TRUST.md`. New dependencies must satisfy the trust
policy; do not casually add arbitrary community MCP servers.

## Version bumps

- Product plugins follow 0.0.x → 0.1.0 semantics. Bump only for releases, not
  ordinary commits.
- Update the plugin's `plugin.json`, `CHANGELOG.md`, and (when released) the
  Git tag.
- Collection-level changes go in the root `CHANGELOG.md`.

## Proposing a new plugin

New plugins require explicit approval. Open a discussion/issue describing:
the category, the trusted upstream, the architecture, and why it belongs in
this collection. Do not submit new plugin directories directly.
