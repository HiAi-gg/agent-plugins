---
name: research-workspace
description: Search and read content in a Notion workspace to answer questions: find pages, databases, and connected sources, and extract the relevant information. Use when the user asks what is in their Notion workspace or needs information from Notion.
license: MIT
compatibility: Requires the notion MCP server configured in this plugin (https://mcp.notion.com/mcp) with OAuth completed in the client.
metadata:
  plugin: notion
  kind: research
---

# Research a Notion Workspace

Use this skill when an agent must find and read content in a Notion workspace.

## Workflow

### 1. Clarify the question

- Restate what information the user needs and from where (specific page,
  database, or anywhere in the workspace).
- Confirm the workspace is connected (OAuth completed in the client).

### 2. Search

- Use the Notion search tool with targeted queries (2–4 phrasings if the first
  is broad).
- Review results: page titles, database names, and snippets. Prefer
  authoritative pages (project docs, meeting notes, design docs) over
  duplicates.

### 3. Read the relevant content

- Open the top 1–3 pages and read their blocks: headings, paragraphs, lists,
  tables, to-dos.
- For databases, query the relevant rows/views and extract the fields that
  answer the question.

### 4. Synthesize with citations

- Answer the question from the content, citing which page/database the facts
  came from (page title + link if available).
- Distinguish: facts from content, gaps ("no page found for X"), and
  contradictions between pages if present.

### 5. Report

Give: the answer, the sources (page/database titles), and anything you could
not find. This is read-only research — do not create or modify content.

## Guardrails

- Read-only: search + read only; no content creation or updates.
- Do not dump entire long pages; extract and summarize the relevant parts.
