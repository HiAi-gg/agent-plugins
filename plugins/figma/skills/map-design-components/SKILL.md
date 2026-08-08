---
name: map-design-components
description: "Map the components in a Figma file to the project's code components: identify reusable components, their properties, and where they are used. Use when building a design system, checking component coverage, or planning which components to extract or reuse."
---

# Map Figma Components to Code

Use this skill when an agent must connect Figma components to code components —
for a design system, for Code Connect-style reuse, or for coverage planning.

## Workflow

### 1. Inventory the Figma components

- Fetch the component structure of the file: component sets, variants,
  properties.
- Identify the design system components: buttons, inputs, cards, icons, etc.
- Note which are used in the target frames.

### 2. Inventory the code components

- List the project's existing UI components (e.g. `src/components/ui`).
- For each Figma component, find the matching code component (by name,
  structure, or usage).

### 3. Build the mapping

Create a table: Figma component → code component → gap?

- **Matched**: Figma component has a code equivalent (note property mapping:
  variants ↔ props, tokens ↔ CSS variables).
- **Gap**: Figma component with no code equivalent (candidate to implement or
  remove from the design).
- **Orphan**: code component with no Figma equivalent (candidate to remove or
  add to the design).

### 4. Report

Give: the mapping table, the property/token correspondence, and the gaps with
recommendations (implement, reuse via Code Connect, or align naming).
This is analysis — creating components in Figma or code requires explicit user
intent.

## Guardrails

- Read-only: fetch Figma data, do not write to the canvas or create code
  components without explicit intent.
- Base the mapping on evidence (names, structure, usage), not guesses.

