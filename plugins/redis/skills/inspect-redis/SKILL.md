---
name: inspect-redis
description: "Inspect Redis keys and values: scan keys by pattern, read values of any type, check TTLs and types, and summarize what is stored. Use when asked what is in Redis, whether a key exists, or why a value looks wrong."
---

---
name: inspect-redis
description: Inspect Redis keys and values: scan keys by pattern, read values of any type, check TTLs and types, and summarize what is stored. Use when asked what is in Redis, whether a key exists, or why a value looks wrong.
license: MIT
compatibility: Requires the redis MCP server configured in this plugin (uvx redis-mcp-server==0.5.1) and a reachable Redis instance.
metadata:
  plugin: redis
  kind: data-inspection
---

# Inspect Redis Data

Use this skill when an agent needs to look at what is stored in Redis.

## Server capability note

The official `redis-mcp-server` exposes **write tools** (set, lpush, sadd, zadd,
xadd, expire, rename, delete, …). This skill is read-first: inspect before you
ever consider writing. Mutating data requires explicit user intent.

## Workflow

### 1. Orient

- Confirm the target: `dbsize` for key count, `info` for server basics.
- Identify the logical namespace from the user's question (e.g. `session:*`,
  `cache:*`, `user:*`).

### 2. Scan keys

- Use `scan_keys` (or `scan_all_keys` when the set is small) with a pattern.
- Prefer narrow patterns; do not dump the whole keyspace into a response.
- Note the count so the user knows the scale.

### 3. Read values by type

- `type <key>` first — the type determines the right read tool.
- String: `get <key>`
- Hash: `hgetall <key>`
- List: `lrange <key> 0 -1`
- Set: `smembers <key>`
- Sorted set: `zrange <key> 0 -1 WITHSCORES` (or `zrangebyscore` for a range)
- Stream: `xrange <key> - +` (see `inspect-redis-streams`)
- JSON: `json_get <key>`
- TTL: `ttl <key>` via the server's expiry tooling; negative means no TTL or
  missing key.

### 4. Summarize

Report: key count, the values/types you examined (quote selectively), and any
TTL/expiry facts. If a value is missing, check the pattern and the database
number (`--url` suffix `/0`, `/1`, …) before concluding.

## Guardrails

- Read tools only unless the user explicitly asks to change data.
- Do not output entire large collections — bound with ranges/limits and
  summarize.

