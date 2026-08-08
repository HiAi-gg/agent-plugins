---
name: inspect-schema
description: "Inspect a Supabase/PostgREST schema through the official Supabase MCP: list tables, view columns and types, and understand the data model. Use when asked about the structure of a Supabase project's database."
---

---
name: inspect-schema
description: Inspect a Supabase/PostgREST schema through the official Supabase MCP: list tables, view columns and types, and understand the data model. Use when asked about the structure of a Supabase project's database.
license: MIT
compatibility: Requires the supabase MCP server configured in this plugin (npx @supabase/mcp-server-postgrest) with a project --apiUrl (client-configured).
metadata:
  plugin: supabase
  kind: schema-inspection
---

# Inspect a Supabase Schema

Use this skill when an agent needs to understand the structure of a Supabase
project's Postgres database through PostgREST.

## Workflow

### 1. Confirm the target project

- The MCP server is bound to one project via its `--apiUrl` (client-configured;
  not in the plugin). State which project/URL you are inspecting if known.
- Confirm access: an unauthenticated request (no key) uses the anon role + RLS;
  a key at the client level grants more. Say which mode you are operating in.

### 2. List tables

Use `postgrestRequest` with `GET` to the tables/views resource:

```text
method: GET
path:   /tables?select=table_name,table_schema
```

(Adjust to the project's `tables`-style view if exposed; otherwise list via the
REST root `GET /`.)

### 3. Describe a table

```text
method: GET
path:   /<table>?select=*&limit=1
```

Fetch one row to see column names and value shapes, and note the primary key
and key columns.

### 4. Report

Give: the table list, per-table column/type summaries, and any notes about
which tables are RLS-protected or missing from the REST API. Keep results
bounded; do not dump full row contents into responses.

## Guardrails

- Read-only (`GET` requests). Never `POST`/`PATCH`/`DELETE` via PostgREST
  unless the user explicitly asks to modify data.
- Do not print row contents that look sensitive.

