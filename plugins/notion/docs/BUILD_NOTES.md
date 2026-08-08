# BUILD_NOTES — notion

## Product rationale

Notion is a primary knowledge/workspace store for many teams. Reading,
researching, and summarizing that content (and preparing updates) is a natural
agent workflow. Notion operates an official hosted MCP server; this plugin
pairs it with read-first skills.

## Architecture

```
Notion hosted MCP (streamable-http https://mcp.notion.com/mcp, vendor-operated)
+ 4 Agent Skills (research-workspace, find-related-pages, summarize-project, prepare-project-update)
```

## Upstream decision

Notion's current first-party recommendation is the **hosted remote server**
(`https://mcp.notion.com/mcp`): actively maintained, supports OAuth, no
infrastructure setup. The older open-source `notion-mcp-server` is **no longer
actively maintained** — rejected per the mission ("Do not retain an older
official mechanism merely because it is easier").

## Alternatives rejected

- `makenotion/notion-mcp-server` (open source) — deprecated/no longer
  actively maintained; not used.
- `mcp-remote` bridge — only for clients without remote-MCP support; not a
  first-party mechanism.

## Skill decisions

- `research-workspace` — search + read + cite.
- `find-related-pages` — discovery via links/search/relations.
- `summarize-project` — project state from pages + databases.
- `prepare-project-update` — draft-first; writes only on explicit
  confirmation.
- All read-first; the only write-capable skill requires explicit confirmation.

## Runtime testing

- Endpoint `https://mcp.notion.com/mcp` returned 401 without auth (exists).
- OAuth requires a real user. Status: `CONFIG_VALIDATED`,
  `AUTH_RUNTIME_REQUIRES_USER`.

## Limitations

- Requires OAuth in the client (real user).
- Content-creation tools exist on the server; skills gate writes.
- Remote-MCP-capable client required.
