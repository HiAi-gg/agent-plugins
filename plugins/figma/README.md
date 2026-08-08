# Figma Agent Plugin

Bring Figma design context into agent workflows: inspect design context,
implement from design, map components, and compare code to design — via
**Figma's official MCP server**.

An [Agent Plugin](https://agent-plugins.org/) (spec **1.0.0**).

## What is this?

A plugin that connects agents to Figma's official remote MCP server
(`https://mcp.figma.com/mcp`) and adds four portable workflow skills for
design-informed implementation and verification.

## Why would I install it?

- **First-party upstream** — Figma's own remote MCP server.
- **Workflow value** — the skills teach *how* to use design context (tokens,
  components, screenshots) to implement and verify, not just what the tools
  do.
- **Portable** — the skills are original, portable workflows; Figma's
  client-specific plugin skills (Claude Code/Cursor) remain the recommended
  option inside those clients.

## What MCP/upstream does it use?

- **Server**: `figma` — `streamable-http` to `https://mcp.figma.com/mcp`
  (Figma-hosted, vendor-operated; endpoint version not pinnable).
- **Skills**: `inspect-design-context`, `implement-from-design`,
  `map-design-components`, `compare-code-to-design`.

### About Figma's own skills

Figma publishes excellent first-party Agent Skills bundled with its plugins
for supported clients (Claude Code, Cursor, Xcode). This plugin does **not**
duplicate those; it provides original portable workflows for Agent Plugins
clients. Where you use a Figma-supported client, prefer Figma's plugin skills;
this plugin's skills remain useful as portable guidance.

## Does it need authentication?

**Yes.** The endpoint requires Figma OAuth via the MCP host's flow. Agent
Plugins v1 has no portable credential mechanism, so **no tokens are in the
plugin** — the host manages authentication. Note: only clients listed in the
Figma MCP Catalog (VS Code, Cursor, Claude Code, …) can connect to the remote
server.

## Is it read-only?

**The skills are read-only workflows.** However, the Figma MCP server itself
**can write to the canvas** (create/modify native Figma content) — it is
**not** read-only. This plugin's skills never write to Figma; any canvas
mutation requires explicit user intent and is out of scope for these skills.

## What clients were actually tested?

Remote OAuth MCP (`streamable-http`) requires an interactive OAuth grant not
available in the build environment.

```
CONFIG_VALIDATED
AUTH_RUNTIME_REQUIRES_USER
```

The config matches the Agent Plugins 1.0.0 `streamable-http` schema and
Figma's documented endpoint. OAuth runtime testing requires a real user.

## Requirements

- An MCP client that supports `streamable-http` **and** OAuth, and is in the
  Figma MCP Catalog.
- Network access to `https://mcp.figma.com/mcp`.
- A Figma account with access to the target files.

## Installation

Copy the plugin directory into your Agent Plugins client's plugin folder, or use
your client's plugin install flow. No build step is required. Complete the OAuth
grant in your client on first connect.

## Configuration

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "figma": {
      "type": "streamable-http",
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

Do **not** add tokens to `headers` — authentication is OAuth via the host.

## Examples

1. "What design tokens does this frame use?" → `inspect-design-context`.
2. "Implement this Figma design in our React app" → `implement-from-design`.
3. "Which Figma components don't have code equivalents?" →
   `map-design-components`.
4. "Does our implementation match the design?" → `compare-code-to-design`.

## Upstream MCP

| Server | Version | License | Source |
|---|---|---|---|
| Figma MCP (remote) | vendor-operated endpoint | — (Figma Developer Terms) | [figma/mcp-server-guide](https://github.com/figma/mcp-server-guide) |

## Agent Plugins version

**1.0.0 (Working Draft)** — https://agent-plugins.org/specification

## Runtime requirements

An MCP client with streamable-http + OAuth support, listed in the Figma MCP
Catalog.

## Security / default behavior

- Skills are read-only; no canvas writes without explicit user intent.
- No tokens in the plugin; OAuth is host-managed.
- Figma MCP can write to the canvas — this is documented, not hidden.

## Known limitations

- Requires OAuth in a Figma-Catalog client (real user).
- Rate limits apply to read tools (Starter/View/Collab seats: 6 tool calls /
  month; Dev/Full seats: per-minute limits).
- Write-to-canvas features are beta and eventually usage-based.

## License

MIT. See [LICENSE](LICENSE). Figma MCP usage is subject to the Figma Developer
Terms; HiAI is not affiliated with or endorsed by Figma.

## CHANGELOG

See [CHANGELOG.md](CHANGELOG.md).
