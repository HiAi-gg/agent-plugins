# Installation

How to install HiAI's Agent Plugins in each client. The collection ships two
distribution mechanisms — a **portable plugin** (what each client ultimately
loads) and, for three clients, a **Git marketplace manifest** (an index that
lets the client fetch plugins from this repository on demand).

## Marketplace vs. portable plugin — the distinction

| Concept                      | What it is                                                                                                                                                            | Where it lives                                                                                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Portable Agent Plugin**    | The runtime package a client loads: `plugin.json`, `mcp.json` (when present), `skills/*/SKILL.md`, `README.md`, `LICENSE` (+ `packages/postgres-mcp/` for postgresql) | `plugins/<name>/` in this repo                                                                                                                       |
| **Git marketplace manifest** | An index (`marketplace.json`) listing plugins with fetch sources; the client clones this repo and installs individual plugins                                         | `.agents/plugins/marketplace.json` (Codex), `.cursor-plugin/marketplace.json` (Cursor), `.github/plugin/marketplace.json` (GitHub Copilot + VS Code) |

Installing from a marketplace = the client clones the repo and copies the
portable plugin files itself. Installing a portable plugin manually = you copy
the runtime files yourself. Both produce the same runtime result; the
marketplace route is preferred because the client tracks versions and updates.

> Important: do **not** copy authoring sources (`plugin.yml`, `skills-src/`,
> `docs/`) into an installed plugin. They are kept in this repository as the
> reproducible Builder source; a client re-validating an installed plugin
> reports them only as the informational DOC-5003 note.

## Per-client routes

### OpenAI Codex / ChatGPT

```bash
# Register the marketplace (verified live from public GitHub main):
codex plugin marketplace add HiAi-gg/agent-plugins

# Discover:
codex plugin marketplace list
codex plugin list --available --json

# Install:
codex plugin add github@hiai-agent-plugins
codex plugin add agent-browser@hiai-agent-plugins
codex plugin add context7@hiai-agent-plugins
codex plugin add postgresql@hiai-agent-plugins

# Update marketplace snapshots and installed plugins:
codex plugin marketplace upgrade
```

Alternative (no network clone): register this checkout directly as a local
marketplace (`codex plugin marketplace add /path/to/agent-plugins`). The
public command above is verified against `main` (see
docs/MARKETPLACE_ACCEPTANCE.md); the local path is only needed for offline
work.

Portable fallback: create a plugin folder in
`$CODEX_HOME/plugins/<name>/plugin.json` (or the platform equivalent) and copy
the runtime files from `plugins/<name>/`.

### VS Code

```bash
# From the Command Palette:  Chat: Install Plugin From Source
# Paste the repository URL: https://github.com/HiAi-gg/agent-plugins
```

Or configure a Git marketplace in settings (`chat.plugins.marketplaces`):

```jsonc
// settings.json
{
  "chat.plugins.marketplaces": ["HiAi-gg/agent-plugins"],
}
```

VS Code reads this repo's `.github/plugin/marketplace.json` (the Copilot
convention) and offers the 13 plugins in the Agent Customizations editor →
Plugins tab. First install from a new marketplace shows a trust prompt.

Portable fallback: point `Chat: Install Plugin From Source` at a local folder
containing a single plugin's runtime files, or use `chat.pluginLocations`.

> VS Code **extensions** (marketplace.visualstudio.com, `code --install-extension`)
> are unrelated to Agent Plugins. See
> docs/CLIENT_DISTRIBUTION_MATRIX.md for the distinction.

### GitHub Copilot (CLI)

```bash
# Register the marketplace:
copilot plugin marketplace add HiAi-gg/agent-plugins

# Browse and install:
copilot plugin marketplace browse hiai-agent-plugins
copilot plugin install postgresql@hiai-agent-plugins

# Update:
copilot plugin marketplace update
```

This repo's `.github/plugin/marketplace.json` is the documented discovery path
(also `.plugin/marketplace.json` / root `marketplace.json` work; `.github/plugin`
is what we ship). Relative `./plugins/<name>` sources resolve inside this repo.

Portable fallback: `copilot plugin install ./plugins/<name>` from a checkout,
or copy runtime files under `~/.copilot/installed-plugins/_direct/...`.

### Cursor

Team Marketplace import (org admins): **Dashboard → Plugins → Team Marketplaces
→ Add Marketplace → Import from Repo**, paste
`https://github.com/HiAi-gg/agent-plugins`. Cursor reads
`.cursor-plugin/marketplace.json` and lists the 13 plugins; team members
install from the Customize sidebar panel. Enterprise admin gating and optional
auto-refresh apply per Cursor's team-marketplace settings.

Portable fallback: copy a single plugin's runtime files into your project
(`.cursor/plugins/<name>/` or the equivalent Cursor plugin directory).

### Kiro (Powers — direct install, no Git marketplace)

Kiro has **no Git marketplace manifest**; Powers install one-per-repo/folder.

- From GitHub: Powers panel → **Add Custom Power → Import power from GitHub** →
  paste a repository URL. Our plugins are one of several in one repo, so point
  the import at a single-plugin repository, or:
- From a folder: **Add Custom Power → Import power from a folder** → select a
  directory containing the plugin runtime files (`plugin.json`, `skills/`,
  optional `mcp.json`).
- Curated route: browse https://kiro.dev/powers → **Add to Kiro**.

To install a single HiAI plugin as a Power from this repo: clone the repo,
`cp -r plugins/<name> /tmp/<name>` (runtime files only; keep `plugin.json`,
`mcp.json` when present, `skills/`, `README.md`, `LICENSE`, and postgresql's
`packages/postgres-mcp/`), then import `/tmp/<name>` as a folder. Kiro
activates the Power by keyword and manages its MCP servers.

## Manual / conformant-client install (portable)

Any Agent Plugins 1.0.0-conformant client can load a plugin from runtime files:

```bash
# From a checkout of this repo, per plugin:
cp -r plugins/<name> /tmp/plugin-install
# then trim authoring sources:
rm -rf /tmp/plugin-install/plugin.yml /tmp/plugin-install/skills-src /tmp/plugin-install/docs
# copy /tmp/plugin-install into your client's plugin directory
```

postgresql additionally requires its bundled MCP server (`packages/postgres-mcp/`)
and a `DATABASE_URL` for the MCP subprocess — see the plugin's README and
docs/POSTGRESQL_SUPPORT.md.

## Verification commands

```bash
bun run scripts/generate-marketplaces.ts --check   # manifests are current
bun run scripts/validate-marketplaces.ts           # 13 x 3 manifests, sources, no secrets
```

See docs/MARKETPLACE_ACCEPTANCE.md for the full acceptance matrix and exact
tested command output.
