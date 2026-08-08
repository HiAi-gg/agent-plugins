# BUILD_NOTES — firecrawl

## Product rationale

Web research/extraction is a distinct capability from browser interaction.
Firecrawl provides a first-party MCP server with search, scrape, crawl,
extract, and structured-data workflows. This plugin packages it with skills
that add research discipline (citation, keyless/key prerequisites, guardrails)
rather than re-documenting the tool list.

## Architecture

```
firecrawl-mcp@3.23.4 (stdio, pinned, first-party)
+ 4 Agent Skills (research-web, scrape-page, crawl-site, extract-structured-data)
```

## Product distinction

- agent-browser = interact with individual web applications/pages.
- Firecrawl = search/extract/crawl/research the web at scale.
The skills deliberately avoid browser-control workflows (no click/fill skills
here) to keep the two products distinct.

## Upstream

- firecrawl/firecrawl-mcp-server (MIT). See docs/UPSTREAM_TRUST.md.

## Alternatives rejected

- Agent-browser for web research — different scope (single-page interaction vs
  web-scale search/extract).
- Generic scraping MCP servers — not first-party; lower reliability.

## Skill decisions

- `research-web` — search + synthesize + cite.
- `scrape-page` — clean page content for reading/extraction.
- `crawl-site` — site inventory/link-check/corpus (notes key prerequisite).
- `extract-structured-data` — schema-driven structured extraction (notes key
  prerequisite).
- Each skill documents the keyless/key boundary honestly (crawl/extract need a
  key; scrape/search/interact are keyless).

## Runtime testing

```
handshake        OK (firecrawl-fastmcp 3.23.4)
tools/list       25 tools
firecrawl_search OK (keyless) — real results with URLs for "model context protocol"
```

Status: **RUNTIME_VERIFIED** (keyless search path).

## Limitations

- crawl/extract/map/agent require an API key (client-level).
- Keyless tier rate-limited.
- JS-heavy pages may not fully render on scrape.
