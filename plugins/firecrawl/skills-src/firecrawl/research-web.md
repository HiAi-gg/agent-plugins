---
name: research-web
description: Research a topic on the web with Firecrawl search: run searches, synthesize findings from results, and cite sources. Use when the agent needs current web information, competitive research, or to answer a question that requires up-to-date web sources.
license: MIT
compatibility: Requires the firecrawl MCP server configured in this plugin (npx firecrawl-mcp); keyless tier supports search without an API key (rate-limited).
metadata:
  plugin: firecrawl
  kind: web-research
---

# Research the Web with Firecrawl

Use this skill when an agent needs current, web-sourced information — the
Firecrawl equivalent of "look it up online", with citation discipline.

## When to use

- Questions whose answer changes over time (docs, pricing, features, releases).
- Competitive/ecosystem research across multiple sources.
- Verifying claims against the current web.
- Do **not** use for stable, self-contained knowledge the agent already has.

## Workflow

### 1. Plan the queries

- Break the research question into 2–4 concrete search queries (distinct
  phrasings, competitors, or aspects).
- Note which results you will treat as authoritative (vendor docs, official
  sources) vs secondary.

### 2. Search

```text
firecrawl_search(query, limit)
```

Run each planned query. Record URLs, titles, and descriptions for the top
results. On the keyless tier the free rate limit applies — batch queries
instead of firing one per second.

### 3. Read the important pages

For the 1–3 most authoritative results, read the page content:

```text
firecrawl_scrape(url)
```

Extract the facts relevant to the question. Prefer official/vendor sources for
facts about a product.

### 4. Synthesize with citations

Answer the question from the gathered material. Cite each claim to its source
URL. Distinguish:

- facts from official sources,
- claims from secondary sources,
- gaps ("no current source found for X").

### 5. Report

Give: the answer, the supporting sources (title + URL per claim), and anything
you could not verify. Do not fabricate citations — only cite pages you actually
searched/scraped.

## Guardrails

- Cite real sources; never invent URLs.
- Respect the keyless rate limit; batch queries.
- Do not pass API keys through tool arguments.
