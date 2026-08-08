# Supabase Agent Plugin

Investigate Supabase-backed apps: schema, data access, RLS, and auth — via
**Supabase's official PostgREST MCP server**.

An [Agent Plugin](https://agent-plugins.org/) (spec **1.0.0**).

## What is this?

A plugin that pairs Supabase's official `@supabase/mcp-server-postgrest` with
skills for schema inspection, RLS review, auth debugging, and end-to-end
investigation of a Supabase-backed app.

## Why would I install it?

- **First-party upstream** — Supabase's own MCP server (repo `supabase/mcp`,
  Apache-2.0).
- **Workflow value, not tool listing** — the skills teach investigation order
  (schema → access → RLS → auth), not just what the tools do.
- **Project-scoped, read-first** — skills default to `GET`; writes require
  explicit intent.

## What MCP/upstream does it use?

- **Server**: `supabase` — stdio,
  `npx -y @supabase/mcp-server-postgrest@0.1.1 --apiUrl <your-project-url> --schema public`
  (pinned, first-party).
- **Skills**: `inspect-schema`, `review-rls`, `debug-auth`,
  `investigate-supabase-app`.

## Does it need authentication?

**Project configuration, not plugin secrets.** The `--apiUrl` in the config is
a placeholder (`https://your-project-ref.supabase.co/rest/v1`) that **must be
replaced with your project's URL** — this is per-project configuration, not a
credential. The optional `--apiKey` (anon key) is supplied at the client level;
never commit a key. Agent Plugins v1 has no portable secret mechanism, so
auth stays client/user managed.

## Is it read-only?

**Skills default to read-only** (`GET` requests via `postgrestRequest`). The
official server *can* do CRUD (`POST`/`PATCH`/`DELETE`); the plugin's skills
never mutate during investigation and require explicit user intent for writes.
Read-only enforcement is the project's RLS + the anon role.

## What clients were actually tested?

stdio MCP transport. The pinned server was runtime-verified in this release
cycle:

```
handshake  OK (supabase/postgrest 0.1.1)
tools/list postgrestRequest, sqlToRest
```

Status: **HANDSHAKE_VERIFIED / TOOLS_VERIFIED**. A real project call requires
a Supabase project URL (client-configurable); the placeholder URL is not
callable. Verify against your project in your client.

## Requirements

- Node.js 18+ with `npx`.
- A Supabase project (or any PostgREST server) URL.
- Network access to the project and the npm registry.

## Installation

Copy the plugin directory into your Agent Plugins client's plugin folder, or use
your client's plugin install flow. No build step is required.

## Configuration

Replace the placeholder project URL with your own:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-postgrest@0.1.1",
        "--apiUrl",
        "https://your-project-ref.supabase.co/rest/v1",
        "--schema",
        "public"
      ]
    }
  }
}
```

- `--apiUrl`: your project's PostgREST endpoint (required, project-specific).
- `--apiKey`: optional; supply at the client level, never commit it.
- `--schema`: the schema to serve (default `public`).

## Examples

1. "Show me the schema of my Supabase project" → `inspect-schema`.
2. "Audit whether our tables are RLS-protected" → `review-rls`.
3. "Users can't sign in — help debug" → `debug-auth`.
4. "Why is this feature returning no data?" → `investigate-supabase-app`.

## Upstream MCP

| Server | Version | License | Source |
|---|---|---|---|
| Supabase PostgREST MCP | `@supabase/mcp-server-postgrest@0.1.1` (pinned) | Apache-2.0 | [supabase/mcp](https://github.com/supabase/mcp) |

## Agent Plugins version

**1.0.0 (Working Draft)** — https://agent-plugins.org/specification

## Runtime requirements

Node.js 18+, `npx`, network access, a Supabase/PostgREST project URL.

## Security / default behavior

- Read-first skills; no data mutation during investigation.
- No API keys in the plugin; keys are client-level.
- Placeholder `--apiUrl` must be replaced by the user (per-project config).
- Do not print tokens, keys, or sensitive row data.

## Known limitations

- The `--apiUrl` is project-specific and cannot be shipped pre-configured.
- RLS review needs SQL access (dashboard/SQL editor) for `pg_policies` — the
  MCP alone cannot read them.
- Writes require explicit user intent; the server itself is not read-only.

## License

MIT. See [LICENSE](LICENSE). Upstream `@supabase/mcp-server-postgrest` is
Apache-2.0 (Supabase); HiAI is not affiliated with or endorsed by Supabase.

## CHANGELOG

See [CHANGELOG.md](CHANGELOG.md).
