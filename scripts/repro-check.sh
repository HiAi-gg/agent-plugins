#!/usr/bin/env bash
# Regenerate every plugin from its plugin.yml and compare structural output.
# Fails on unexpected drift.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$HERE")"

fail=0
for p in "$ROOT"/plugins/*/; do
  name=$(basename "$p")
  rm -rf "/tmp/repro-$name"
  bunx @hiai-gg/agent-plugins-builder create \
    --config "$p/plugin.yml" \
    --output "/tmp/repro-$name" >/dev/null 2>&1 || { echo "FAIL(gen) $name"; fail=1; continue; }

  ok=1
  diff "/tmp/repro-$name/plugin.json" "$p/plugin.json" >/dev/null || { echo "DRIFT plugin.json $name"; ok=0; }
  if [ -f "$p/mcp.json" ]; then
    diff "/tmp/repro-$name/mcp.json" "$p/mcp.json" >/dev/null || { echo "DRIFT mcp.json $name"; ok=0; }
  fi
  n1=$(find "/tmp/repro-$name/skills" -name SKILL.md 2>/dev/null | wc -l)
  n2=$(find "$p/skills" -name SKILL.md 2>/dev/null | wc -l)
  if [ "$n1" != "$n2" ]; then echo "DRIFT skills-count $name ($n1 vs $n2)"; ok=0; fi

  if [ "$ok" = "1" ]; then echo "OK $name"; else fail=1; fi
  rm -rf "/tmp/repro-$name"
done

echo
if [ "$fail" = "0" ]; then echo "REPRODUCIBILITY: all 13 clean"; else echo "REPRODUCIBILITY: FAILURES"; fi
exit $fail
