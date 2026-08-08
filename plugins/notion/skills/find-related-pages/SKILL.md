---
name: find-related-pages
description: "Find pages in a Notion workspace related to a topic or page: by search, links, tags, or database relations. Use when the user needs a set of related documents, cross-references, or context around a project."
---

---
name: find-related-pages
description: Find pages in a Notion workspace related to a topic or page: by search, links, tags, or database relations. Use when the user needs a set of related documents, cross-references, or context around a project.
license: MIT
compatibility: Requires the notion MCP server configured in this plugin (https://mcp.notion.com/mcp) with OAuth completed in the client.
metadata:
  plugin: notion
  kind: discovery
---

# Find Related Pages in Notion

Use this skill when an agent must discover pages related to a topic or an
existing page.

## Workflow

### 1. Define the anchor

- Identify the topic (keywords) or the anchor page (title/link).
- State the relationship you are looking for: same project, same tag, linked
  from the page, or conceptually similar.

### 2. Search and follow links

- Run targeted searches for the topic; note page titles, databases, and
  snippets.
- If an anchor page exists, read it to collect its links and references —
  linked pages are usually the strongest "related" signal.
- If the workspace uses databases with relation properties, query the related
  rows.

### 3. Build the related set

- Compile the candidate pages, deduplicate, and rank by relevance:
  1. directly linked from the anchor,
  2. matched by search with strong title/content overlap,
  3. related via shared tags/database relations.
- Record for each: title, page id/link, and why it is related.

### 4. Report

Give: the related pages grouped by relevance (linked / searched / related), with
the reasoning per page, and any gaps (e.g. "no pages found for tag X").
This is read-only discovery — do not modify pages.

## Guardrails

- Read-only: search + read; no content changes.
- Bound the result set; do not return hundreds of marginally related pages.

