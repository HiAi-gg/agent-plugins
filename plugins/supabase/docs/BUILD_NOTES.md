# BUILD_NOTES — supabase

## Product rationale

Supabase-backed app debugging (schema, data access, RLS, auth) is a common
agent task. Supabase publishes an official PostgREST MCP server; this plugin
pairs it with investigation-order skills rather than re-listing the tools.

## Architecture

```
@supabase/mcp-server-postgrest@0.1.1 (stdio, pinned, first-party)
+ 4 Agent Skills (inspect-schema, review-rls, debug-auth, investigate-supabase-app)
```

## Upstream

- supabase/mcp (Apache-2.0). See docs/UPSTREAM_TRUST.md.

## Alternatives rejected

- `supabase-mcp` (npm, Cappahccino/SB-MCP) — **personal project** (Trust C),
  requires API keys, not vendor-owned. Rejected per the upstream trust policy.
- Building a custom PostgREST client — unnecessary; the official MCP exists.

## Skill decisions

- `inspect-schema` — schema/table/column inspection via PostgREST.
- `review-rls` — RLS audit (needs SQL access for pg_policies; documented).
- `debug-auth` — auth/session/403 diagnosis from the client perspective.
- `investigate-supabase-app` — end-to-end feature investigation tying schema +
  access + RLS + auth together.
- All read-first; writes gated on explicit intent.

## Runtime testing

```
handshake  OK (supabase/postgrest 0.1.1)
tools/list postgrestRequest, sqlToRest
```

Status: `HANDSHAKE_VERIFIED`, `TOOLS_VERIFIED`. A live project call requires
the user's project URL (client-configured); not exercisable with the
placeholder URL in this environment.

## Limitations

- `--apiUrl` is project-specific; must be client-configured.
- RLS review needs SQL access for policy metadata.
- Server can write; plugin skills are read-first.
