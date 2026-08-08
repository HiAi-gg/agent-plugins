---
name: extract-structured-data
description: Extract structured data from web pages or a set of pages with Firecrawl. Use when the agent needs fields, tables, or structured records from web content (pricing, listings, specs) rather than free text.
license: MIT
compatibility: Requires the firecrawl MCP server configured in this plugin (npx firecrawl-mcp). NOTE: extract requires an API key (not available on the keyless free tier).
metadata:
  plugin: firecrawl
  kind: structured-extraction
---

# Extract Structured Data with Firecrawl

Use this skill when an agent must pull structured fields from web content.

## Prerequisite

Extract (`firecrawl_extract`) requires a Firecrawl API key — it is **not** on
the keyless free tier. If no key is configured at the client level, say so and
fall back to scraping + manual extraction instead. Never ask the user to paste
a key into the conversation.

## Workflow

### 1. Define the schema

- State the exact fields you want (names, types, examples).
- Keep the schema narrow: only fields you actually need.
- Define the source: a single URL or a set of URLs to extract from.

### 2. Extract

```text
firecrawl_extract(urls, schema)
```

### 3. Validate the records

- Check each record against the expected schema (missing fields, wrong types,
  empty values).
- If a field is missing, decide: is it genuinely absent on the page, or did the
  extraction miss it? Re-scrape the specific page if needed.

### 4. Report

Give: the extracted records (bounded; summarize if large), validation notes
(which fields are missing/unreliable), and the source URLs per record. Do not
fabricate values — mark unknowns as unknown.

## Guardrails

- Extract only from authorized URLs.
- Never pass credentials through extract calls.
- Do not invent field values to "complete" a record.
