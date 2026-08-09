# Client Distribution Matrix

How this collection (HiAi-gg/agent-plugins) is distributed to each officially
listed Agent Plugins client, with exact manifests, commands, and verification
status.

Status vocabulary used throughout:

- **VERIFIED** — exercised live in this environment (real binary/CLI, real
  command output).
- **DOCS VERIFIED** — confirmed against the vendor's official documentation
  and/or the vendor's public source code; not exercised live (no binary/UI
  available in this environment).
- **PARTIAL** — one part verified live, the rest docs-verified.
- **NOT VERIFIED** — no official mechanism exists or could be confirmed.

The officially listed clients (per https://agent-plugins.org/compatible-clients)
are: **VS Code, Cursor, GitHub Copilot, ChatGPT & Codex, Kiro**. Agent
Plugins 1.0.0 covers Agent Skills + MCP; all listed clients support those
component types.

## Matrix

| Client                       | Direct source install                                                                                                                              | Git marketplace                                                                                                               | Marketplace manifest in this repo                                       | Skills | MCP transports                             | Auth / update model                                                                                                                       | Official URLs                                                                                                                                                                          | Status                                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **ChatGPT & Codex** (OpenAI) | `codex plugin add <plugin>` / local path                                                                                                           | Yes — `codex plugin marketplace add`                                                                                          | `.agents/plugins/marketplace.json` (`source: "git-subdir"`)             | Yes    | MCP stdio, Streamable HTTP (no legacy SSE) | Plugin-level auth policy (`ON_INSTALL`/`ON_USE`); updates via `codex plugin marketplace upgrade`                                          | https://developers.openai.com/plugins/build/plugins.md · https://developers.openai.com/codex/plugins · https://github.com/openai/codex                                                 | **VERIFIED**                                                                                                            |
| **VS Code**                  | Yes — `Chat: Install Plugin From Source` (Git repo URL or local folder)                                                                            | Yes — `chat.plugins.marketplaces` setting (Git repos)                                                                         | `.github/plugin/marketplace.json` (Copilot convention, read by VS Code) | Yes    | MCP stdio, Streamable HTTP, legacy SSE     | Trust prompt on first marketplace; updates via `Extensions: Check for Extension Updates` (or ~24h auto)                                   | https://code.visualstudio.com/docs/agent-customization/agent-plugins · https://aka.ms/vscode-agent-plugins                                                                             | **DOCS VERIFIED** (live UI not tested — no VS Code binary here)                                                         |
| **GitHub Copilot** (CLI)     | Yes — `copilot plugin install <spec>` (repo/local path)                                                                                            | Yes — `copilot plugin marketplace add OWNER/REPO`                                                                             | `.github/plugin/marketplace.json` (relative `./plugins/<name>` sources) | Yes    | MCP stdio, Streamable HTTP, legacy SSE     | Marketplace cache refreshed via `copilot plugin marketplace update`; installs under `~/.copilot/installed-plugins/<marketplace>/<plugin>` | https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-marketplace · https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference | **DOCS VERIFIED** (no copilot binary available here)                                                                    |
| **Cursor**                   | Yes — Team Marketplace "Import from Repo" (GitHub URL); Customize panel installs                                                                   | Yes — Team Marketplace import; manifest read from repo root                                                                   | `.cursor-plugin/marketplace.json` (relative `./plugins/<name>` sources) | Yes    | MCP stdio, Streamable HTTP, legacy SSE     | Org-admin managed Team Marketplace (Dashboard → Plugins); optional auto-refresh                                                           | https://cursor.com/docs/plugins · https://cursor.com/docs/reference/plugins                                                                                                            | **DOCS VERIFIED** (no Cursor app/binary here)                                                                           |
| **Kiro**                     | Yes — Powers: "Add Custom Power → Import power from GitHub" or local folder; curated `kiro.dev/powers` + `kiro.dev/launch/powers/add?name=<power>` | **No Git marketplace manifest exists** — Kiro's "marketplace" is the curated Powers directory, not a `marketplace.json` index | none (not applicable)                                                   | Yes    | MCP stdio, Streamable HTTP, legacy SSE     | Powers activate by keyword; updates via Powers panel → "Check for updates"                                                                | https://kiro.dev/docs/powers/ · https://kiro.dev/docs/powers/installation/ · https://kiro.dev/powers                                                                                   | **PARTIAL** (Agent Plugins format + direct install docs-verified; no Git marketplace — documented, do not fake support) |

## Distinctions that matter

### VS Code: extension marketplace vs. agent plugin marketplace

- The **VS Code extension marketplace** (marketplace.visualstudio.com) is for
  _extensions_ (language servers, themes, UI extensions). It has nothing to do
  with Agent Plugins.
- The **agent plugin marketplace** is the plugin distribution channel: a Git
  repository containing `marketplace.json` (Copilot/OpenPlugin/Claude formats)
  or a standalone plugin repo. VS Code reads the same manifest conventions as
  GitHub Copilot — including `.github/plugin/marketplace.json` — so this
  repo's Copilot manifest is directly consumable by VS Code.
- Install agents plugins in VS Code via `Chat: Install Plugin From Source`,
  the Agent Customizations editor → Plugins tab, or the `@agentPlugins`
  extension-view filter. Do not confuse these with `code --install-extension`.

### Kiro Powers vs. a Git marketplace

- Kiro **Powers** are Agent-Plugins-format plugins (`plugin.json` with the
  agent-plugins.org `$schema`, `skills/`, optional `mcp.json`, optional
  `dev.kiro/` extensions). They install **one power per repository/folder** —
  there is no multi-plugin `marketplace.json` index.
- Kiro's word "marketplace" refers to the **curated directory at
  kiro.dev/powers** (backed by github.com/kirodotdev/powers, a flat set of
  single-power directories, not a marketplace index).
- Consequence for this collection: Kiro cannot consume the three generated
  marketplace manifests. Kiro users should install individual plugins with
  "Import power from GitHub" (repository URL) or copy the runtime files of a
  single plugin (see docs/INSTALLATION.md).
- We do **not** claim Git-marketplace support for Kiro; none exists in the
  official documentation or source.

### Codex `git-subdir` entries

Codex marketplace entries reference the same repository that hosts the
marketplace manifest (`https://github.com/HiAi-gg/agent-plugins.git`, path
`./plugins/<name>`, ref `main`). Codex clones the repo and sparse-checks-out
each plugin directory on install. The `source: "git-subdir"` object is the
shape documented at developers.openai.com/plugins/build/plugins.md and parsed
by `openai/codex` (`codex-rs/core-plugins/src/marketplace.rs`). Codex accepts
the collection's root-level `plugin.json` because its supported Agent Plugin
schema URI is exactly
`https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`.

## Verification notes

- **Codex live test** (this environment, `codex-cli 0.146.0`, clean
  `CODEX_HOME`, public GitHub `main`): `codex plugin marketplace add
HiAi-gg/agent-plugins` exited 0, `codex plugin marketplace list` showed
  `hiai-agent-plugins`, `codex plugin list --available --json` listed exactly
  13 plugins all at `0.0.2`, and end-to-end install of `agent-browser`,
  `context7`, `github`, `postgresql`, and `docker` — all succeeded
  (`installed, enabled 0.0.2`), with skills and MCP metadata in the installed
  cache. Temporary `CODEX_HOME` was cleaned up after verification. See
  docs/MARKETPLACE_ACCEPTANCE.md for exact output.
- **VS Code / Cursor / Copilot**: manifest formats and discovery paths were
  verified against official docs and vendor source; no binary/UI was
  available to exercise them live. Marked DOCS VERIFIED.
- **Kiro**: Powers/direct install documented from official docs; no Git
  marketplace mechanism exists (NOT VERIFIED as marketplace — by design).
