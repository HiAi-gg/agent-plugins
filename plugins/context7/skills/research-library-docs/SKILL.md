---
name: research-library-docs
description: Look up current, authoritative documentation for a library or framework before implementing with it. Use when about to use an unfamiliar library, a fast-changing API, or when configuration behavior is uncertain.
---

# Research Library Documentation

Use this skill when an agent is about to implement with a library, framework, or
tool it is not confident about, or when the API may have changed since the
agent's training.

## When to consult Context7

Do query Context7 **before**:

- implementing with an unfamiliar library or SDK,
- using a fast-changing API (UI frameworks, cloud SDKs, build tools),
- guessing configuration options or setup steps,
- relying on API knowledge that might be outdated.

Do **not** make excessive calls for:

- stable, general programming questions (control flow, algorithms),
- well-known core language/stdlib behavior,
- when the user explicitly says not to.

## Workflow

### 1. Identify the package

- Confirm the exact package/library name (npm, PyPI, crates.io, Maven, Go…).
- If unsure of the ecosystem, state it and let Context7 resolve the package
  name.

### 2. Query the docs

- Use the Context7 tools to fetch documentation for the package and version in
  question.
- Prefer version-pinned queries when the project pins a version; otherwise get
  the current stable docs.
- Keep queries focused: the specific API/feature you need, not the whole doc.

### 3. Extract what you need

- Read the relevant sections: setup/installation, the API surface you will use,
  configuration, and any version-specific notes (breaking changes, deprecations).
- Note the doc version/date so you can state how current the information is.

### 4. Apply and verify

- Implement against what the docs say.
- If the doc conflicts with existing code in the repo, prefer the repo's pinned
  version and flag the discrepancy rather than silently changing behavior.

### 5. Report

State: the package and version you consulted, the key facts you applied, and any
uncertainties (e.g. "docs for v5, project pins v4 — checked both").

