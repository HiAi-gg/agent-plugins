---
name: inspect-streams
description: "Inspect Redis streams: read entries, check stream length and consumer groups, and understand consumer group state. Use when debugging stream consumers, checking what was published, or verifying a stream-based pipeline."
---

# Inspect Redis Streams

Use this skill when an agent needs to understand what is in a Redis stream or
why a stream consumer is stuck.

## Workflow

### 1. Locate the stream

- Confirm the key is a stream: `type <key>` → `stream`.
- Read the basics: `xlen <key>` for the entry count.

### 2. Read entries

- `xrange <key> - +` for entries (optionally bound by id range or count).
- Note the field structure of entries so you can explain what each event
  contains.
- For recent activity, read the tail (`xrevrange` style, last N entries).

### 3. Check consumer groups

- List groups and their state (pending counts, last-delivered id, consumers):
  the server's `xinfo` tooling.
- A growing pending-entry count (or a lagging last-delivered id) indicates a
  slow or stuck consumer.
- Check `xreadgroup`-visible positions if a consumer is not advancing.

### 4. Correlate

- If events exist but a consumer sees none: group/consumer name mismatch, wrong
  stream key in the consumer config, or the consumer crashed with unacked
  entries.
- If the stream is empty: the producer never published, or the stream was
  trimmed/deleted (check `xdel`, `xtrim` history if visible).

### 5. Report

State: stream length, entry structure (sample), group/consumer state, and the
most likely cause of any gap, with a concrete next step. Reading is read-only;
do not `xack`, `xdel`, `xgroup_destroy`, or add entries without explicit user
intent.

