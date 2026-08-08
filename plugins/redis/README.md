# Redis Agent Plugin

Inspect and work with Redis: keys, values, TTLs, hashes, lists, sets, streams,
memory, and diagnostics — via **Redis' official MCP server** (`redis-mcp-server`).

An [Agent Plugin](https://agent-plugins.org/) (spec **1.0.0**).

## What is this?

A plugin that pairs Redis' official MCP server with focused skills for
inspecting data, diagnosing problems, analyzing memory, and understanding
streams.

## Why would I install it?

- **First-party upstream** — `redis-mcp-server` (Redis' own MCP server).
- **Rich tool set** — 50+ tools covering strings, hashes, lists, sets, sorted
  sets, streams, JSON, and diagnostics.
- **Skills add discipline** — read-first workflows; mutations require explicit
  user intent (the server *can* write; the skills keep you honest about it).

## What MCP/upstream does it use?

- **Server**: `redis` — stdio,
  `uvx --from redis-mcp-server==0.5.1 redis-mcp-server --url redis://localhost:6379/0`
  (pinned).
- **Skills**: `inspect-redis`, `diagnose-redis-data`, `inspect-streams`,
  `analyze-memory-state`.

### Version note (0.5.0 vs 0.5.1)

`redis-mcp-server==0.5.0` is broken as published (its `mcp[cli]>=1.9.4`
dependency has no upper bound, so `uvx` resolves MCP 2.0 and the server crashes
with `ModuleNotFoundError: mcp.server.fastmcp`). `0.5.1` fixes the pin to
`mcp[cli]<2,>=1.26.0`. This plugin pins **0.5.1** — the runtime-verified
version.

## Does it need authentication?

**No** for a local unauthenticated development Redis. Authenticated/cloud Redis
is a client-side configuration concern; **never embed credentials or
authenticated URLs in this plugin**.

## Is it read-only?

**The skills default to read-only inspection.** The server itself exposes
write tools (set, lpush, sadd, expire, delete, …) — the plugin does **not**
claim the MCP is read-only. If you need server-enforced read-only, configure it
with a **Redis ACL user that has read-only permissions** (e.g.
`~cached:*` read-only user on a dedicated URL); the skills document that the
safety boundary is the ACL, not the server.

## What clients were actually tested?

stdio MCP transport. The pinned server was runtime-verified in this release
cycle against a live Redis (handshake, tools/list, `get`, `dbsize`).
Status: **RUNTIME_VERIFIED**. Verify in your specific client.

## Requirements

- Python with `uv`/`uvx` (server fetched on demand).
- A reachable Redis instance (default `redis://localhost:6379/0`).
- Network access on first run.

## Installation

Copy the plugin directory into your Agent Plugins client's plugin folder, or use
your client's plugin install flow. No build step is required.

## Configuration

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "redis": {
      "type": "stdio",
      "command": "uvx",
      "args": [
        "--from",
        "redis-mcp-server==0.5.1",
        "redis-mcp-server",
        "--url",
        "redis://localhost:6379/0"
      ]
    }
  }
}
```

Change `--url` for a different host/port/db. For authenticated instances,
configure credentials at the client level — never in this file.

## Examples

1. "What's in Redis?" → `inspect-redis` (dbsize, scan, type-aware reads).
2. "Why is my cache key missing?" → `diagnose-redis-data`.
3. "Is my stream consumer keeping up?" → `inspect-streams`.
4. "Redis memory is high — what's using it?" → `analyze-memory-state`.

## Upstream MCP

| Server | Version | License | Source |
|---|---|---|---|
| Redis MCP Server | `redis-mcp-server==0.5.1` (pinned) | MIT | [redis/redis-mcp](https://github.com/redis/redis-mcp) |

## Agent Plugins version

**1.0.0 (Working Draft)** — https://agent-plugins.org/specification

## Runtime requirements

Python 3.10+, `uv`/`uvx`, network on first run, reachable Redis.

## Security / default behavior

- Skills are read-first; mutations gated on explicit user intent.
- The server can write — enforce read-only via a Redis ACL user if required.
- No credentials, passwords, TLS secrets, or authenticated URLs in the plugin.
- Default target is local unauthenticated development Redis.

## Known limitations

- Write tools exist on the server; the plugin's safety comes from the skills
  and (optionally) a read-only ACL user.
- Cloud Redis (TLS/entra auth) requires client-side configuration.

## License

MIT. See [LICENSE](LICENSE). Upstream `redis-mcp-server` is MIT (Redis); HiAI
is not affiliated with or endorsed by Redis.

## CHANGELOG

See [CHANGELOG.md](CHANGELOG.md).
