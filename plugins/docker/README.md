# Docker Agent Plugin

Inspect, diagnose, and review local Docker environments and Dockerfiles:
containers, Compose projects, and best practices.

An [Agent Plugin](https://agent-plugins.org/) (spec **1.0.0**).

## What is this?

A **skills-only** plugin that teaches agents to work with the `docker` and
`docker compose` CLIs and review Dockerfiles — which commands to run, in what
order, and what the output means. No MCP server, no external dependencies.

## Why would I install it?

- Lightweight and dependency-free (agents already have `docker` CLI access).
- Read/inspect before mutation; destructive operations are never automatic.
- Dockerfile review adds a distinct, valuable workflow.

## What MCP/upstream does it use?

**None — deliberately skills-only.** Docker's official MCP (`docker/hub-mcp`)
targets Docker Hub, not local daemons; Docker MCP Gateway manages MCP server
lifecycles, not local container diagnostics. A separate future
`docker-hub` plugin may use the Hub MCP — it is a different product and is
**not** combined here.

## Does it need authentication?

**No.** Docker's own auth (`~/.docker/config.json` for registries) is used by
the CLI; this plugin never reads or stores it.

## Is it read-only?

**Skills default to read-only.** All skills prefer `docker ps`, `inspect`,
`logs`, `compose config`, `compose ps` before any mutation. Destructive
operations (`rm`, `prune`, `down -v`, `system prune`, `volume delete`) are
gated behind explicit user intent and never run automatically.

## What clients were actually tested?

Any client that gives the agent shell access to `docker`/`docker compose`.
The skills are CLI-command workflows; verify in your client that the agent can
run shell commands.

## Requirements

- Docker CLI + daemon (`docker`), and the compose plugin for
  `diagnose-compose`.
- Shell access for the agent.

## Installation

Copy the plugin directory into your Agent Plugins client's plugin folder, or use
your client's plugin install flow. No build step is required, and no external
packages are fetched.

## Examples

1. "What's running in Docker on this machine?" → `inspect-docker-environment`.
2. "My `api` container keeps restarting — why?" → `diagnose-container`.
3. "Explain what this compose file does and how the services connect" →
   `diagnose-compose`.
4. "Review this Dockerfile before we ship it" → `review-dockerfile`.

## Upstream dependencies

None (skills only). The skills reference the standard `docker` and
`docker compose` command-line interfaces.

## Agent Plugins version

**1.0.0 (Working Draft)** — https://agent-plugins.org/specification

## Runtime requirements

Docker CLI + daemon; compose plugin for compose workflows.

## Security / default behavior

- All skills default to read-only commands.
- Destructive operations are explicitly gated behind user authorization.
- Agents should not dump full container `inspect` JSON into responses; the
  skills favor `--format` projections.
- No credentials are stored in the plugin.

## Known limitations

- Requires the agent to have shell access to the docker CLI.
- Does not manage Docker Hub (separate product, future `docker-hub` plugin).

## License

MIT. See [LICENSE](LICENSE).

## CHANGELOG

See [CHANGELOG.md](CHANGELOG.md).
