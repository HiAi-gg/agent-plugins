#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPARE="$HERE/compare-generated-plugin.sh"
TMP_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/agent-plugins-compare-test.XXXXXX")"
trap 'rm -rf "$TMP_ROOT"' EXIT

make_fixture() {
  local root="$1"
  mkdir -p "$root/checked/skills/example" "$root/generated/skills/example"
  printf '{"name":"example"}\n' >"$root/checked/plugin.json"
  cp "$root/checked/plugin.json" "$root/generated/plugin.json"
  printf '%s\n' '# Example' >"$root/checked/skills/example/SKILL.md"
  cp "$root/checked/skills/example/SKILL.md" "$root/generated/skills/example/SKILL.md"
}

expect_failure() {
  local label="$1"
  local checked="$2"
  local generated="$3"
  if bash "$COMPARE" "$checked" "$generated" >/dev/null 2>&1; then
    echo "FAIL: $label was accepted"
    exit 1
  fi
}

clean="$TMP_ROOT/clean"
make_fixture "$clean"
bash "$COMPARE" "$clean/checked" "$clean/generated"

changed="$TMP_ROOT/changed"
make_fixture "$changed"
printf '%s\n' '# Changed' >"$changed/generated/skills/example/SKILL.md"
expect_failure "changed skill content" "$changed/checked" "$changed/generated"

extra="$TMP_ROOT/extra"
make_fixture "$extra"
mkdir -p "$extra/generated/skills/extra"
printf '%s\n' '# Extra' >"$extra/generated/skills/extra/SKILL.md"
expect_failure "extra generated skill" "$extra/checked" "$extra/generated"

missing="$TMP_ROOT/missing"
make_fixture "$missing"
rm "$missing/generated/skills/example/SKILL.md"
expect_failure "missing generated skill" "$missing/checked" "$missing/generated"

mcp="$TMP_ROOT/mcp"
make_fixture "$mcp"
printf '{"mcpServers":{}}\n' >"$mcp/checked/mcp.json"
expect_failure "one-sided mcp.json" "$mcp/checked" "$mcp/generated"

echo "PASS: reproducibility comparison regressions"
