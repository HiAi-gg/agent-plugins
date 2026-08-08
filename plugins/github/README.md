# GitHub Agent Plugin

Inspect and work with GitHub: pull requests, issues, CI, and repositories — via
**GitHub's official MCP server** (GitHub Copilot-hosted), wrapped in focused
workflow skills.

An [Agent Plugin](https://agent-plugins.org/) (spec **1.0.0**).

## What is this?

A plugin that gives an agent a disciplined way to review PRs, triage issues,
investigate Actions failures, and explore repositories — using GitHub's own
first-party MCP endpoint, plus skills that teach *when* and *how* to combine
the tools.

## Why would I install it?

- **First-party upstream** — GitHub's official MCP server; no third-party API
  wrapper.
- **Read/inspect by default** — reviewing, triaging, and investigating are
  structured workflows, not ad-hoc tool calls.
- **No credentials in the plugin** — authentication is the MCP host's job
  (OAuth via your client).

## What MCP/upstream does it use?

- **Server**: `github` — `streamable-http` to
  `https://api.githubcopilot.com/mcp/` (GitHub Copilot-hosted, vendor-operated;
  endpoint version not pinnable).
- **Skills**: `review-pull-request`, `triage-issue`, `investigate-ci`,
  `explore-repository`.

## Does it need authentication?

**Yes.** The endpoint requires GitHub OAuth. Agent Plugins v1 has no portable
credential mechanism, so auth is **client/host-managed** (your MCP client's
OAuth flow). The plugin package contains **no PAT, no Authorization header, and
no tokens**.

## Is it read-only?

**Default posture: read-only.** The four skills use inspect/read operations and
only perform writes (commenting, labeling, merging, rerunning workflows) when
the user explicitly asks.

## What clients were actually tested?

Remote OAuth MCP (`streamable-http`) requires an interactive OAuth grant and
could not be exercised in this build environment.

```
CONFIG_VALIDATED
AUTH_RUNTIME_NOT_VERIFIED
```

The config matches the Agent Plugins 1.0.0 `streamable-http` schema and
GitHub's documented endpoint. Do not claim full runtime verification — test
OAuth in your client before relying on it.

## Requirements

- An MCP client that supports `streamable-http` **and** OAuth for remote
  servers (e.g. VS Code, Cursor, Copilot, ChatGPT/Codex per their docs).
- Network access to `https://api.githubcopilot.com/mcp/`.

## Installation

Copy the plugin's **runtime files** (`plugin.json`, `mcp.json`, `skills/`,
`README.md`, `LICENSE`) into your Agent Plugins client's plugin folder, or use
your client's plugin install flow. Do **not** copy the authoring sources
(`plugin.yml`, `skills-src/`, `docs/`) — see the collection README for the full
boundary. No build step is required. Complete the OAuth grant in your client on
first connect.

## Configuration

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "github": {
      "type": "streamable-http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

Do **not** add a PAT or Authorization header — headers are package data, not a
secret mechanism, and GitHub's endpoint uses OAuth.

## Examples

1. "Review PR #42 in acme/widgets" → `review-pull-request`.
2. "Triage the open issues in this repo" → `triage-issue`.
3. "Why did CI fail on main?" → `investigate-ci`.
4. "Give me a quick health review of acme/widgets" → `explore-repository`.

## Upstream MCP

| Server | Version | License | Source |
|---|---|---|---|
| GitHub Copilot MCP (remote) | vendor-operated endpoint | — | [github/github-mcp-server](https://github.com/github/github-mcp-server) |

## Agent Plugins version

**1.0.0 (Working Draft)** — https://agent-plugins.org/specification

## Runtime requirements

An MCP client with streamable-http + OAuth support; network access to the
endpoint.

## Security / default behavior

- Read-only default; writes only on explicit user intent.
- No credentials stored or committed.
- OAuth scopes are granted by the user in their client.

## Known limitations

- Requires interactive OAuth in the client; not usable in fully headless mode
  without a token flow.
- The GitHub Copilot-hosted endpoint's tool set is controlled by GitHub — tool
  availability may change.
- Agent Plugins 1.0.0 has no portable credential references; authenticated use
  is always client-managed.

## License

MIT. See [LICENSE](LICENSE). The upstream GitHub MCP server is a separate
project; HiAI is not affiliated with or endorsed by GitHub.

## CHANGELOG

See [CHANGELOG.md](CHANGELOG.md).
