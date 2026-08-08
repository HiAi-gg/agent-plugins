# Architecture

## Overview

`agent-plugin-postgresql` is a read-only PostgreSQL inspection plugin. The
MCP server is **bundled** with the plugin (it is an implementation detail of
this repository, not a separate product).

```
agent-plugin-postgresql
│
├── plugin.yml                 # declarative Builder source
├── plugin.json                # Agent Plugins manifest (0.0.2)
├── mcp.json                   # launches the bundled MCP via ${PLUGIN_ROOT}
│
├── skills/                    # 5 Agent Skills
│   ├── inspect-database/
│   ├── diagnose-query/
│   ├── diagnose-performance/
│   ├── diagnose-locks/
│   └── review-database-health/
│
├── packages/
│   └── postgres-mcp/          # the HiAI PostgreSQL MCP (stdio)
│       ├── src/
│       │   ├── index.ts       # server + 13 tools
│       │   ├── connection.ts  # Bun.SQL pool, read-only conninfo, redaction
│       │   └── query-safety.ts# single-statement + keyword/function checks
│       └── tests/             # unit tests, security gate, matrix suite
│
├── docs/
├── README.md
├── CHANGELOG.md
└── LICENSE
```

## Data flow

```
MCP client
   │  (stdio, JSON-RPC 2.0)
   ▼
packages/postgres-mcp/src/index.ts   (McpServer, 13 tools)
   │  Bun.SQL (db.unsafe(...).execute())
   ▼
PostgreSQL
   (session forced read-only via connection options)
```

## Connection model

- `DATABASE_URL` from the environment (client-level; never committed).
- `connection.ts#buildSafeUrl` appends PostgreSQL connection options so that
  **every pooled connection** is created with:
  - `default_transaction_read_only=on` (primary read-only enforcement),
  - `statement_timeout`,
  - `lock_timeout`,
  - `idle_in_transaction_session_timeout`,
  - `application_name=hiai-agent-plugin-postgresql`.
- `applySessionSafety` additionally runs `set_config` on the active
  connection (defense in depth).

## Tool design

Every tool returns a stable structured shape:

```json
{ "summary": "...", "data": {}, "warnings": [], "truncated": false }
```

Errors return the same shape with `error` (scrubbed) and `isError: true` —
tools never crash the server.

## Runtime

- `bun` (Bun.SQL driver + Bun runtime).
- No HTTP server, no Elysia/Express/Fastify, no web UI.
- stdio transport only.
