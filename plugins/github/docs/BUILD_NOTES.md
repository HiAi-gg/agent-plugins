# BUILD_NOTES — github

## Product rationale

Inspect-and-work-with-GitHub workflows (PR review, issue triage, CI
investigation, repository exploration) are a high-value agent capability.
GitHub operates a first-party hosted MCP endpoint, so this plugin wraps that
endpoint with behavioral skills rather than rebuilding API access.

## Architecture

```
Official GitHub MCP (streamable-http, GitHub Copilot-hosted)
+ 4 HiAI Agent Skills (review-pull-request, triage-issue, investigate-ci, explore-repository)
```

Read/inspect default; writes (comment, label, merge, rerun) require explicit
user intent.

## Upstream

- GitHub Copilot-hosted MCP endpoint `https://api.githubcopilot.com/mcp/`
  (vendor-operated by GitHub). See docs/UPSTREAM_TRUST.md.

## Alternatives rejected

- Third-party GitHub API wrappers — unnecessary; GitHub's own endpoint is
  first-party.
- Self-hosted `github-mcp-server` — heavier, requires a token; the hosted
  endpoint with host-managed OAuth is simpler and safer for users.

## Skill decisions

- `review-pull-request`: systematic PR review (diff → CI → threads → verdict).
- `triage-issue`: classify/prioritize/deduplicate with evidence.
- `investigate-ci`: Actions failure investigation (run → job → step → cause).
- `explore-repository`: structured repo health/onboarding review.
- Names and focus chosen to avoid generic Git/GitHub tutorials; each skill is
  a workflow an agent should load only for its matching task.

## Runtime testing

- Config validated against the Agent Plugins 1.0.0 streamable-http schema.
- Remote OAuth cannot be exercised in this build environment (requires an
  interactive OAuth grant).
  Status: `CONFIG_VALIDATED`, `AUTH_RUNTIME_NOT_VERIFIED`.

## Limitations

- OAuth must be completed by the user in their client.
- Tool set is controlled by GitHub's hosted endpoint and may change.
