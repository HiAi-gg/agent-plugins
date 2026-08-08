# BUILD_NOTES — figma

## Product rationale

Design-informed implementation and verification is a high-value agent
workflow. Figma operates a first-party remote MCP server; this plugin wraps it
with portable workflow skills.

## Architecture

```
Figma remote MCP (streamable-http https://mcp.figma.com/mcp, vendor-operated)
+ 4 Agent Skills (inspect-design-context, implement-from-design, map-design-components, compare-code-to-design)
```

## Upstream study

Figma publishes its own Agent Skills bundled with plugins for supported clients
(Claude Code, Cursor, Xcode) — see `figma/mcp-server-guide`. Per the mission,
we did **not** produce inferior duplicates of that guidance. This plugin ships
**original portable workflows** for Agent Plugins clients, and the README
points users of Figma-supported clients at Figma's own plugin skills.

## Alternatives rejected

- Figma REST API wrappers — unnecessary; Figma's MCP is first-party.
- Copying Figma's client-specific plugin skills — they are licensed/adapted
  for specific clients; we wrote original portable workflows instead.

## Skill decisions

- `inspect-design-context` — tokens/variables/components/layout extraction.
- `implement-from-design` — design → code with project conventions.
- `map-design-components` — Figma ↔ code component mapping for design systems.
- `compare-code-to-design` — verification workflow.
- All four are read-only with respect to Figma; the MCP's write-to-canvas
  capability is documented but not exercised by the skills.

## Runtime testing

- Config validated against the Agent Plugins 1.0.0 streamable-http schema.
- OAuth requires a real user in a Figma-Catalog client (not available here).
  Status: `CONFIG_VALIDATED`, `AUTH_RUNTIME_REQUIRES_USER`.

## Limitations

- Only Figma MCP Catalog clients can connect (VS Code, Cursor, Claude Code…).
- Read-tool rate limits (6/month on Starter/View/Collab seats).
- Write-to-canvas is beta and eventually usage-based.
