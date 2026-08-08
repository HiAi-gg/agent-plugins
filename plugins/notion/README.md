# Notion Agent Plugin

Research and summarize a Notion workspace: find pages, gather context, and
prepare project updates — via **Notion's official hosted MCP server**.

An [Agent Plugin](https://agent-plugins.org/) (spec **1.0.0**).

## What is this?

A plugin that connects agents to Notion's official remote MCP server
(`https://mcp.notion.com/mcp`) and adds four read-first skills: workspace
research, related-page discovery, project summarization, and update
preparation.

## Why would I install it?

- **First-party upstream** — Notion's hosted, actively maintained MCP server.
- **Read-first by default** — research/summarize are read workflows; content
  updates require explicit confirmation.
- **No credentials in the plugin** — OAuth is host-managed.

## What MCP/upstream does it use?

- **Server**: `notion` — `streamable-http` to `https://mcp.notion.com/mcp`
  (Notion-hosted, vendor-operated; endpoint version not pinnable).
- **Skills**: `research-workspace`, `find-related-pages`, `summarize-project`,
  `prepare-project-update`.

### Which Notion MCP route (and why)

Notion's **current first-party recommendation is the hosted remote server**
(`https://mcp.notion.com/mcp`). The older open-source
`notion-mcp-server` package is **no longer actively maintained**, so it is not
used here.

## Does it need authentication?

**Yes.** The endpoint requires OAuth via the MCP host's flow. Agent Plugins v1
has no portable credential mechanism, so **no tokens are in the plugin** — the
host manages authentication. (PAT auth is possible for clients that support
custom headers, but it is not a portable plugin secret mechanism and is not
bundled.)

## Is it read-only?

**The skills default to reading/research.** The Notion MCP server itself *can*
create and update content — this plugin's skills do not. The only write-path
skill (`prepare-project-update`) drafts content and requires explicit user
confirmation before any Notion write.

## What clients were actually tested?

Remote OAuth MCP (`streamable-http`) requires an interactive OAuth grant not
available in the build environment.

```
CONFIG_VALIDATED
AUTH_RUNTIME_REQUIRES_USER
```

The config matches the Agent Plugins 1.0.0 `streamable-http` schema and
Notion's documented endpoint (`https://mcp.notion.com/mcp` returned 401
without auth — the endpoint exists). OAuth runtime testing requires a real
user.

## Requirements

- An MCP client that supports `streamable-http` **and** OAuth.
- Network access to `https://mcp.notion.com/mcp`.
- A Notion workspace with the MCP connection authorized.

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
    "notion": {
      "type": "streamable-http",
      "url": "https://mcp.notion.com/mcp"
    }
  }
}
```

Do **not** add tokens to `headers` — use the OAuth flow.

## Examples

1. "What's in my workspace about Q3 planning?" → `research-workspace`.
2. "Find pages related to the onboarding project" → `find-related-pages`.
3. "Summarize the current state of Project Atlas" → `summarize-project`.
4. "Draft a status update for the project page" → `prepare-project-update`.

## Upstream MCP

| Server | Version | License | Source |
|---|---|---|---|
| Notion MCP (hosted) | vendor-operated endpoint | Notion's terms | [developers.notion.com/guides/mcp](https://developers.notion.com/guides/mcp/overview) |

## Agent Plugins version

**1.0.0 (Working Draft)** — https://agent-plugins.org/specification

## Runtime requirements

An MCP client with streamable-http + OAuth support; network access to
`mcp.notion.com`.

## Security / default behavior

- Read-first skills; content writes only on explicit user confirmation.
- No tokens in the plugin; OAuth is host-managed.
- Admin controls: workspace owners manage MCP client access in Notion.

## Known limitations

- Requires interactive OAuth in the client (a real user).
- Content-creation tools exist on the server; the plugin's skills gate writes.
- Notion's hosted MCP requires clients that support remote servers.

## License

MIT. See [LICENSE](LICENSE). Notion MCP usage is subject to Notion's terms;
HiAI is not affiliated with or endorsed by Notion.

## CHANGELOG

See [CHANGELOG.md](CHANGELOG.md).
