# Multi-Client Distribution Report — HiAi-gg/agent-plugins

Date: 2026-08-09. Scope: distribute the 13-plugin collection to every
officially listed Agent Plugins client using verified, client-native
mechanisms — no product plugins added, no plugin forks, no changes to
canonical `plugin.json` / `skills/` / `mcp.json` contents, no
Builder/Doctor/PostgreSQL architecture changes.

## 1. Research sources (all fetched/verified 2026-08-09)

| Client          | Primary sources                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Codex / ChatGPT | https://developers.openai.com/plugins/build/plugins.md · https://developers.openai.com/codex/plugins · openai/codex source: `codex-rs/core-plugins/src/marketplace.rs` (manifest paths, raw JSON structs), `marketplace_add/*` (add flow), `loader.rs` (git materialization), `codex-rs/utils/plugins/src/plugin_namespace.rs` (schema URI `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json` is a supported Agent Plugin schema) |
| VS Code         | https://code.visualstudio.com/docs/agent-customization/agent-plugins · microsoft/vscode source: `chat/common/constants.ts` (settings), `chat/common/plugins/pluginMarketplaceService.ts` (marketplace.json discovery incl. `.github/plugin/marketplace.json`), `chat/browser/actions/chatPluginActions.ts` (`Chat: Install Plugin From Source`)                                                                                             |
| GitHub Copilot  | https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-marketplace · https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference · official example marketplaces `github/copilot-plugins` and `github/awesome-copilot`                                                                                                                                                                |
| Cursor          | https://cursor.com/docs/plugins · https://cursor.com/docs/reference/plugins · official team-marketplace template `fieldsphere/cursor-team-marketplace-template`                                                                                                                                                                                                                                                                             |
| Kiro            | https://kiro.dev/docs/powers/ · https://kiro.dev/docs/powers/installation/ · https://kiro.dev/powers                                                                                                                                                                                                                                                                                                                                        |
| Spec            | https://agent-plugins.org/compatible-clients (lists exactly VS Code, Cursor, GitHub Copilot, ChatGPT & Codex, Kiro)                                                                                                                                                                                                                                                                                                                         |

> Note: the task's Copilot URL
> (`.../creating-a-plugin-marketplace-for-github-copilot-cli`) is a 404 after
> a docs restructure; the current canonical pages are listed above.

## 2. Formats, paths, and files added

| Manifest                 | Path                               | Format                                                             | Source shape per entry                                                                                                |
| ------------------------ | ---------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Codex                    | `.agents/plugins/marketplace.json` | Codex marketplace manifest (name/interface/owner/metadata/plugins) | `{"source":"git-subdir","url":"https://github.com/HiAi-gg/agent-plugins.git","path":"./plugins/<name>","ref":"main"}` |
| Cursor                   | `.cursor-plugin/marketplace.json`  | Cursor marketplace manifest (name/owner/metadata/plugins)          | `"./plugins/<name>"` (relative)                                                                                       |
| GitHub Copilot + VS Code | `.github/plugin/marketplace.json`  | Copilot marketplace manifest (same relative sources)               | `"./plugins/<name>"` (relative)                                                                                       |

Files added/changed in this task:

- `scripts/generate-marketplaces.ts` — deterministic generator (new)
- `scripts/validate-marketplaces.ts` — semantic validator, reuses generator logic (new)
- `.agents/plugins/marketplace.json`, `.cursor-plugin/marketplace.json`, `.github/plugin/marketplace.json` — generated, committed (new)
- `docs/CLIENT_DISTRIBUTION_MATRIX.md`, `docs/MARKETPLACE_ACCEPTANCE.md`, `docs/INSTALLATION.md`, `docs/MULTI_CLIENT_DISTRIBUTION_REPORT.md` (new)
- `.github/workflows/validate.yml` — two added gates (drift check + validation) (changed)
- `README.md` — Installation section (changed)

## 3. Exact commands

```bash
# generate / verify
bun run scripts/generate-marketplaces.ts            # writes the 3 manifests
bun run scripts/generate-marketplaces.ts --check    # exit 1 on drift (determinism)
bun run scripts/validate-marketplaces.ts            # 13 x 3 semantic validation

# codex (verified live, clean CODEX_HOME, codex-cli 0.146.0)
codex plugin marketplace add /path/to/agent-plugins       # PASS (local source)
codex plugin marketplace list                             # PASS
codex plugin list                                         # PASS (13 plugins)
codex plugin add agent-browser@hiai-agent-plugins         # PASS (installed)
codex plugin add context7@hiai-agent-plugins              # PASS
codex plugin add github@hiai-agent-plugins                # PASS
codex plugin add postgresql@hiai-agent-plugins            # PASS
codex plugin add docker@hiai-agent-plugins                # PASS

# intended end-user flows (not run: no binaries / not yet pushed)
codex plugin marketplace add HiAi-gg/agent-plugins        # blocked until push (see §8)
copilot plugin marketplace add HiAi-gg/agent-plugins      # docs-verified
copilot plugin install postgresql@hiai-agent-plugins      # docs-verified
# VS Code: Command Palette → Chat: Install Plugin From Source → repo URL (docs-verified)
# Cursor: Dashboard → Plugins → Team Marketplaces → Import from Repo (docs-verified)
# Kiro: Powers → Add Custom Power → Import power from GitHub/folder (docs-verified)
```

## 4. Direct vs. marketplace support per client

| Client         | Direct source install                   | Git marketplace                                | Verified level                                        |
| -------------- | --------------------------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| Codex          | `codex plugin add <spec>` / local path  | `.agents/plugins/marketplace.json`             | VERIFIED (live CLI)                                   |
| VS Code        | `Chat: Install Plugin From Source`      | `chat.plugins.marketplaces` + Copilot manifest | DOCS VERIFIED                                         |
| GitHub Copilot | `copilot plugin install <spec>`         | `.github/plugin/marketplace.json`              | DOCS VERIFIED                                         |
| Cursor         | Team Marketplace import                 | `.cursor-plugin/marketplace.json`              | DOCS VERIFIED                                         |
| Kiro           | Powers (GitHub URL / folder / kiro.dev) | **none exists**                                | PARTIAL (format/direct docs-verified; no marketplace) |

## 5. Skills / MCP / auth limitations

- **Codex**: verified that plugin.json (agent-plugins.org 1.0.0 schema URI is
  Codex's supported Agent Plugin schema), skills, and MCP metadata are all
  consumed. Auth is per-plugin policy (`ON_INSTALL` default — matches what the
  manifests declare); remote-OAuth plugins (github, sentry, figma, cloudflare,
  notion) still require the user grant at runtime (per
  docs/COMPATIBILITY.md). Codex materializes the full plugin directory
  (authoring sources included) — harmless, DOC-5003 informational only.
- **VS Code / Copilot / Cursor**: Skills + MCP stdio / Streamable HTTP /
  legacy SSE are supported per the spec compatibility page. Remote-OAuth MCP
  plugins need interactive user auth in all clients; no client-independent
  auth credential is committed (by design).
- **Kiro**: Powers support the Agent Plugins format (plugin.json, skills/,
  mcp.json, dev.kiro/ extensions); MCP servers are managed internally by Kiro
  (auto-namespaced) and activate with the Power. No multi-plugin marketplace
  index; one power per repo/folder.
- **Version pinning**: Codex entries pin `ref: "main"`; SHA-pinning is not
  used (would require per-release updates). Copilot/Cursor relative sources
  resolve within the same repo (no pinning needed).

## 6. The 13 discovery results (Codex live)

`codex plugin list` after registering the marketplace reported all 13 with
correct sources: github, agent-browser, context7, firecrawl, redis, sentry,
supabase, figma, cloudflare, notion, docker, kubernetes, postgresql — each
`not installed` initially, with `path 'plugins/<name>', ref 'main'`. Five were
then installed end-to-end (agent-browser, context7, github, postgresql,
docker); the other eight are listed/available with identical mechanics.

## 7. CI drift validation

`.github/workflows/validate.yml` gained exactly two steps (existing portable
gates 1–5 untouched):

1. **Marketplace drift check**: `bun run scripts/generate-marketplaces.ts --check`
   (determinism + plugin count/name guard, fails on add/remove/rename).
2. **Marketplace validation**: `bun run scripts/validate-marketplaces.ts`
   (13 x 3 plugins, canonical values, source shapes, path existence, secrets).

Both workflows parse as valid YAML (verified with PyYAML).

## 8. Remaining limitations

1. **Codex public-repo add**: `codex plugin marketplace add HiAi-gg/agent-plugins`
   is blocked until this commit is pushed to `main` (the add command requires
   the manifest on the cloned branch). Verified equivalent via local-path
   registration; exact error recorded in docs/MARKETPLACE_ACCEPTANCE.md.
2. **VS Code / Cursor / Copilot live tests**: no `code`, `copilot`, or Cursor
   binary in this environment — manifest formats verified against official
   docs/source only (DOCS VERIFIED). Live UI acceptance remains on a machine
   with those clients.
3. **Kiro**: no Git marketplace mechanism exists; Powers/direct install only.
   We intentionally do not fabricate marketplace support.
4. **SHA pinning**: entries track `main`; a future release could pin SHAs for
   reproducible installs (documented, not required).
5. **Cursor plugin-layout detail**: Cursor's docs describe per-plugin
   `.cursor-plugin/plugin.json` inside each plugin dir; our plugins ship the
   agent-plugins.org `plugin.json` at the plugin root (Cursor is an
   agent-plugins.org listed client and reads that format). Not live-tested.

## 9. GO / NO-GO per client

| Client          | Decision               | Basis                                                                                                                                          |
| --------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Codex / ChatGPT | **GO**                 | Live verified: registration (local source), 13-plugin discovery, 5 end-to-end installs; only blocker is push of the manifest (resolves itself) |
| VS Code         | **GO (docs-verified)** | Reads the shipped Copilot `.github/plugin/marketplace.json`; official install commands documented; live UI not tested                          |
| GitHub Copilot  | **GO (docs-verified)** | Manifest matches documented schema and official example marketplaces; CLI not run                                                              |
| Cursor          | **GO (docs-verified)** | Manifest matches documented schema and official template; app not run                                                                          |
| Kiro            | **CONDITIONAL GO**     | Installable as individual Powers (direct); **no marketplace claim** — do not advertise Git-marketplace support                                 |

## 10. Validation summary (all run in this environment)

- `generate-marketplaces.ts --check` twice: zero diff.
- `validate-marketplaces.ts`: PASS.
- Builder 0.0.9 `repro-check.sh`: all 13 clean (no plugin changes).
- Doctor 0.0.6: 13/13 pass.
- Official 1.0.0 schema validator: 13/13 pass; 50/50 skills frontmatter.
- Secret scan (plugins + new files): PASS.
- CI YAML: valid.
- No client forks / duplicated plugin trees (diff contains only
  marketplace.json files, scripts, docs, CI).
