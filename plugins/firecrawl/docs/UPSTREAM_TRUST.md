# UPSTREAM_TRUST — firecrawl

| Field | Value |
|---|---|
| Upstream project | Firecrawl MCP server |
| Upstream owner | Firecrawl |
| Repository | https://github.com/firecrawl/firecrawl-mcp-server |
| License | MIT |
| Trust level | **TRUST A — First Party** (vendor publishes the MCP server) |
| Selected version | `firecrawl-mcp@3.23.4` (pinned) |
| Why trusted | Vendor-owned project; official MCP server for the Firecrawl product; active releases; documented keyless and OAuth/auth modes |
| Maintenance evidence | Versioned npm releases (3.23.4 at pin time); active repository; official docs |
| Authentication model | Keyless free tier (scrape/search/interact) or API key/OAuth (client-level); no key in the plugin |
| Write capabilities | None that mutate user data; reads/extracts web content; `interact` clicks pages only for extraction tasks |
| Known limitations | crawl/extract/map/agent need a key; keyless tier rate-limited |
| Verification date | 2026-08-07 |

Runtime verification: `RUNTIME_VERIFIED` — handshake, tools/list, keyless
`firecrawl_search` returning real results.
