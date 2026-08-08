---
name: verify-api-usage
description: Verify that code uses a library's API correctly against current documentation before considering it done. Use after writing code against a library, when a review raises API-usage doubts, or when a build/type error suggests the API changed.
---

---
name: verify-api-usage
description: Verify that code uses a library's API correctly against current documentation before considering it done. Use after writing code against a library, when a review raises API-usage doubts, or when a build/type error suggests the API changed.
license: MIT
compatibility: Requires the context7 MCP server configured in this plugin (npx @upstash/context7-mcp@3.2.5) and network access.
metadata:
  plugin: context7
  kind: verification
---

# Verify API Usage

Use this skill when an agent must confirm that existing or newly written code
uses a library's API correctly.

## Workflow

### 1. Identify the calls to verify

- Collect the library calls in the code: function/method names, options,
  imports.
- Prioritize: recently written code, code the user flagged, calls with
  non-obvious options.

### 2. Fetch the authoritative signatures

- Query Context7 for the package (and version, if pinned).
- Compare each call against the documented signature: parameter names, required
  vs optional, defaults, return shape, and any deprecation warnings.

### 3. Check for version drift

- If the repo's dependency version differs from the current docs, check the
  version the repo pins (lockfile/manifest) — behavior differences between
  versions are a common source of "it should work" bugs.
- Flag deprecated/removed APIs explicitly.

### 4. Report

For each verified call: correct / incorrect / needs-attention, with the
documented signature and what the code should be. If everything checks out, say
so with the version you verified against.

## Guardrails

- Read-only research; do not modify code unless the user asks for the fix.
- Do not call Context7 for every line — verify the calls that matter and the
  ones the user asked about.

