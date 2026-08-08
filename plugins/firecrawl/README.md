# Firecrawl Agent Plugin

Search, scrape, crawl, and extract from the web with **Firecrawl's official MCP
server**, wrapped in focused workflow skills.

An [Agent Plugin](https://agent-plugins.org/) (spec **1.0.0**).

## What is this?

A web research/extraction plugin: the official Firecrawl MCP server
(`firecrawl-mcp`) plus skills for searching the web, scraping pages, crawling
sites, and extracting structured data.

**Product distinction** (vs. the agent-browser plugin):

- `agent-browser` = interact with individual web applications/pages.
- **Firecrawl** = search/extract/crawl/research **the web** at scale.

## Why would I install it?

- **First-party upstream** — Firecrawl's own MCP server, not a wrapper.
- **Keyless tier** — `search`, `scrape`, and `interact` work without an API
  key (rate-limited); no key is bundled.
- **Read/extract focus** — search, scrape, crawl, and extract are the
  workflows; no browser-control duplication with agent-browser.

## What MCP/upstream does it use?

- **Server**: `firecrawl` — stdio, `npx -y firecrawl-mcp@3.23.4` (pinned;
  first-party [firecrawl/firecrawl-mcp-server](https://github.com/firecrawl/firecrawl-mcp-server)).
- **Skills**: `research-web`, `scrape-page`, `crawl-site`,
  `extract-structured-data`.

## Does it need authentication?

**Not for the basics.** The keyless free tier supports `scrape`, `search`, and
`interact` without a key (rate-limited). `crawl`, `extract`, `map`, and `agent`
**require an API key**. The plugin ships **no key** — users can add one at the
client level via `FIRECRAWL_API_KEY` env or OAuth when they sign up. Never
commit a key.

## Is it read-only?

**Yes — it reads/extracts web content; it does not mutate anything.** Firecrawl
interacts with pages (clicking) only in the `interact` tool; the plugin's
skills are search/scrape/crawl/extract workflows.

## What clients were actually tested?

stdio MCP transport. The pinned server was runtime-verified in this release
cycle:

```
handshake        OK (firecrawl-fastmcp 3.23.4)
tools/list       25 tools (scrape, search, crawl, extract, agent, interact, monitors, research...)
firecrawl_search OK — keyless, returned real results with URLs
```

Status: **RUNTIME_VERIFIED** (keyless search). Verify in your specific client.

## Requirements

- Node.js 18+ with `npx`.
- Network access (to Firecrawl and the npm registry).
- Optional: a Firecrawl API key at the client level for `crawl`/`extract`.

## Installation

Copy the plugin's **runtime files** (`plugin.json`, `mcp.json`, `skills/`,
`README.md`, `LICENSE`) into your Agent Plugins client's plugin folder, or use
your client's plugin install flow. Do **not** copy the authoring sources
(`plugin.yml`, `skills-src/`, `docs/`) — see the collection README for the full
boundary. No build step is required.

## Configuration

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "firecrawl": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "firecrawl-mcp@3.23.4"]
    }
  }
}
```

For a key (optional), configure `FIRECRAWL_API_KEY` at the client level — do
not add it to this file.

## Examples

1. "Research the current state of X on the web" → `research-web`.
2. "Get the content of this docs page" → `scrape-page`.
3. "Map all pages under this site path" → `crawl-site`.
4. "Extract pricing fields from these URLs" → `extract-structured-data`.

## Upstream MCP

| Server | Version | License | Source |
|---|---|---|---|
| Firecrawl MCP | `firecrawl-mcp@3.23.4` (pinned) | MIT | [firecrawl/firecrawl-mcp-server](https://github.com/firecrawl/firecrawl-mcp-server) |

## Agent Plugins version

**1.0.0 (Working Draft)** — https://agent-plugins.org/specification

## Runtime requirements

Node.js 18+, `npx`, network access.

## Security / default behavior

- No API keys in the plugin; keyless default; keys are client-level.
- Read/extract focus; no credentials passed through tool calls.
- Skills gate crawl/extract behind the key prerequisite and say so honestly.
- Cite real sources; never fabricate URLs in research.

## Known limitations

- `crawl`, `extract`, `map`, `agent` require an API key (not keyless).
- Keyless tier is rate-limited.
- Some JS-heavy pages may not fully render on scrape.

## License

MIT. See [LICENSE](LICENSE). Upstream Firecrawl MCP is MIT (Firecrawl); HiAI is
not affiliated with or endorsed by Firecrawl.

## CHANGELOG

See [CHANGELOG.md](CHANGELOG.md).
