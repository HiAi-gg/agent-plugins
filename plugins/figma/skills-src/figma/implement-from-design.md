---
name: implement-from-design
description: Implement a UI from a Figma design: fetch design context, map to the project's framework and design system, and verify against the design. Use when the user provides a Figma link and asks for the implementation.
license: MIT
compatibility: Requires the figma MCP server configured in this plugin (streamable-http https://mcp.figma.com/mcp) with OAuth completed in the client, plus the project's framework/design system.
metadata:
  plugin: figma
  kind: implementation
---

# Implement a UI from a Figma Design

Use this skill when an agent must turn a Figma design into code in the user's
project.

## Workflow

### 1. Get the design context

- Obtain the Figma link and extract the target node.
- Fetch the design context and variable definitions (see
  `inspect-design-context`): structure, tokens, components, assets.
- Fetch a screenshot of the node if available — a visual reference is required
  for faithful implementation.

### 2. Establish the project conventions

- Identify the framework and styling system (React/Vue/…, Tailwind/CSS
  modules/…).
- Identify the design system in code: existing components, tokens, layout
  primitives, naming patterns. Prefer reusing existing components over
  duplicating them.

### 3. Implement

- Treat the Figma MCP output (often React + Tailwind shaped) as a
  **representation** of the design, not final code style.
- Map tokens to the project's token system; reuse existing components;
  respect the project's routing/state/data patterns.
- Keep assets from the Figma payload rather than importing new icon packages.
- Avoid hardcoded values where design tokens exist.

### 4. Verify against the design

- Compare the result to the Figma screenshot for 1:1 look and behavior.
- Check spacing, colors, typography, and responsive behavior against the
  design intent.
- If something is off, re-fetch the specific node's context rather than
  guessing.

### 5. Report

Give: what was implemented, which components/tokens were reused, any deviations
from the design and why, and what remains unverified. Break large screens into
components; do not attempt a whole screen at once when it risks errors.

## Guardrails

- This workflow writes **code**, not Figma. Do not use Figma write tools unless
  the user explicitly asks to modify the Figma file.
- Do not hardcode values that should be design tokens.
- If the selection is too large, chunk it.
