---
name: explore-repository
description: Produce a structured read-only review of a GitHub repository: purpose, structure, health signals, dependencies, and contribution state. Use when onboarding to an unfamiliar repository, evaluating a repo for adoption, or preparing a summary for another agent or person.
license: MIT
compatibility: Requires the github MCP server (GitHub Copilot-hosted, OAuth via client) and read access to the target repository.
metadata:
  plugin: github
  kind: repository-review
---

# Explore a Repository

Use this skill when an agent needs a reliable, structured picture of a GitHub
repository.

## Workflow

### 1. Repository identity

- Fetch repo metadata: description, default branch, language, license,
  stars/forks (public), last push, archived status.
- Note the default branch name and whether the repo looks maintained.

### 2. Structure and content

- List the top-level tree: entry points (README, docs, packages), build config,
  CI workflows.
- Identify the language stack and package manager from manifests
  (package.json, Cargo.toml, pyproject.toml, go.mod, …).
- Read the README for the stated purpose; compare it with what the tree
  actually suggests.

### 3. Health signals

- Open issues vs closed, and the stale/unaddressed ratio.
- Recent activity: commit cadence on the default branch (last few weeks).
- CI: are workflows present, and do recent runs pass?
- Dependencies: any obviously outdated or pinned-forever manifests, vendored
  code, or license gaps.
- Governance: CONTRIBUTING, CODE_OF_CONDUCT, SECURITY policy present?

### 4. Contribution state

- For contribution questions: open PRs, their age, and whether the
  contribution workflow (tests, lint, CLA) is documented.
- For adoption questions: license, release cadence (tags/releases), and
  maintenance signals.

### 5. Report

Give a compact review: purpose, stack, structure overview, health bullet list
with evidence (issue counts, activity window, CI state), and any red flags.
Keep it read-only — do not open issues, create branches, or star/fork anything
unless explicitly asked.
