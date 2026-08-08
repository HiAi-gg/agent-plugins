---
name: scrape-page
description: Scrape a web page into clean, agent-readable content with Firecrawl. Use when the agent needs the full content of a specific page (docs, articles, reference pages) for reading, extraction, or summarization.
license: MIT
compatibility: Requires the firecrawl MCP server configured in this plugin (npx firecrawl-mcp); keyless tier supports scrape without an API key (rate-limited).
metadata:
  plugin: firecrawl
  kind: page-scraping
---

# Scrape a Page with Firecrawl

Use this skill when an agent needs the clean content of a specific URL.

## Workflow

### 1. Confirm the target

- Get the exact URL from the user or from a search result.
- State what you expect to extract (full text, specific section, structured
  fields) so you can verify the output.

### 2. Scrape

```text
firecrawl_scrape(url)
```

The result is normalized, agent-readable content (markdown by default).

### 3. Verify the extraction

- Check the content actually covers the target page (correct page, no captcha
  wall, no empty body).
- If the page is interactive-heavy (JS-rendered SPA), note that the scrape may
  miss content; prefer a static URL or use browser interaction tools where
  available.
- If you need only part of the page, extract that part rather than dumping the
  whole body into the response.

### 4. Report

Give: the source URL, a summary of the content (or the requested excerpt), and
any caveats (paywall, partial render, robots-limited). Do not include the full
page text unless the user asked for it.

## Guardrails

- Scrape only URLs the user provided or that came from the user's task.
- Respect site terms and robots directives; do not bypass paywalls or access
  controls.
- Never pass credentials through the scrape call.
