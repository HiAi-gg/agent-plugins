---
name: review-pull-request
description: "Review a GitHub pull request systematically: read the diff, changed files, review comments, CI status, and related issues, then produce a structured review. Use when asked to review a PR, assess merge readiness, or understand what a PR changes."
---

---
name: review-pull-request
description: Review a GitHub pull request systematically: read the diff, changed files, review comments, CI status, and related issues, then produce a structured review. Use when asked to review a PR, assess merge readiness, or understand what a PR changes.
license: MIT
compatibility: Requires the github MCP server (GitHub Copilot-hosted, OAuth via client) and access to the target repository.
metadata:
  plugin: github
  kind: code-review
---

# Review a Pull Request

Use this skill when an agent is asked to review a pull request or assess whether
it is ready to merge.

## Workflow

### 1. Gather the PR basics

Use the GitHub MCP tools to fetch:

- the PR metadata: title, body, author, base/head refs, mergeable state,
- the changed files list and the diff (or per-file patches),
- the current review/comment threads,
- the CI status of the head commit (Actions runs).

### 2. Read the diff for substance

Review per file:

- correctness (logic, edge cases, error handling),
- consistency with the surrounding code and repo conventions,
- tests: are there new/changed tests? do they cover the change?
- risk: hidden behavior changes, config/tooling drift, vendored deps.

Quote specific lines when raising issues. Do not paraphrase the diff into a
summary without evaluating it.

### 3. Check the surrounding signals

- CI: which runs failed, and did the failure look related to the change?
- Review threads: are prior comments addressed? is anything blocking?
- Linked issues: does the PR actually close/fix what it claims?

### 4. Produce the review

Structure:

- **Summary**: what the PR does, in one or two sentences.
- **Findings**, each with: location (file/line), severity (blocker / should-fix /
  nit), and a concrete suggestion.
- **CI/test note**: state (green/failing) with the failing run names.
- **Verdict**: approve / changes requested / comment, matching the evidence.

### 5. Act only when asked

Commenting, approving, or requesting changes on the PR are **write** actions.
Only perform them when the user explicitly asks; otherwise deliver the review as
a response. Never merge, close, or edit a PR unprompted.

