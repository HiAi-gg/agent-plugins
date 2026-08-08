---
name: inspect-design-context
description: "Extract design context from a Figma file through the official Figma MCP: design tokens, variables, components, and layout structure for a selected frame or node. Use when implementing a design, checking design tokens, or understanding a Figma screen's structure."
---

# Inspect Design Context from Figma

Use this skill when an agent needs structured design context from a Figma
file — tokens, variables, components, and layout — to implement or verify a
design.

## Context

The Figma MCP server provides design context tools such as
`get_design_context` (structured representation of a selection) and
`get_variable_defs` (variables/styles: color, spacing, typography). Figma's
own plugin skills (e.g. in Claude Code/Cursor) cover client-specific flows;
this skill is the portable workflow.

## Workflow

### 1. Get the file/node reference

- Ask the user for the Figma file link (or a frame/layer link).
- The client extracts the node id from the link; the MCP server identifies the
  object from it. Confirm which node you are targeting.

### 2. Pull the structured context

- Fetch the design context for the node (`get_design_context`): the structured
  representation of the selection.
- Fetch variables/definitions (`get_variable_defs`): colors, spacing,
  typography tokens used in the selection.
- If the response is too large or truncated, fetch high-level metadata first,
  then re-fetch only the needed nodes.

### 3. Organize the context

Extract:

- **Tokens**: color, spacing, radius, typography variables with names/values.
- **Components**: which components are used and where.
- **Layout**: auto-layout structure, nesting, responsive intent.
- **Assets**: images/SVGs referenced by the selection.

### 4. Report

Give a structured summary: the node, its tokens, components, layout, and
assets — enough to implement the design faithfully. Note anything missing or
ambiguous (unnamed layers, missing variables) rather than guessing.

## Guardrails

- Read operations only (fetching context). Figma MCP can write to the canvas —
  this skill never writes; it only reads design context.
- Keep responses bounded; do not dump entire large selections.

