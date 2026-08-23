#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <checked-in-plugin> <generated-plugin>" >&2
  exit 2
fi

CHECKED="$1"
GENERATED="$2"

for root in "$CHECKED" "$GENERATED"; do
  if [ ! -f "$root/plugin.json" ]; then
    echo "Missing plugin.json: $root" >&2
    exit 1
  fi
done

diff -u "$CHECKED/plugin.json" "$GENERATED/plugin.json"

if [ -f "$CHECKED/mcp.json" ] || [ -f "$GENERATED/mcp.json" ]; then
  if [ ! -f "$CHECKED/mcp.json" ] || [ ! -f "$GENERATED/mcp.json" ]; then
    echo "mcp.json presence differs between checked-in and generated output" >&2
    exit 1
  fi
  diff -u "$CHECKED/mcp.json" "$GENERATED/mcp.json"
fi

list_skills() {
  local root="$1"
  if [ -d "$root/skills" ]; then
    (cd "$root" && find skills -type f -name SKILL.md | LC_ALL=C sort)
  fi
}

diff -u <(list_skills "$CHECKED") <(list_skills "$GENERATED")
while IFS= read -r skill; do
  [ -n "$skill" ] || continue
  diff -u "$CHECKED/$skill" "$GENERATED/$skill"
done < <(list_skills "$CHECKED")
