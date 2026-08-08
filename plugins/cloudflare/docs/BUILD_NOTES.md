# BUILD_NOTES — cloudflare

## Product rationale

Cloudflare's API surface is enormous (2,500+ endpoints). Cloudflare's official
Code Mode MCP server makes that surface usable in ~1k tokens. This plugin
pairs it with focused skills that reduce the surface into workflows: Worker
debugging, DNS inspection, request-path investigation, and configuration
review.

## Architecture

```
Cloudflare Code Mode MCP (streamable-http https://mcp.cloudflare.com/mcp, vendor-operated)
+ 4 Agent Skills (debug-worker, inspect-dns, investigate-request, review-cloudflare-config)
```

## Upstream decision

Cloudflare publishes two MCP families:
- **Code Mode server** (`mcp.cloudflare.com`, cloudflare/mcp) — broad API
  coverage via `search`/`execute` code mode; ~1k tokens for the whole API.
- **Domain-specific servers** (`*.mcp.cloudflare.com`) — curated typed tools
  per product area.

Chosen: **Code Mode server** — our skill set spans Workers, DNS, requests, and
config, which is exactly Code Mode's broad coverage. OAuth is the recommended
auth.

## Alternatives rejected

- Domain-specific servers (observability, dns-analytics, …) — narrower; would
  require multiple servers for our skill set.
- Local `@cloudflare/mcp-server-cloudflare` (stdio, `run <account_id>`) —
  requires wrangler login + account id; the remote OAuth server is the
  documented modern path.

## Skill decisions

- `debug-worker` — deployment state + logs + errors for a Worker.
- `inspect-dns` — zone/record inspection.
- `investigate-request` — cache/firewall/Worker/origin request path.
- `review-cloudflare-config` — account/zone configuration review.
- `inspect-deployment` was folded into `debug-worker` (overlap); the four
  chosen skills cover the mission's list with minimal overlap.
- All read-first; mutations gated.

## Runtime testing

- Endpoint `https://mcp.cloudflare.com/mcp` returned 401 without auth (exists).
- OAuth requires a real user. Status: `CONFIG_VALIDATED`,
  `AUTH_RUNTIME_REQUIRES_USER`.

## Limitations

- Requires OAuth/token in the client.
- Code-mode pattern may be restricted by some clients.
- Paid-plan features (observability/analytics).
