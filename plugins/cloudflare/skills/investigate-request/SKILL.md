---
name: investigate-request
description: "Investigate how Cloudflare handled a specific request: caching, firewall, Workers, and origin behavior. Use when a request behaves unexpectedly (wrong response, cached content, blocked, or slow)."
---

---
name: investigate-request
description: Investigate how Cloudflare handled a specific request: caching, firewall, Workers, and origin behavior. Use when a request behaves unexpectedly (wrong response, cached content, blocked, or slow).
license: MIT
compatibility: Requires the cloudflare MCP server configured in this plugin (https://mcp.cloudflare.com/mcp) with OAuth or an API token at the client level; some diagnostics may need zone-level analytics access.
metadata:
  plugin: cloudflare
  kind: request-investigation
---

# Investigate a Request Through Cloudflare

Use this skill when an agent must determine what Cloudflare did with a
request — cache, firewall, Workers, or origin.

## Context

The Cloudflare MCP server uses a code-mode pattern: `search` and `execute`.
This skill is the workflow for request-path investigation.

## Workflow

### 1. Establish the request

- Get the URL, method, and (if available) the response headers or status the
  user observed.
- Identify the zone and whether a Worker runs on the route.

### 2. Check the response path

Use `execute` with the zone/analytics endpoints to find:

- **Cache**: did the response come from cache (CF-Cache-Status)? Cache
  settings, cache rules, and purge status.
- **Firewall**: was the request blocked/challenged by WAF, rate limiting, or
  a firewall rule? Check firewall events for the request.
- **Worker**: did a Worker handle the route? Check the Worker's behavior
  (see `debug-worker`).
- **Origin**: was the origin reached, and what did it return?

### 3. Correlate with observed symptoms

- **Wrong/stale content** → cache settings or cache rules; check cache
  behavior and purge.
- **Blocked/challenged** → firewall events; which rule matched?
- **Unexpected 5xx** → Worker or origin; check Worker logs and origin health.
- **Slow** → cache miss rate, origin latency, or Worker execution time.

### 4. Report

Give: the request path evidence (cache/firewall/Worker/origin), the root cause
with the supporting data, and the narrowest fix (adjust cache rule, WAF rule,
Worker, origin). This is investigation — changing rules or purging cache
requires explicit user intent.

## Guardrails

- Read-first; no cache purges, rule changes, or Worker edits without explicit
  user intent.
- Do not print tokens or sensitive request data.

