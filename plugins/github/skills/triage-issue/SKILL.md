---
name: triage-issue
description: "Triage GitHub issues in a repository: classify, prioritize, deduplicate, and route them with evidence. Use when asked to sort an issue backlog, identify duplicates, label issues, or decide what to work on next."
---

# Triage GitHub Issues

Use this skill when an agent must work through an issue backlog: classify,
prioritize, find duplicates, or recommend labels.

## Workflow

### 1. Scope the set

- Define the query: repository, label/state filters, sort (e.g. oldest first,
  most commented, most recent).
- Fetch the issue list. Keep the working set bounded (e.g. top 50 by the chosen
  sort) and say what you are looking at.

### 2. Classify each issue

For each issue record:

- **Type**: bug / feature / docs / question / other (from title + body + labels).
- **Severity signal**: crash/data-loss wording, affected-version mentions, or
  "critical"/"urgent" in labels.
- **Reproducibility**: does the body include steps, environment, or logs?
- **Actionability**: is it self-contained, or does it need maintainer input?

### 3. Deduplicate

- Compare titles and body keywords across the set; group likely duplicates.
- For each candidate duplicate pair, state the evidence (same stack trace,
  same feature wording, same file references) — do not merge or close anything
  without explicit instruction.

### 4. Recommend labels and priorities

Propose labels (bug, enhancement, good-first-issue, triage-needed, …) and a
priority ordering. Base priority on: user impact × affected-user count ×
maintainer effort. Label assignment is a **write** action — only apply labels
when the user asks.

### 5. Report

Give a compact table or list: each issue (id + title), its classification, the
recommended labels/priority, and any duplicate grouping. Separate "observed"
from "recommended".

