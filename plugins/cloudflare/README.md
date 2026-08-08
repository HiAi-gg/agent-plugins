# Cloudflare Agent Plugin

Inspect and debug Cloudflare: Workers, DNS, request handling, and configuration
— via **Cloudflare's official Code Mode MCP server**.

An [Agent Plugin](https://agent-plugins.org/) (spec **1.0.0**).

## What is this?

A plugin that connects agents to Cloudflare's official Code Mode MCP server
(`https://mcp.cloudflare.com/mcp`) and adds four focused skills that reduce
Cloudflare's large API surface into useful workflows: Worker debugging, DNS
inspection, request-path investigation, and configuration review.

## Why would I install it?

- **First-party upstream** — Cloudflare's own MCP server (`cloudflare/mcp`),
  token-efficient (covers the whole API in ~1k tokens via code mode).
- **Skills reduce complexity** — the plugin's value is turning the API surface
  into focused, read-first workflows.
- **No mutation by default** — inspection/debugging first; changes require
  explicit intent.

## What MCP/upstream does it use?

- **Server**: `cloudflare` — `streamable-http` to
  `https://mcp.cloudflare.com/mcp` (Cloudflare Code Mode MCP; vendor-operated;
  endpoint version not pinnable).
- **Skills**: `debug-worker`, `inspect-dns`, `investigate-request`,
  `review-cloudflare-config`.

## Does it need authentication?

**Yes.** The endpoint requires either OAuth (recommended — redirected to
Cloudflare to authorize and select permissions) or an API token at the client
level. Agent Plugins v1 has no portable credential mechanism, so **no tokens
are in the plugin** — auth is host/client managed.

## Is it read-only?

**Skills default to read-only inspection.** The server itself can execute
Cloudflare API calls (including mutations). The skills inspect deployments,
DNS, requests, and configuration — any change (deploy, DNS edit, rule change,
cache purge) requires explicit user intent.

## What clients were actually tested?

Remote OAuth MCP (`streamable-http`) requires an interactive OAuth grant not
available in the build environment.

```
CONFIG_VALIDATED
AUTH_RUNTIME_REQUIRES_USER
```

The config matches the Agent Plugins 1.0.0 `streamable-http` schema and
Cloudflare's documented endpoint (`https://mcp.cloudflare.com/mcp` returned
401 without auth — the endpoint exists). OAuth runtime testing requires a real
user.

## Requirements

- An MCP client that supports `streamable-http` **and** OAuth (or a client
  that can attach an API token).
- Network access to `https://mcp.cloudflare.com/mcp`.
- A Cloudflare account with permissions for the areas you inspect.

## Installation

Copy the plugin's **runtime files** (`plugin.json`, `mcp.json`, `skills/`,
`README.md`, `LICENSE`) into your Agent Plugins client's plugin folder, or use
your client's plugin install flow. Do **not** copy the authoring sources
(`plugin.yml`, `skills-src/`, `docs/`) — see the collection README for the full
boundary. No build step is required. Complete OAuth in your client on first
connect (or configure an API token at the client level).

## Configuration

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "cloudflare": {
      "type": "streamable-http",
      "url": "https://mcp.cloudflare.com/mcp"
    }
  }
}
```

Do **not** add tokens to `headers` — use OAuth or a client-level bearer token.

## Examples

1. "Why is my Worker returning 500s?" → `debug-worker`.
2. "Check the DNS records for example.com" → `inspect-dns`.
3. "Why was this request served stale content?" → `investigate-request`.
4. "Review our zone configuration for issues" → `review-cloudflare-config`.

## Upstream MCP

| Server | Version | License | Source |
|---|---|---|---|
| Cloudflare Code Mode MCP (remote) | vendor-operated endpoint | — | [cloudflare/mcp](https://github.com/cloudflare/mcp) |

## Agent Plugins version

**1.0.0 (Working Draft)** — https://agent-plugins.org/specification

## Runtime requirements

An MCP client with streamable-http + OAuth (or token) support.

## Security / default behavior

- Read-first skills; no mutation without explicit user intent.
- No tokens in the plugin; OAuth (recommended) or client-level token.
- The server can execute API calls — skills constrain to inspection.
- Do not print tokens or secret binding values.

## Known limitations

- Requires OAuth/token in the client (real user).
- Code mode uses `search`/`execute` code-execution pattern — some clients may
  restrict it.
- Some features (observability/analytics) need a paid Workers plan.

## License

MIT. See [LICENSE](LICENSE). Upstream Cloudflare MCP is Cloudflare's; HiAI is
not affiliated with or endorsed by Cloudflare.

## CHANGELOG

See [CHANGELOG.md](CHANGELOG.md).
