---
name: investigate-supabase-app
description: Investigate a Supabase-backed app end to end: schema, data access, RLS, and auth working together. Use when a feature is broken, data is missing, or the app behaves unexpectedly and the cause may be in the Supabase backend.
license: MIT
compatibility: Requires the supabase MCP server configured in this plugin (npx @supabase/mcp-server-postgrest) with a project --apiUrl (client-configured).
metadata:
  plugin: supabase
  kind: investigation
---

# Investigate a Supabase-Backed App

Use this skill when an agent must root-cause a problem that may live in the
Supabase backend (schema, data, RLS, or auth).

## Workflow

### 1. Understand the feature

- Get the failing behavior and the data flow: which table(s) the feature reads
  or writes, and as which role (anon vs authenticated).
- Restate the expected behavior vs observed.

### 2. Inspect the schema

- List the relevant tables and their columns/types (`inspect-schema`).
- Confirm the table exists and has the columns the feature expects — schema
  drift (column renamed, table missing) is a common cause.

### 3. Test the data access

- Replay the feature's request via `postgrestRequest`:
  - `GET` with no key (anon) → what RLS allows anonymously.
  - `GET` with the user's token at the client level → authenticated view.
- Compare: empty-but-expected rows → RLS (see `review-rls`); 401/403 → auth
  (see `debug-auth`); wrong data → check the query path/filters.

### 4. Correlate

- If the feature writes: confirm the write would pass `with check` under the
  user's role (do not actually write during investigation).
- Check recent schema/policy changes if the user mentions a regression.

### 5. Report

Give: the data flow, the evidence at each layer (schema, anon vs authenticated
access, RLS/auth findings), the root cause, and the narrowest fix. Separate
observed facts from recommendations. Do not mutate data during the
investigation.

## Guardrails

- Read-only (`GET`); never `POST`/`PATCH`/`DELETE` during investigation.
- Do not print tokens, keys, or sensitive row data.
