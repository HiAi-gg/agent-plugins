# BUILD_NOTES — redis

## Product rationale

Redis inspection (keys, values, types, TTLs, streams, memory) is a common agent
task. Redis publishes an official MCP server; this plugin pairs it with
read-first skills so agents inspect safely even though the server exposes write
tools.

## Architecture

```
redis-mcp-server==0.5.1 (stdio, pinned, first-party Redis)
+ 4 Agent Skills (inspect-redis, diagnose-redis-data, inspect-streams, analyze-memory-state)
```

## Upstream

- redis/redis-mcp (MIT). See docs/UPSTREAM_TRUST.md.

## Alternatives rejected

- Archived reference `@modelcontextprotocol/server-redis` — deprecated,
  minimal tools; replaced by Redis' official server per the mission.
- Other community Redis MCP servers — not first-party.

## Skill decisions

- Skill names follow the mission: `inspect-redis`, `diagnose-redis-data`,
  `inspect-streams`, `analyze-memory-state` (renamed from blind-test names).
- All four are read-first; they document that the server exposes write tools
  and that a Redis ACL read-only user is the enforcement boundary if needed.

## Runtime testing

Rerun in the earlier blind-test cycle against a live Redis (docker):

```
handshake  OK (Redis MCP Server)
tools/list 50+ tools
get        returned seeded value
dbsize     returned count
```

Status: **RUNTIME_VERIFIED**.

## Limitations

- Server exposes write tools; safety is via skills + optional ACL user.
- 0.5.0 broken upstream (dependency pin); 0.5.1 used.
