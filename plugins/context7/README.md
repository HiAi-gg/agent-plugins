# Context7 Agent Plugin

Current library and framework documentation via **Context7's first-party MCP
server**, plus usage-discipline skills that tell an agent *when* to consult it.

An [Agent Plugin](https://agent-plugins.org/) (spec **1.0.0**).

## What is this?

The combination is simple by design:

- **MCP** = current library documentation on demand
  (`@upstash/context7-mcp`, pinned, first-party Upstash).
- **Skills** = when the agent should consult it, and how to apply it.

## Why would I install it?

- Agents' training knowledge goes stale; Context7 returns current docs.
- The skills prevent both *under-use* (guessing APIs) and *over-use*
  (hammering Context7 for trivial questions).
- One of the simplest installs in this collection: no auth, no config.

## What MCP/upstream does it use?

- **Server**: `context7` — stdio,
  `npx -y @upstash/context7-mcp@3.2.5` (pinned; first-party Upstash/Context7).
- **Skills**: `research-library-docs`, `verify-api-usage`,
  `check-current-library-version`.

### Why MCP (not CLI)

Both the Context7 CLI (`npx ctx7`) and the MCP server are first-party. The MCP
server is the right choice for an Agent Plugin: it integrates through
`mcp.json` into any MCP-capable client without requiring shell access, and it
is the approach Context7 publishes for MCP clients.

## Does it need authentication?

**No.** The server operates at the anonymous/basic rate limit. An API key is an
optional user-side enhancement, **not** part of the portable plugin — do not
add one.

## Is it read-only?

**Yes.** Context7 only reads documentation. Nothing in this plugin writes.

## What clients were actually tested?

stdio MCP transport. The pinned server was runtime-verified in this release
cycle with a **real library lookup** (React docs: `resolve-library-id` →
`query-docs` returned current `useEffect` documentation with source links).
Status: **RUNTIME_VERIFIED**. Verify in your specific client.

## Requirements

- Node.js 18+ with `npx`.
- Network access (to Context7 and the upstream package registry).

## Installation

Copy the plugin's **runtime files** (`plugin.json`, `mcp.json`, `skills/`,
`README.md`, `LICENSE`) into your Agent Plugins client's plugin folder, or use
your client's plugin install flow. Do **not** copy the authoring sources
(`plugin.yml`, `skills-src/`, `docs/`) — see the collection README for the full
boundary. No build step, no auth, no configuration.

## Configuration

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@3.2.5"]
    }
  }
}
```

## Examples

1. "I need to use Drizzle ORM — how does the query builder work now?" →
   `research-library-docs`.
2. "Is this call to the AWS SDK still correct?" → `verify-api-usage`.
3. "We pin React 18 — should we upgrade?" → `check-current-library-version`.

## Upstream MCP

| Server | Version | License | Source |
|---|---|---|---|
| Context7 MCP | `@upstash/context7-mcp@3.2.5` (pinned) | MIT | [upstash/context7](https://github.com/upstash/context7) |

## Agent Plugins version

**1.0.0 (Working Draft)** — https://agent-plugins.org/specification

## Runtime requirements

Node.js 18+, `npx`, network access.

## Security / default behavior

- Read-only (documentation lookups).
- No API key in the plugin; anonymous rate limit is the default.
- No credentials, no tokens, no user data sent to the agent's host.

## Known limitations

- Anonymous rate limits apply — heavy usage needs the optional user-side API
  key.
- Docs availability varies by package; not every library is indexed.

## License

MIT. See [LICENSE](LICENSE). Upstream Context7 MCP is MIT (Upstash); HiAI is
not affiliated with or endorsed by Upstash.

## CHANGELOG

See [CHANGELOG.md](CHANGELOG.md).
