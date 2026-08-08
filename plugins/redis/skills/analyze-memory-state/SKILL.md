---
name: analyze-memory-state
description: "Analyze Redis memory usage: identify the biggest keys, largest data structures, key counts per type, and candidates for eviction or expiry. Use when Redis memory is high, evictions are occurring, or when optimizing storage."
---

# Analyze Redis Memory

Use this skill when Redis memory usage matters: high memory, evictions, or
storage optimization.

## Workflow

### 1. Get the overview

- `info` — read `used_memory`, `maxmemory`, `evicted_keys`, `expired_keys`.
- `dbsize` — total key count.
- Note whether eviction is actively happening (`evicted_keys` growing).

### 2. Profile by type

- Use the server's scan + type tooling to count keys per type (string, hash,
  list, set, zset, stream). A single type dominating usually points at the
  culprit pattern.

### 3. Find the biggest consumers

- Strings: sample long values (`strlen` via `get` when feasible) on the largest
  keys.
- Hashes/lists/sets/zsets: estimate by element count (`hlen`, `llen`, `scard`,
  `zcard`) — element count × element size is the practical proxy; flag keys
  with extreme counts.
- Streams: `xlen` for very long streams with no trimming.

### 4. Identify candidates

Rank by estimated bytes:

1. huge values (large blobs, caches of large payloads),
2. unbounded collections (lists/streams that never trim),
3. keys with no TTL that should expire (session/cache keys without expiry).

### 5. Report

Give: memory overview (used/max/evictions), the top N keys by estimated size
with their types and element counts, and concrete recommendations (add TTL, trim
streams, move blobs out of Redis). **Do not delete, expire, or evict anything**
— those are write actions requiring explicit user intent.

