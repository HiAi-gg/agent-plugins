# BUILD_NOTES — sentry

## Product rationale

Production error investigation (triage, regression, root-cause, performance)
is a high-value agent workflow. Sentry operates a first-party hosted MCP
endpoint; this plugin wraps it with investigation-order skills rather than
rebuilding error-tracking access.

## Architecture

```
Sentry hosted MCP (streamable-http, vendor-operated)
+ 4 Agent Skills (triage-sentry-issue, investigate-regression, analyze-error, investigate-performance)
```

## Upstream

- getsentry/sentry-mcp (project); hosted endpoint operated by Sentry.
  See docs/UPSTREAM_TRUST.md.

## Alternatives rejected

- Third-party Sentry wrappers — unnecessary; Sentry's endpoint is first-party.
- Self-hosted Sentry MCP with a token — heavier; hosted OAuth is simpler and
  safer.

## Skill decisions

- Skill names follow the mission: `triage-sentry-issue`,
  `investigate-regression`, `analyze-error` (renamed from
  `debug-production-error`), `investigate-performance` (renamed from
  `analyze-sentry-trace`).
- The skills encode the investigation order:
  issue → events → stack/context → regression/change → trace/performance →
  next action.
- Read-only default; no mutation of Sentry state without explicit intent.

## Runtime testing

- Config validated against the Agent Plugins 1.0.0 streamable-http schema.
- OAuth requires a real user interaction (not available in the build
  environment).
  Status: `CONFIG_VALIDATED`, `AUTH_RUNTIME_REQUIRES_USER`.

## Limitations

- OAuth must be completed by a real user in their client.
- Tool set is controlled by Sentry's hosted endpoint.
