# Agent Plugins

A curated collection of portable [Agent Plugins](https://agent-plugins.org/) with trusted MCP and CLI integrations, focused Agent Skills, safe defaults, and reproducible builds.

[![Agent Plugins](https://img.shields.io/badge/Agent%20Plugins-1.0.0-blue)](https://agent-plugins.org/)
[![Builder](https://img.shields.io/badge/Builder-0.0.9-purple)](https://github.com/HiAi-gg/agent-plugins-builder)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Plugins](https://img.shields.io/badge/Plugins-13-green)](#plugins)

## Plugins

| Plugin | What it does | Architecture | Runtime |
|---|---|---|---|
| [github](plugins/github) | GitHub repository investigation, pull-request review, issue triage and CI workflows. | Remote MCP + Skills | User auth required |
| [agent-browser](plugins/agent-browser) | Agent-native browser navigation, inspection, interaction and web-flow testing. | CLI + Skills | Runtime verified |
| [context7](plugins/context7) | Fetch current library and framework documentation when coding agents need up-to-date API knowledge. | MCP + Skills | Runtime verified |
| [firecrawl](plugins/firecrawl) | Web search, scraping, crawling, extraction and research workflows. | MCP + Skills | Runtime verified |
| [redis](plugins/redis) | Inspect and diagnose Redis data, streams, state and memory behavior. | MCP + Skills | Runtime verified |
| [sentry](plugins/sentry) | Investigate production errors, regressions, events and performance issues. | Remote MCP + Skills | User auth required |
| [supabase](plugins/supabase) | Inspect Supabase projects, schemas, authentication and Row Level Security. | MCP + Skills | Config verified |
| [figma](plugins/figma) | Bring design context into agent workflows and support design-to-code tasks. | Remote MCP + Skills | User auth required |
| [cloudflare](plugins/cloudflare) | Inspect and diagnose Workers, deployments, requests, DNS and Cloudflare configuration. | Remote MCP + Skills | User auth required |
| [notion](plugins/notion) | Search, understand and summarize workspace knowledge and project information. | Remote MCP + Skills | User auth required |
| [docker](plugins/docker) | Safe Docker and Docker Compose inspection and troubleshooting workflows. | Skills-only | Skills-only |
| [kubernetes](plugins/kubernetes) | Read-first Kubernetes inspection, workload diagnosis and cluster troubleshooting. | MCP + Skills | Runtime verified |
| [postgresql](plugins/postgresql) | Read-only PostgreSQL inspection, query diagnosis, performance analysis and database health workflows powered by the bundled HiAI PostgreSQL MCP. | Bundled MCP + Skills | Runtime verified |

## Why Agent Plugins

Agent Plugins is a portable, vendor-neutral standard for packaging Agent Skills and MCP servers so they work across compatible clients. This repository publishes HiAI's plugins in that format — one structure, reproducible from declarative sources.

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

## For Developers: Modifying Plugins

The canonical source for every plugin is:

```
plugins/<name>/plugin.yml
plugins/<name>/skills-src/<name>/*.md
```

Edit **those** files (plus per-plugin content such as `README.md`, `LICENSE`,
`docs/`, and postgresql's `packages/postgres-mcp`), then regenerate the
structural output with Agent Plugins Builder:

```bash
bunx @hiai-gg/agent-plugins-builder create \
  --config plugins/<name>/plugin.yml \
  --output /tmp/plugin-regen
```

Never hand-edit generated structural files (`plugin.json`, `mcp.json`,
`skills/*/SKILL.md`) — they must remain reproducible from `plugin.yml`. See
[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the regenerate → validate →
compare workflow and [CONTRIBUTING.md](CONTRIBUTING.md) for contribution rules.

## Categories

- **Developer Workflow**: GitHub, Agent Browser, Docker, Kubernetes, PostgreSQL
- **Web & Research**: Context7, Firecrawl
- **Data & Backend**: Redis, Supabase, PostgreSQL
- **Observability**: Sentry
- **Design**: Figma
- **Infrastructure**: Cloudflare
- **Productivity**: Notion

## Agent Plugin Tooling

| Tool | Purpose | Repository |
|---|---|---|
| [Agent Plugins Builder](https://github.com/HiAi-gg/agent-plugins-builder) | Create, migrate and package Agent Plugins. | `HiAi-gg/agent-plugins-builder` |
| [Agent Plugins Doctor](https://github.com/HiAi-gg/agent-plugins-doctor) | Validate, diagnose and safely fix Agent Plugins. | `HiAi-gg/agent-plugins-doctor` |

Builder and Doctor are independent projects. They are linked here as tooling, not copied into this repository.

## Trust & Security

- **Trust A**: first-party/vendor-owned MCP or CLI (most plugins).
- **Trust B**: established community upstream that passed explicit review — currently Kubernetes (`containers/kubernetes-mcp-server`).
- **HiAI Native**: runtime owned and maintained directly by HiAI — currently PostgreSQL (bundled MCP).

See [docs/TRUST_POLICY.md](docs/TRUST_POLICY.md). All plugins default to read/inspect-first behavior; credentials are never committed.

## Compatibility

See [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md) for per-plugin runtime evidence.

## PostgreSQL Support

PostgreSQL 14–18 tested; PostgreSQL 19 beta compatibility tested. See [docs/POSTGRESQL_SUPPORT.md](docs/POSTGRESQL_SUPPORT.md).

## Build & Validate

All 13 plugins are generated from declarative `plugin.yml` sources through [Agent Plugins Builder 0.0.9](https://github.com/HiAi-gg/agent-plugins-builder) and must remain reproducible from them. See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the regenerate → validate → compare workflow.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). New plugins are not added without explicit approval.

## License

[MIT](LICENSE). Individual plugins and bundled dependencies retain their own upstream licenses.
