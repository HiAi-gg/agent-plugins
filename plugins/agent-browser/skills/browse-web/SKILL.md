---
name: browse-web
description: "Browse and interact with web pages using the agent-browser CLI: open pages, read accessible snapshots, click by ref, fill forms, navigate, and read state. Use when the agent needs to inspect or operate a real web page or web application."
---

---
name: browse-web
description: Browse and interact with web pages using the agent-browser CLI: open pages, read accessible snapshots, click by ref, fill forms, navigate, and read state. Use when the agent needs to inspect or operate a real web page or web application.
license: MIT
compatibility: Requires the agent-browser CLI (v0.31.x) with a Chrome for Testing browser installed (agent-browser install). See plugin README for setup.
metadata:
  plugin: agent-browser
  kind: web-interaction
---

# Browse and Interact with Web Pages

Use this skill when an agent must open, read, or operate a real web page with
the `agent-browser` CLI. This skill is deliberately thin: the CLI already
provides an agent-native workflow (snapshots, refs, state), so this skill
teaches *when and how* to use it safely — it does not re-document the CLI.

## Workflow

### 1. Confirm the browser is installed

Run `agent-browser doctor` once before starting. If it reports a missing
browser, run `agent-browser install` (the CLI's own supported install
mechanism). Do not install system Chrome or use sudo.

### 2. Open the target page

```bash
agent-browser open "<url>"
```

The page loads in a persistent browser session. Confirm the title/page rendered
before proceeding.

### 3. Read the page snapshot

```bash
agent-browser read
```

The output is an accessible text snapshot with refs (e.g. `[12]`). Treat refs
as stable selectors for the current session. Read the snapshot before acting —
never guess selectors from memory.

### 4. Interact by ref or selector

```bash
agent-browser click "<ref-or-selector>"
agent-browser fill "<ref-or-selector>" "<value>"
agent-browser type "<ref-or-selector>" "<text>"
agent-browser press "Enter"
```

Prefer the refs from the snapshot you just read. After each interaction, re-read
the page (`agent-browser read`) to confirm the state changed as expected.

### 5. Navigate

```bash
agent-browser open "<next-url>"
# or click a link/button, then re-read
```

### 6. Read state and finish

- Re-read the page to confirm the final state.
- Close the session when done: `agent-browser close`.

## Guardrails

- Read the snapshot before acting; never guess selectors.
- Default to reading (`agent-browser read`) over mutating.
- Only fill/submit forms the user asked about; never submit destructive or
  payment forms without explicit intent.
- Close the browser session when finished.
- Do not print credentials or session cookies into responses.

