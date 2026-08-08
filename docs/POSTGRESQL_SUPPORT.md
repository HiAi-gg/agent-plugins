# PostgreSQL Support

The PostgreSQL plugin (`plugins/postgresql`) is the only product plugin with a
bundled HiAI-maintained MCP. This page documents the supported version
matrix and the compatibility policy.

## Summary

```
PostgreSQL 14–18 tested (stable supported lines)
PostgreSQL 19 beta compatibility tested (pre-release; NOT production-supported)
```

## Version matrix

| PostgreSQL | Status | Runtime | Security | Notes |
|---|---|---|---|---|
| 14 | TESTED | Full suite | 19/19 gate | older supported major |
| 15 | TESTED | Full suite | 19/19 gate | |
| 16 | TESTED | Full suite | 19/19 gate | current stable major |
| 17 | TESTED | Full suite | 19/19 gate | |
| 18 | TESTED | Full suite | 19/19 gate | current stable major; first-class support |
| 19 (beta) | BETA TESTED | Diagnostic suite | 19/19 gate | experimental compatibility target |

Exact tested versions are recorded in `plugins/postgresql/docs/COMPATIBILITY.md`.

## Policy

- **PG14–PG18** are supported/tested stable versions.
- **PG19** is a pre-release compatibility target. Do not call PostgreSQL 19
  production-supported until PG19 reaches GA and the final compatibility
  suite is rerun against the GA release (see `docs/RELEASES.md`).
- The plugin does **not** claim "supports PostgreSQL 14–19" as a blanket
  statement while 19 is still pre-release.

## Version capability layer

The MCP uses a single codebase across majors, with capability detection
rather than per-major forks:

```text
server version → detected capabilities → diagnostic query/tool behavior
```

Capabilities include `supportsExplainMemory`, `supportsExplainIO`,
`pgStatStatementsAvailable`, and `monitoringColumnsAvailable`. PG19-only
EXPLAIN options (MEMORY, IO) are not enabled by default in cross-version
workflows.

## pg_stat_statements

Optional across every version. The plugin works when it is installed, not
installed, not preloaded, or not accessible to the current role. It never
auto-installs it and returns capability information instead of failing.
