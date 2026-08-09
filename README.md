# Agent Plugins

**Build, validate, and use portable Agent Plugins.**

This is HiAI's curated collection of portable
[Agent Plugins](https://agent-plugins.org/) — trusted MCP and CLI
integrations paired with focused Agent Skills, safe defaults, and
reproducible builds. It ships alongside the two tools that make the format
work end to end:

- **[Agent Plugins Builder](https://github.com/HiAi-gg/agent-plugins-builder)**
  — create, migrate, and package Agent Plugins from declarative sources.
- **[Agent Plugins Doctor](https://github.com/HiAi-gg/agent-plugins-doctor)**
  — validate, diagnose, and safely fix Agent Plugins.

Every plugin here is generated from a declarative `plugin.yml` source,
byte-identical to a fresh **Builder 0.0.9** regeneration, and passes the
**Doctor 0.0.6** validator.

[![Agent Plugins](https://img.shields.io/badge/Agent%20Plugins-1.0.0-blue)](https://agent-plugins.org/)
[![Builder](https://img.shields.io/badge/Builder-0.0.9-purple)](https://github.com/HiAi-gg/agent-plugins-builder)
[![Doctor](https://img.shields.io/badge/Doctor-0.0.6-teal)](https://github.com/HiAi-gg/agent-plugins-doctor)
[![Release](https://img.shields.io/badge/Release-v0.0.2-orange)](https://github.com/HiAi-gg/agent-plugins/releases/tag/v0.0.2)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Plugins](https://img.shields.io/badge/Plugins-13-green)](#plugins)

## Agent Plugins Ecosystem

| Component                  | What it is                                             | Get it                                                                                                                    |
| -------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **Collection** (this repo) | 13 curated, validated Agent Plugins with safe defaults | [Browse the plugins](#plugins)                                                                                            |
| **Builder**                | Create, migrate, and package Agent Plugins             | [HiAi-gg/agent-plugins-builder](https://github.com/HiAi-gg/agent-plugins-builder) · `bunx @hiai-gg/agent-plugins-builder` |
| **Doctor**                 | Validate, diagnose, and safely fix Agent Plugins       | [HiAi-gg/agent-plugins-doctor](https://github.com/HiAi-gg/agent-plugins-doctor) · `bunx @hiai-gg/agent-plugins-doctor`    |

Builder and Doctor are independent projects. They are linked here as
tooling, not copied into this repository.

## Plugins

The collection contains **exactly 13 active plugins**. Runtime status follows
the vocabulary in [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md); trust
labels are defined in [docs/TRUST_POLICY.md](docs/TRUST_POLICY.md).

| Plugin                                 | What it does                                                                                                               | Integration          | Status             | Trust       |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------ | ----------- |
| [github](plugins/github)               | Review pull requests, triage issues, and investigate CI and repositories.                                                  | Remote MCP + Skills  | User auth required | Trust A     |
| [agent-browser](plugins/agent-browser) | Drive a real browser: read accessible snapshots, click, fill, navigate, and test web flows.                                | CLI + Skills         | Runtime verified   | Trust B     |
| [context7](plugins/context7)           | Fetch current library and framework documentation when coding agents need up-to-date API knowledge.                        | MCP + Skills         | Runtime verified   | Trust A     |
| [firecrawl](plugins/firecrawl)         | Search, scrape, crawl, and extract structured data from the web.                                                           | MCP + Skills         | Runtime verified   | Trust A     |
| [redis](plugins/redis)                 | Inspect and diagnose Redis data, streams, and memory behavior.                                                             | MCP + Skills         | Runtime verified   | Trust A     |
| [sentry](plugins/sentry)               | Triage production errors, regressions, and performance issues.                                                             | Remote MCP + Skills  | User auth required | Trust A     |
| [supabase](plugins/supabase)           | Inspect Supabase schemas, data access, Row Level Security, and auth.                                                       | MCP + Skills         | Config verified    | Trust A     |
| [figma](plugins/figma)                 | Bring Figma design context into agent workflows and support design-to-code tasks.                                          | Remote MCP + Skills  | User auth required | Trust A     |
| [cloudflare](plugins/cloudflare)       | Inspect and debug Workers, DNS, request handling, and Cloudflare configuration.                                            | Remote MCP + Skills  | User auth required | Trust A     |
| [notion](plugins/notion)               | Search, understand, and summarize Notion workspace knowledge.                                                              | Remote MCP + Skills  | User auth required | Trust A     |
| [docker](plugins/docker)               | Safe Docker and Compose inspection and troubleshooting workflows.                                                          | Skills-only          | Skills-only        | Trust A     |
| [kubernetes](plugins/kubernetes)       | Read-first Kubernetes inspection, workload diagnosis, and cluster troubleshooting.                                         | MCP + Skills         | Runtime verified   | Trust B     |
| [postgresql](plugins/postgresql)       | Safe, read-only PostgreSQL inspection, query diagnosis, and health workflows — powered by the **bundled HiAI Native MCP**. | Bundled MCP + Skills | Runtime verified   | HiAI Native |

**Trust labels**: **Trust A** = first-party / vendor-owned upstream (most
plugins); **Trust B** = established community upstream that passed explicit
review (agent-browser, kubernetes); **HiAI Native** = runtime owned and
maintained directly by HiAI (postgresql's bundled MCP).

**PostgreSQL**: the postgresql plugin is the collection's **HiAI Native**
highlight — its MCP server is bundled with the plugin and maintained by HiAI
(no third-party PostgreSQL MCP dependency). PostgreSQL **14–18 are tested**
and **19 beta compatibility is tested** (pre-release; not
production-supported). See [docs/POSTGRESQL_SUPPORT.md](docs/POSTGRESQL_SUPPORT.md).

## Why Agent Plugins

Agent Plugins is a portable, vendor-neutral standard for packaging Agent
Skills and MCP servers so they work across compatible clients. This
repository publishes HiAI's plugins in that format — one structure,
reproducible from declarative sources through Agent Plugins Builder.

Every plugin ships **safe defaults**: read/inspect-first behavior, no
credentials committed, no write-capable defaults, and no arbitrary community
MCP dependencies. See [docs/TRUST_POLICY.md](docs/TRUST_POLICY.md) and
[docs/SECURITY.md](SECURITY.md).

## For Users: Installing Plugins

Each plugin directory contains both **runtime files** (what your Agent Plugins
client loads) and **authoring sources** (used only to regenerate the plugin).
Install the runtime files only.

**Copy** (runtime):

```
plugin.json
mcp.json                  (where present — every plugin except docker and agent-browser)
skills/*/SKILL.md         (every skill directory)
README.md
LICENSE
```

**postgresql** additionally requires its bundled MCP server (referenced by
`mcp.json`):

```
packages/postgres-mcp/    (postgresql only — the bundled HiAI PostgreSQL MCP)
```

**Do NOT copy** (authoring sources / development files):

```
plugin.yml                (declarative authoring source)
skills-src/               (markdown skill sources)
docs/                     (development documentation)
```

For example, installing the PostgreSQL plugin:

```bash
# 1. copy the runtime files from plugins/postgresql into your client's plugin folder:
#    plugin.json, mcp.json, skills/, packages/postgres-mcp/, README.md, LICENSE
# 2. set DATABASE_URL for the MCP subprocess
export DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

Most MCP-based plugins need no install step — the client launches the server
from `mcp.json`. If your client validates with Agent Plugins Doctor, note that
`plugin.yml` and `skills-src/` produce an informational `DOC-5003` ("extra
files at plugin root"); they are intentionally kept in this repository as the
reproducible authoring source (see below) and should not be copied into an
installed plugin.

### Multi-client marketplace distribution

The collection ships Git marketplace manifests for the clients that support
them, plus direct-install routes for the rest. Marketplace behavior is
client-specific; see [docs/INSTALLATION.md](docs/INSTALLATION.md) for full
per-client steps and [docs/CLIENT_DISTRIBUTION_MATRIX.md](docs/CLIENT_DISTRIBUTION_MATRIX.md)
for the acceptance matrix.

- **Codex / ChatGPT** — Git marketplace at
  [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json)
  (`source: "git-subdir"` entries); register with
  `codex plugin marketplace add HiAi-gg/agent-plugins` then
  `codex plugin add <name>@hiai-agent-plugins`. Live-verified against
  `codex-cli 0.146.0` (13-plugin discovery, 5 end-to-end installs).
- **Cursor** — team marketplace manifest at
  [`.cursor-plugin/marketplace.json`](.cursor-plugin/marketplace.json)
  (relative `./plugins/<name>` sources); import via Dashboard → Plugins →
  Team Marketplaces → Import from Repo.
- **GitHub Copilot** — marketplace at
  [`.github/plugin/marketplace.json`](.github/plugin/marketplace.json)
  (relative sources); register with `copilot plugin marketplace add HiAi-gg/agent-plugins`.
- **VS Code** — **`Chat: Install Plugin From Source`** (paste
  `https://github.com/HiAi-gg/agent-plugins`) or the
  `chat.plugins.marketplaces` setting; VS Code reads the same
  `.github/plugin/marketplace.json` Copilot manifest. This is the Agent
  Plugins channel — distinct from the VS Code extension marketplace.
- **Kiro** — no Git marketplace manifest exists; use **Powers** direct
  install ("Import power from GitHub"/folder) or the curated kiro.dev/powers
  directory. See [docs/INSTALLATION.md](docs/INSTALLATION.md).

The manifests are generated (never hand-edited) from the canonical
`plugins/<name>/plugin.json` files by
[`scripts/generate-marketplaces.ts`](scripts/generate-marketplaces.ts) and
validated by [`scripts/validate-marketplaces.ts`](scripts/validate-marketplaces.ts)
in CI. Acceptance evidence, exact commands, and the honest per-client status
(VERIFIED / DOCS VERIFIED / PARTIAL) are in
[docs/MARKETPLACE_ACCEPTANCE.md](docs/MARKETPLACE_ACCEPTANCE.md) and
[docs/MULTI_CLIENT_DISTRIBUTION_REPORT.md](docs/MULTI_CLIENT_DISTRIBUTION_REPORT.md).

## For Developers: Modifying Plugins

The canonical source for every plugin is:

```
plugins/<name>/plugin.yml
plugins/<name>/skills-src/<name>/*.md
```

Edit **those** files (plus per-plugin content such as `README.md`, `LICENSE`,
`docs/`, and postgresql's `packages/postgres-mcp`), then regenerate the
structural output with Agent Plugins Builder 0.0.9:

```bash
bunx @hiai-gg/agent-plugins-builder create \
  --config plugins/<name>/plugin.yml \
  --output /tmp/plugin-regen
```

Never hand-edit generated structural files (`plugin.json`, `mcp.json`,
`skills/*/SKILL.md`) — they must remain reproducible from `plugin.yml`. See
[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the regenerate → validate →
compare workflow and [CONTRIBUTING.md](CONTRIBUTING.md) for contribution rules.

## Build & Validate

**Latest release: [v0.0.2](https://github.com/HiAi-gg/agent-plugins/releases/tag/v0.0.2).**

All 13 plugins are generated from declarative `plugin.yml` sources through
[Agent Plugins Builder 0.0.9](https://github.com/HiAi-gg/agent-plugins-builder)
and must remain reproducible from them. Every plugin also passes
[Agent Plugins Doctor 0.0.6](https://github.com/HiAi-gg/agent-plugins-doctor)
and independent validation against the official 1.0.0 schemas. See
[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the full workflow.

### CI evidence

Every pull request and push to `main` runs
[`.github/workflows/validate.yml`](.github/workflows/validate.yml):

- **Exactly 13 plugins** — additions, removals, and renames fail CI.
- **Builder reproducibility** — all 13 plugins are regenerated with Builder
  0.0.9 and `plugin.json`, `mcp.json`, and every `skills/*/SKILL.md` must be
  byte-identical to the committed files.
- **Doctor 0.0.6** — the ecosystem validator runs on all 13 plugins.
- **Secret scan** — secret-like literals are rejected across generated
  content and plugin sources.
- **Marketplace drift + validation** — the three client marketplace manifests
  must match a fresh deterministic generation (`generate-marketplaces.ts --check`)
  and pass semantic validation (13 x 3 plugins, sources, no secrets).

The weekly [`.github/workflows/release-check.yml`](.github/workflows/release-check.yml)
re-runs the same reproducibility and Doctor gates plus the bundled PostgreSQL
MCP unit tests.

## Categories

- **Developer Workflow**: GitHub, Agent Browser, Docker, Kubernetes, PostgreSQL
- **Web & Research**: Context7, Firecrawl
- **Data & Backend**: Redis, Supabase, PostgreSQL
- **Observability**: Sentry
- **Design**: Figma
- **Infrastructure**: Cloudflare
- **Productivity**: Notion

## Trust & Security

- **Trust A**: first-party/vendor-owned MCP or CLI (most plugins).
- **Trust B**: established community upstream that passed explicit review —
  currently agent-browser (`vercel-labs/agent-browser` CLI) and kubernetes
  (`containers/kubernetes-mcp-server`).
- **HiAI Native**: runtime owned and maintained directly by HiAI — currently
  PostgreSQL (bundled MCP).

All plugins default to read/inspect-first behavior; credentials are never
committed. See [docs/TRUST_POLICY.md](docs/TRUST_POLICY.md) and
[docs/COMPATIBILITY.md](docs/COMPATIBILITY.md) for the full policy and
per-plugin runtime evidence.

## PostgreSQL Support

PostgreSQL 14–18 tested; PostgreSQL 19 beta compatibility tested. See
[docs/POSTGRESQL_SUPPORT.md](docs/POSTGRESQL_SUPPORT.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). New plugins are not added without explicit approval.

## License

[MIT](LICENSE). Individual plugins and bundled dependencies retain their own upstream licenses.
