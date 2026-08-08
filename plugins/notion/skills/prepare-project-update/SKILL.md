---
name: prepare-project-update
description: "Draft a project update for Notion: gather the current state, structure the update content, and prepare it for the user to review before any content is created or modified. Use when the user wants to post or update a project status page."
---

# Prepare a Project Update

Use this skill when an agent must draft a project update for a Notion page.

## Important

Creating or updating Notion content is a **write** operation. This skill
defaults to **preparing the update for review** — it only creates/updates the
page when the user explicitly confirms.

## Workflow

### 1. Gather the current state

- Read the project's current status page and recent updates (`summarize-project`
  provides the state).
- Collect the changes since the last update: completed items, decisions,
  blockers, next steps.

### 2. Draft the update

Structure the draft:

- **Status line**: on track / at risk / blocked + one sentence.
- **Completed since last update**: bullet list with dates.
- **In progress / next**: what is being worked on and what is next.
- **Blockers/risks**: anything needing attention.
- **Decisions made**: brief.

Match the project's existing page structure (headings, to-do blocks, database
rows) so the update fits in cleanly.

### 3. Present for review

- Show the full draft to the user: the exact content and where it would go
  (append to the page, replace a section, add a row to a database).
- Note any data the draft references (task counts, owners) and their sources.

### 4. Apply only on confirmation

- Only after explicit user confirmation, create/update the Notion content
  (append blocks, update the page, or add the database row).
- Report what was created/modified and where.

## Guardrails

- Default to drafting only; never write to Notion without explicit user
  confirmation.
- Do not fabricate status (completed items, dates) — only include what the
  gathered state supports.

