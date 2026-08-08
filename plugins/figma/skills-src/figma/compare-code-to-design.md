---
name: compare-code-to-design
description: Compare implemented UI code against its Figma design: fetch the design context and screenshot, inspect the implementation, and report visual/behavioral differences. Use when a feature was built from a design and needs verification, or when design and implementation drift.
license: MIT
compatibility: Requires the figma MCP server configured in this plugin (streamable-http https://mcp.figma.com/mcp) with OAuth completed in the client, plus access to the implementation.
metadata:
  plugin: figma
  kind: verification
---

# Compare Code to Design

Use this skill when an agent must verify that an implementation matches its
Figma design.

## Workflow

### 1. Gather both sides

- **Design side**: fetch the design context (structure, tokens) and a
  screenshot of the Figma node.
- **Code side**: read the implemented component/page and, if possible, render
  or inspect it (e.g. via a browser tool).

### 2. Compare systematically

Check in this order:

- **Layout**: spacing, alignment, nesting, responsive behavior vs auto-layout.
- **Colors & typography**: values used in code vs the design tokens; flag
  hardcoded values that should be tokens.
- **Components**: does the code reuse the mapped component (see
  `map-design-components`) or duplicate it?
- **Behavior**: interactions the design implies (states, hover, empty states)
  vs what the code does.
- **Assets**: are the images/SVGs from the Figma payload used, or placeholders?

### 3. Classify differences

- **Mismatch**: clear deviation from the design (wrong color, spacing, missing
  element) — list with severity.
- **Intentional**: difference justified by the project (design token
  overrides, framework constraints) — note it as acceptable with reason.
- **Unverifiable**: cannot be compared from available evidence (e.g. no
  screenshot) — state the gap.

### 4. Report

Give: the comparison table (dimension, design, code, verdict), the actionable
mismatches ranked by impact, and the recommended fixes. Do not modify the
implementation or the Figma file as part of the review.

## Guardrails

- Read-only review; no code or Figma mutations.
- Base every verdict on evidence (token values, screenshots), not guesses.
