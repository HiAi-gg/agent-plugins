# Agent Browser Agent Plugin

Browse, test, and debug web pages with the **agent-browser CLI** — agent-native
browser automation, packaged as an Agent Plugin with focused workflow skills.

An [Agent Plugin](https://agent-plugins.org/) (spec **1.0.0**).

## What is this?

A deliberately thin plugin around [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser):
the CLI already provides an agent-native browser workflow (snapshots, refs,
state), so this plugin adds portable packaging, correct install guidance,
upstream pinning, and three skills that teach *when and how* to use it safely.

## Why would I install it?

- **Agent-native upstream** — no MCP layer needed; the CLI is built for agents.
- **Self-contained browser install** — `agent-browser install` downloads Chrome
  for Testing (no system Chrome, no sudo — unlike other browser MCP stacks).
- **Portable + safe** — read-first skills, no credentials, sessions closed
  when done.

## What MCP/upstream does it use?

**No MCP.** Architecture is **CLI + Skills**:

- **CLI**: `agent-browser` (pinned `v0.31.x`; runtime-verified 0.31.1).
- **Skills**: `browse-web`, `test-web-flow`, `debug-web-ui`.

## Does it need authentication?

**No** for public pages. For authenticated apps, use the user's own session;
never store credentials in the plugin.

## Is it read-only?

**Skills default to read observation** (`agent-browser read`). The CLI can
click/fill/submit — the skills only interact for the user's stated task and
require explicit intent for side-effect flows.

## What clients were actually tested?

Any client that gives the agent shell access. The full runtime workflow was
verified in this release cycle with agent-browser 0.31.1:

```
install  → present (Chrome for Testing)
doctor   → all checks pass
open     → page loaded
read     → accessible snapshot returned
click    → interaction applied
fill     → form filled
navigate → link followed
read     → new page state read
close    → session closed
```

## Requirements

- `agent-browser` CLI (v0.31.x), installed globally or via the agent's PATH.
- Chrome for Testing via `agent-browser install` (the CLI's own mechanism).
- Shell access for the agent.

## Installation

1. Install the CLI: `bun add -g agent-browser` (or the upstream's documented
   method), then `agent-browser install`.
2. Copy the plugin's **runtime files** (`plugin.json`, `skills/`, `README.md`,
   `LICENSE` — this plugin has no `mcp.json`) into your Agent Plugins client's
   plugin folder, or use your client's plugin install flow. Do **not** copy the
   authoring sources (`plugin.yml`, `skills-src/`, `docs/`) — see the collection
   README for the full boundary.
3. The `browse-web` skill runs `agent-browser doctor` first and explains the
   install step if the browser is missing.

## Configuration

Skills-only plugin — **no `mcp.json`**. The CLI is invoked by the agent via
shell. Pin the CLI version in your environment (the plugin documents `v0.31.x`).

## Examples

1. "Open this page and summarize it" → `browse-web`.
2. "Verify the signup flow works" → `test-web-flow`.
3. "The checkout button does nothing — why?" → `debug-web-ui`.

## Upstream

| Component | Version | License | Source |
|---|---|---|---|
| agent-browser CLI | `0.31.1` (runtime-verified) | Apache-2.0 | [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) |

## Agent Plugins version

**1.0.0 (Working Draft)** — https://agent-plugins.org/specification

## Runtime requirements

`agent-browser` CLI + Chrome for Testing; shell access; display or headless
mode supported by the CLI.

## Security / default behavior

- Read-first skills; interactions only for the stated task.
- No credentials stored; do not print cookies/tokens.
- Browser sessions are closed when the task completes.
- Side-effect flows (orders, accounts) require explicit user consent.

## Known limitations

- Requires the CLI to be installed in the agent's environment (one-time).
- First `agent-browser install` downloads a browser binary.
- Authenticated flows depend on the user's session.

## License

MIT. See [LICENSE](LICENSE). The upstream `agent-browser` is Apache-2.0
(vercel-labs); HiAI is not affiliated with or endorsed by Vercel.

## CHANGELOG

See [CHANGELOG.md](CHANGELOG.md).
