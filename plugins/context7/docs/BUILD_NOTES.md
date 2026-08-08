# BUILD_NOTES — context7

## Product rationale

Agents' library knowledge goes stale. Context7 provides current documentation
on demand; the plugin pairs the first-party MCP server with usage-discipline
skills so the agent queries it at the right moments (before unfamiliar
implementations, API-usage verification, version checks) and not for every
programming question.

## Architecture

```
@upstash/context7-mcp@3.2.5 (stdio, pinned)
+ 3 Agent Skills (research-library-docs, verify-api-usage, check-current-library-version)
```

## Upstream approach decision

Context7 publishes both a CLI (`npx ctx7`) and an MCP server, both first-party
(Upstash). **Chosen: MCP + Skill.** Rationale:

- The MCP server integrates through `mcp.json` into any MCP-capable client
  without requiring shell access (CLI needs shell).
- It is the approach Context7 publishes for MCP clients.
- It was runtime-verified with a real lookup in this release (see below).

## Alternatives rejected

- Context7 CLI + Skill — viable but requires agent shell access and manual
  piped output handling; MCP gives typed tools (`resolve-library-id`,
  `query-docs`) with input validation.
- Generic web-search-based doc lookup — not first-party, lower quality.

## Skill decisions

- `research-library-docs` — primary: consult Context7 before implementing with
  unfamiliar/fast-changing APIs; explicitly avoid over-use for stable/general
  questions.
- `verify-api-usage` — verify written code against current docs.
- `check-current-library-version` — version checks for upgrade/triage.
- These three match the mission list exactly.

## Runtime testing

Pinned server runtime-verified in this release:

```
handshake           OK (serverInfo: Context7 3.2.5)
tools/list          resolve-library-id, query-docs
resolve-library-id  react → /reactjs/react.dev (benchmark 92.12, 6052 snippets)
query-docs          /reactjs/react.dev + "useEffect" → current docs with source links
```

Status: **RUNTIME_VERIFIED** (one real library documentation lookup).

## Limitations

- Anonymous rate limits apply.
- Docs availability varies by package.
