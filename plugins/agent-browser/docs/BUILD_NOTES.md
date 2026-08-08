# BUILD_NOTES — agent-browser

## Product rationale

Browser automation is a core agent capability. `agent-browser` (vercel-labs)
is an agent-native browser CLI — it already speaks the agent's workflow
(snapshots, refs, state) — so the plugin packages it portably rather than
rebuilding it as an MCP server. This deliberately replaces the earlier
Playwright MCP approach, which hit system-Chrome/sudo problems in this
environment; agent-browser's `install` downloads Chrome for Testing without
sudo.

## Architecture

```
agent-browser CLI (v0.31.x, pinned)
+ 3 Agent Skills (browse-web, test-web-flow, debug-web-ui)
```

No MCP. The CLI is the tool; the skills are the behavioral layer.

## Upstream

- vercel-labs/agent-browser (Apache-2.0). See docs/UPSTREAM_TRUST.md.

## Alternatives rejected

- Playwright MCP (`@playwright/mcp`) — required a system Chrome channel that
  needed sudo in this environment; agent-browser solves install with its own
  Chrome for Testing download. (Also, Playwright is outside the 12-plugin
  scope — kept as a reference fixture.)
- A browser MCP server in general — unnecessary; the CLI is already
  agent-native, and forcing MCP would add a process/transport layer with no
  functional gain.

## Skill decisions

- `browse-web` — the primary skill: open → read snapshot → interact by ref →
  navigate → read state → close. One excellent main skill per the mission.
- `test-web-flow` — genuinely different workflow (multi-step flow verification
  with step-by-step evidence and side-effect consent).
- `debug-web-ui` — genuinely different workflow (reproduce → observe → isolate
  → report).
- No more than three; the mission warns against inflating skill counts.

## Runtime testing

Full workflow verified with agent-browser 0.31.1 against a local test page:

```
doctor   pass (Chrome for Testing 150 present)
open     page loaded (title returned)
read     accessible snapshot returned
click    state changed (clicked! rendered)
fill     form filled
click    link followed
read     second page state read
close    session closed
```

Status: **RUNTIME_VERIFIED** (install/doctor/open/snapshot/interact/navigate/
read/close).

## Limitations

- Requires the CLI in the agent's environment (one-time install).
- First `agent-browser install` downloads a browser binary.
