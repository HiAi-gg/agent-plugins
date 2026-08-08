---
name: review-rls
description: "Review Row Level Security posture for a Supabase project: which tables have RLS enabled, which policies exist, and whether anon/authenticated access is over-permissive. Use when auditing a Supabase app's access control or before exposing a table via the API."
---

# Review Row Level Security (RLS)

Use this skill when an agent must assess whether a Supabase project's data is
properly protected by RLS.

## Workflow

### 1. Establish the model

- Confirm which tables are exposed via PostgREST.
- Determine each table's RLS state: **RLS enabled** vs **disabled**. A table
  with RLS disabled is publicly readable/writable through the API subject to
  the anon role.

### 2. Gather RLS evidence

With SQL access (Supabase SQL editor or a client-side SQL tool):

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

If no SQL tool is available, state the limitation — the MCP server alone cannot
read `pg_policies`.

### 3. Assess each table

For each table:

- RLS disabled → **flag**: any anon/authenticated request can read/write all
  rows.
- RLS enabled, no policies → **flag**: no rows are accessible (locked down).
- RLS enabled with policies → evaluate the `qual` (SELECT/UPDATE/DELETE) and
  `with_check` (INSERT) expressions: do they reference `auth.uid()` or similar
  user scoping? Are any policies `USING (true)` / `WITH CHECK (true)` (open to
  everyone)?

### 4. Report

Give: a table-by-table RLS status, flagged issues (RLS disabled, open
policies, missing policies), and concrete recommendations (enable RLS, add
scoped policies, avoid `true` policies). This is a review — changing policies
requires explicit user action in the Supabase console.

## Guardrails

- Read-only review; do not create/drop/alter policies.
- Do not output real row data.

