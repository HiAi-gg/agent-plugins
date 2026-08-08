---
name: summarize-project
description: "Summarize a project from its Notion pages: gather the project's pages and databases, extract status, decisions, and open items, and produce a concise project summary. Use when asked for a project status update or overview from Notion."
---

# Summarize a Project from Notion

Use this skill when an agent must produce a project overview from Notion
content.

## Workflow

### 1. Locate the project's content

- Search for the project name; identify its main page, subpages, and
  databases (tasks, decisions, meetings).
- Confirm the set of pages that constitute "the project" with the user if
  ambiguous.

### 2. Gather the state

- Read the project main page: goal, status, milestones.
- Read the task/issue database (if any): open vs done counts, current
  milestone, blockers.
- Read decision/meeting pages: recent decisions, action items, risks.

### 3. Extract the summary

Build the summary:

- **Goal & status**: one-line purpose; overall status (on track / at risk /
  blocked) with the evidence.
- **Progress**: completed vs remaining (from the task database counts).
- **Decisions & open items**: recent decisions; open action items with
  owners.
- **Risks/blockers**: anything flagged in the content.

### 4. Report

Give: the concise project summary with the evidence cited per section (which
page/database each fact came from). Flag anything not found in Notion (e.g.
"no task database found"). This is read-only summarization — do not create or
modify content.

## Guardrails

- Read-only; no content creation/updates.
- Cite the source page/database per claim.

