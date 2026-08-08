---
name: diagnose-redis-data
description: Diagnose Redis data problems: missing keys, wrong types, stale or expiring values, and mismatches between writers and readers. Use when an application cannot find a value, reads the wrong one, or Redis behavior is surprising.
license: MIT
compatibility: Requires the redis MCP server configured in this plugin (uvx redis-mcp-server==0.5.1) and a reachable Redis instance.
metadata:
  plugin: redis
  kind: troubleshooting
---

# Diagnose Redis Data Problems

Use this skill when Redis data behaves unexpectedly: missing keys, wrong
values, surprise expirations, or type errors.

## Workflow

### 1. Reproduce the read

- Identify the key(s) the application reads and the database number it connects
  to. Database confusion (`/0` vs `/1`) is a classic cause — confirm the URL.
- Read the key with the correct tool for its declared type.

### 2. Check the common failure classes

- **Missing key**: `type <key>` returns `none`, or `exists`/`ttl` is negative.
  Causes: never written, expired, evicted, or written to a different db.
- **Wrong type**: the app calls `get` on a hash (or `lrange` on a string).
  `type <key>` exposes this instantly.
- **Expired/stale**: check TTL. If `ttl` is near zero or negative, the writer's
  `EXPIRE` (or `SET ... EX`) is the suspect; correlate with the app's expected
  lifetime.
- **Pattern mismatch**: the writer stores `user:123`, the reader looks up
  `users:123`. Compare actual keys (`scan_keys`) with the app's key format.
- **Key exists but wrong value**: compare against what the writer should have
  stored (serialization, encoding, overwrites by a second writer).

### 3. Verify eviction/memory

- `info` for `maxmemory` and `evicted_keys`. If eviction is happening, large
  keys or no-expiry keys are the usual culprits (see `analyze-redis-memory`).

### 4. Report

State: the key and db number checked, the observed facts (type, TTL, existence,
value excerpt), the most likely cause, and the narrowest fix. Distinguish
"proven by evidence" from "most likely".

## Guardrails

- Read-only diagnosis. Do not `delete`, `rename`, `expire`, or `set` to "fix"
  anything without explicit user intent.
