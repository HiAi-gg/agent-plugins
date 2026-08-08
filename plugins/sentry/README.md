# Sentry Agent Plugin

Investigate and triage production errors with **Sentry**: issues, events,
regressions, and performance — via Sentry's official hosted MCP endpoint.

An [Agent Plugin](https://agent-plugins.org/) (spec **1.0.0**).

## What is this?

A plugin that pairs Sentry's official hosted MCP endpoint with four skills that
teach a disciplined investigation order:

```
issue → events → stack/context → regression/change → trace/performance → next action
```

- `triage-sentry-issue` — assess impact and prioritize.
- `investigate-regression` — find what changed when an error spiked.
- `analyze-error` — full end-to-end root-cause workflow.
- `investigate-performance` — find the slow/failing step in a trace.

## Why would I install it?

- **First-party upstream** — Sentry's hosted MCP endpoint (`mcp.sentry.dev`).
- **No credentials in the plugin** — authentication is the MCP host's OAuth
  flow, per Agent Plugins v1 design.
- **Investigation discipline** — the skills define the order and evidence
  standards, which is the real value.

## What MCP/upstream does it use?

- **Server**: `sentry` — `streamable-http` to `https://mcp.sentry.dev/mcp`
  (Sentry-hosted, vendor-operated; endpoint version not pinnable).

## Does it need authentication?

**Yes.** The endpoint requires Sentry auth via the MCP host's OAuth flow.
Agent Plugins v1 has no portable credential mechanism, so **no token goes into
`headers`** — the host manages authentication. OAuth may require a real user
interaction.

## Is it read-only?

**Skills default to read-only investigation.** The endpoint exposes Sentry
state (issues, events, releases); the skills never mutate issue/release state
(resolve, ignore, assign, comment) without explicit user intent.

## What clients were actually tested?

Remote OAuth MCP (`streamable-http`) requires an interactive OAuth grant that
was not available in the build environment.

```
CONFIG_VALIDATED
AUTH_RUNTIME_REQUIRES_USER
```

The config matches the Agent Plugins 1.0.0 `streamable-http` schema and
Sentry's documented endpoint. OAuth runtime testing requires a real user —
this is not a release blocker by itself, but do not claim full runtime
verification without it.

## Requirements

- An MCP client that supports `streamable-http` **and** OAuth for remote
  servers.
- Network access to `https://mcp.sentry.dev/mcp`.
- A Sentry account/organization with the MCP integration enabled.

## Installation

Copy the plugin directory into your Agent Plugins client's plugin folder, or use
your client's plugin install flow. No build step is required. Complete the OAuth
grant in your client on first connect.

## Configuration

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "sentry": {
      "type": "streamable-http",
      "url": "https://mcp.sentry.dev/mcp"
    }
  }
}
```

Do **not** put a Sentry token in `headers` — Agent Plugins v1 explicitly leaves
OAuth/authentication to the client.

## Examples

1. "Which error should we fix first?" → `triage-sentry-issue`.
2. "This error spiked after the last deploy" → `investigate-regression`.
3. "Root-cause this production exception" → `analyze-error`.
4. "Why is checkout slow?" → `investigate-performance`.

## Upstream MCP

| Server | Version | License | Source |
|---|---|---|---|
| Sentry MCP (hosted) | vendor-operated endpoint | — | [getsentry/sentry-mcp](https://github.com/getsentry/sentry-mcp) |

## Agent Plugins version

**1.0.0 (Working Draft)** — https://agent-plugins.org/specification

## Runtime requirements

An MCP client with streamable-http + OAuth support; network access to
`mcp.sentry.dev`.

## Security / default behavior

- Read-only default; no mutation of Sentry state without explicit intent.
- No tokens in the plugin; OAuth is host-managed.
- No credentials stored or committed.

## Known limitations

- Requires interactive OAuth in the client (a real user).
- Tool availability is controlled by Sentry's hosted endpoint.
- AUTH_RUNTIME_REQUIRES_USER — full OAuth runtime not yet exercised.

## License

MIT. See [LICENSE](LICENSE). The upstream Sentry MCP project is separate; HiAI
is not affiliated with or endorsed by Sentry.

## CHANGELOG

See [CHANGELOG.md](CHANGELOG.md).
