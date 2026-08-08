# Development

## Authoring vs distribution boundary

This repository keeps both the **authoring sources** and the **generated
distribution files** committed side by side:

- Authoring sources (edit these, never ship them): `plugin.yml`,
  `skills-src/<name>/*.md`
- Generated distribution files (what users install): `plugin.json`,
  `mcp.json` (when applicable), `skills/*/SKILL.md`, plus `README.md`,
  `LICENSE` and — for postgresql — `packages/postgres-mcp/`

Users should copy only the distribution files; `plugin.yml` and `skills-src/`
are intentionally not part of an installed plugin (Doctor reports them as
informational `DOC-5003` when present). See the collection README sections
"For Users: Installing Plugins" and "For Developers: Modifying Plugins".

## Canonical Builder workflow

All 13 plugins are generated from declarative `plugin.yml` sources through
**Agent Plugins Builder 0.0.9** (public CLI:

```bash
bunx @hiai-gg/agent-plugins-builder --version   # 0.0.9
```

The canonical source for each plugin is:

```
plugins/<name>/plugin.yml
plugins/<name>/skills-src/<name>/*.md
```

Generated (and committed) output:

```
plugin.json
mcp.json (when applicable)
skills/*/SKILL.md
```

## Regenerate → validate → compare

Collection-level process (one command per plugin, or a loop):

```bash
for p in plugins/*/; do
  name=$(basename "$p")
  bunx @hiai-gg/agent-plugins-builder create \
    --config "plugins/$name/plugin.yml" \
    --output "/tmp/regen-$name"
  diff "/tmp/regen-$name/plugin.json" "plugins/$name/plugin.json"
  diff "/tmp/regen-$name/mcp.json" "plugins/$name/mcp.json"
done
```

Unexpected drift is a failure. Structural output must come from Builder, not
manual edits.

## Validate

```bash
# Builder validation
bunx @hiai-gg/agent-plugins-builder package plugins/<name> --dry-run

# Official schema + Skills validation (scripts/validate_plugin.py when present)
python3 scripts/validate_plugin.py plugins/<name>
```

## Test MCP/CLI runtime

- **MCP plugins**: launch the server from `mcp.json`; verify `initialize`,
  `tools/list`, and at least one real tool call.
- **CLI/Skills plugins**: run the documented commands.
- **postgresql**: `cd plugins/postgresql/packages/postgres-mcp && bun test`
  for unit tests; with a PostgreSQL container,
  `DATABASE_URL=... bun run tests/security-gate.mjs` for the security gate.

## CI

See `.github/workflows/`. Static validation (Builder reproducibility, schema
validation, secret scan, structure) runs on every PR. Full runtime
integration (external services, OAuth, containers) is split out and is not a
mandatory root CI job.
