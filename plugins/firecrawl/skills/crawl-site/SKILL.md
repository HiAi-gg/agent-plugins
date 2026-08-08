---
name: crawl-site
description: Crawl a website's pages with Firecrawl to inventory content, find broken links, or gather a corpus. Use when the agent needs to understand a site's structure, find all pages under a path, or collect a set of pages for analysis.
---

# Crawl a Site with Firecrawl

Use this skill when an agent must enumerate or collect pages from a website.

## Prerequisite

Crawl (`firecrawl_crawl`) requires a Firecrawl API key — it is **not** on the
keyless free tier (only scrape, search, interact are). If no key is configured
at the client level, say so and fall back to `firecrawl_map` (site map) or
targeted scraping instead. Never ask the user to paste a key into the
conversation.

## Workflow

### 1. Scope the crawl

- Confirm the starting URL and the crawl scope (max pages, path filter,
  subdomains).
- State the purpose (inventory, corpus, link check) so you know what to do
  with the results.

### 2. Start and monitor

```text
firecrawl_crawl(url, ...)
```

For longer crawls, poll the crawl status and collect completed pages.

### 3. Analyze the results

- Inventory: list the crawled URLs grouped by section.
- Link check: flag URLs that returned errors (404, timeout, redirect loops).
- Corpus: collect page content into a digest for the user's analysis.

### 4. Report

Give: the crawl scope, page count, the grouped URL inventory (or corpus
summary), and any failures found. Keep raw listings bounded — summarize rather
than dumping hundreds of URLs.

## Guardrails

- Crawl only sites the user authorized.
- Respect robots and rate limits; do not crawl aggressively.
- Never pass credentials through crawl calls.

