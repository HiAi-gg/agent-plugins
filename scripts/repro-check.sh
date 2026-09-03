#!/usr/bin/env bash
# Regenerate every plugin from its plugin.yml and compare structural output.
# Fails on unexpected drift.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$HERE")"
TMP_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/agent-plugins-repro.XXXXXX")"
trap 'rm -rf "$TMP_ROOT"' EXIT

fail=0
for p in "$ROOT"/plugins/*/; do
  name=$(basename "$p")
  generated="$TMP_ROOT/$name"
  bunx @hiai-gg/agent-plugins-builder@0.1.0 create \
    --config "$p/plugin.yml" \
    --output "$generated" >/dev/null 2>&1 || { echo "FAIL(gen) $name"; fail=1; continue; }

  if bash "$HERE/compare-generated-plugin.sh" "$p" "$generated"; then
    echo "OK $name"
  else
    echo "DRIFT $name"
    fail=1
  fi
done

echo
if [ "$fail" = "0" ]; then echo "REPRODUCIBILITY: all 13 clean"; else echo "REPRODUCIBILITY: FAILURES"; fi
exit $fail
