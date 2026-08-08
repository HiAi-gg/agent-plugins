# Collection Release Report — HiAi-gg/agent-plugins

Date: 2026-08-08.
Builder: `@hiai-gg/agent-plugins-builder` **0.0.8** (public npm package).
Agent Plugins specification: **1.0.0** (Working Draft).

## 1. Final repository tree

```
agent-plugins/
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── SECURITY.md
├── CODE_OF_CONDUCT.md
├── CHANGELOG.md
├── AGENTS.md
├── .gitignore
├── .editorconfig
├── .env.example
├── .github/
│   ├── workflows/
│   │   ├── validate.yml
│   │   └── release-check.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   └── feature_request.yml
│   └── pull_request_template.md
├── docs/
│   ├── COMPATIBILITY.md
│   ├── TRUST_POLICY.md
│   ├── DEVELOPMENT.md
│   ├── RELEASES.md
│   └── POSTGRESQL_SUPPORT.md
├── scripts/
│   ├── repro-check.sh
│   ├── pg-matrix.sh
│   ├── matrix-suite.mjs
│   ├── security-gate.mjs
│   └── validate_plugin.py
└── plugins/
    ├── github/  ├── agent-browser/  ├── context7/  ├── firecrawl/
    ├── redis/   ├── sentry/         ├── supabase/  ├── figma/
    ├── cloudflare/ ├── notion/      ├── docker/    ├── kubernetes/
    └── postgresql/
```

## 2. Exactly 13 active plugins

github, agent-browser, context7, firecrawl, redis, sentry, supabase, figma,
cloudflare, notion, docker, kubernetes, postgresql — confirmed 13 directories
under `plugins/`. No archived plugin appears in the active table.

## 3. Builder version used

`@hiai-gg/agent-plugins-builder` **0.0.8** — verified via
`bunx @hiai-gg/agent-plugins-builder --version`. All plugins carry
`docs/BUILDER_PROVENANCE.md` recording the version and config.

## 4. Validation status for every plugin

| Plugin | Builder | Official schemas |
|---|---|---|
| github | ✓ | ✓ |
| agent-browser | ✓ | ✓ |
| context7 | ✓ | ✓ |
| firecrawl | ✓ | ✓ |
| redis | ✓ | ✓ |
| sentry | ✓ | ✓ |
| supabase | ✓ | ✓ |
| figma | ✓ | ✓ |
| cloudflare | ✓ | ✓ |
| notion | ✓ | ✓ |
| docker | ✓ | ✓ |
| kubernetes | ✓ | ✓ |
| postgresql | ✓ | ✓ |

All 13 pass `bunx @hiai-gg/agent-plugins-builder package --dry-run` and
independent official 1.0.0 schema validation.

## 5. Runtime status for every plugin

| Plugin | Runtime status |
|---|---|
| github | Config verified / user auth required (OAuth) |
| agent-browser | Runtime verified (CLI 0.31.1 full workflow) |
| context7 | Runtime verified (real docs lookup) |
| firecrawl | Runtime verified (keyless search) |
| redis | Runtime verified (live Redis) |
| sentry | Config verified / user auth required |
| supabase | Config verified (handshake + tools; project URL required) |
| figma | Config verified / user auth required |
| cloudflare | Config verified / user auth required |
| notion | Config verified / user auth required |
| docker | Skills-only |
| kubernetes | Runtime verified (read-only gate on k3s) |
| postgresql | Runtime verified (PG 14–19 beta) |

## 6. PostgreSQL version matrix

| PostgreSQL | Runtime | Security |
|---|---|---|
| 14 | 13/13 tools | 19/19 gate |
| 15 | 13/13 tools | 19/19 gate |
| 16 | 13/13 tools | 19/19 gate |
| 17 | 13/13 tools | 19/19 gate |
| 18 | 13/13 tools | 19/19 gate |
| 19 beta2 (alpine) | 13/13 tools | 19/19 gate |

## 7. PG18 runtime/security result

**PASS.** Full 13-tool suite + 19/19 security gate on PostgreSQL 18 (alpine).
Extended checks: pg_stat_statements enabled (top statements), pss not
accessible to role (graceful), permission-limited user (reads allowed rows),
credential redaction (0 leaks), statement_timeout (pg_sleep cancelled),
result limits (`truncated: true`).

## 8. PG19 beta runtime/security result

**PASS (experimental).** PostgreSQL 19 beta2 (alpine): 13/13 tools + 19/19
gate. Version-sensitive views and EXPLAIN behaved identically in the tested
surface. PG19-only EXPLAIN options (MEMORY, IO) not enabled in default
cross-version workflows; the MCP uses capability detection, not per-major
forks. PG19 is a pre-release compatibility target, not production-supported;
GA follow-up is documented in `docs/RELEASES.md`.

## 9. Remaining OAuth-based limitations

github, sentry, figma, cloudflare, notion use vendor-hosted remote MCP
endpoints requiring interactive OAuth — runtime is `AUTH_RUNTIME_REQUIRES_USER`
and cannot be exercised in CI. supabase requires a per-project URL
(client-configured). These are documented per-plugin and in
`docs/COMPATIBILITY.md`; no plugin claims runtime verification it lacks.

## 10. Repository hygiene issues removed

- Removed `node_modules` from `plugins/postgresql/packages/postgres-mcp`.
- Confirmed no `.tgz`/`.zip`/logs/`.DS_Store`/temp reports in the tree.
- Confirmed no absolute local paths (`/mnt/ai_data`) in plugin configs/docs.
- Blind-test artifacts (BUILDER_ISSUES.md, BUILDER_TEST_REPORT.md,
  PLUGIN_MARKET_NOTES.md) are NOT part of this repository.
- `.gitignore` excludes build output, env files, archives, and temp files
  while keeping plugin distribution artifacts (plugin.json, plugin.yml,
  mcp.json, SKILL.md) and the postgresql package `bun.lock` committed.

## 11. Files intentionally retained

- All 13 plugin directories with their canonical files
  (plugin.yml, plugin.json, mcp.json where applicable, skills/, docs/,
  README, CHANGELOG, LICENSE).
- `skills-src/<plugin>/` — the skill source bodies required for Builder
  reproducibility.
- `scripts/` — repro-check.sh, pg-matrix.sh, matrix-suite.mjs,
  security-gate.mjs, validate_plugin.py.
- Root docs (COMPATIBILITY, TRUST_POLICY, DEVELOPMENT, RELEASES,
  POSTGRESQL_SUPPORT) and root policies (AGENTS, CONTRIBUTING, SECURITY,
  CODE_OF_CONDUCT, CHANGELOG, LICENSE, .editorconfig, .env.example).
- CI workflows (validate.yml static; release-check.yml scheduled).

## 12. Final verdict

**GO** — the collection is ready to publish as `HiAi-gg/agent-plugins`.
13 product plugins, reproducible through Builder 0.0.8, validated against the
official 1.0.0 schemas, PostgreSQL 14–18 fully tested plus 19 beta
compatibility-tested, no secrets, no debris, no misleading compatibility
claims.
