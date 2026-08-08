# UPSTREAM_TRUST — kubernetes

| Field | Value |
|---|---|
| Upstream project | kubernetes-mcp-server |
| Upstream owner | containers project (Red Hat ecosystem) |
| Repository | https://github.com/containers/kubernetes-mcp-server |
| License | Apache-2.0 |
| Trust level | **TRUST B — Established Community** (the only pre-approved Trust B category) |
| Selected version | `kubernetes-mcp-server@0.0.65` (pinned) |
| Why trusted | Meaningful adoption; active maintenance; releases; multiple contributors/maintainers; clear Apache-2.0 license; CI/tests; credible security posture (`--read-only`); runtime-verified by us against a disposable cluster |
| Upstream latest | `0.0.66` (2026-07-31) — deliberately **not** adopted; see pin decision below |
| Maintenance evidence | Versioned npm releases (0.0.65/0.0.66 at pin time); active repo; documented read-only mode |
| Authentication model | Uses ambient kubeconfig/current context; no credentials in the plugin |
| Write capabilities | Read-only mode exposes only read-annotated tools (verified: 14 tools, no mutation tools) |
| Known limitations | Requires kubeconfig; single cluster in this config; community (not official Kubernetes/CNCF) upstream |
| Verification date | 2026-08-07 |

Runtime verification: `RUNTIME_VERIFIED` + `SECURITY_VERIFIED` — initialize,
tools/list (14 read-only tools), pods_list, pods_get, pods_log, events_list,
and confirmed no mutation tools exist under `--read-only`.

## Pin decision — 0.0.65 retained over 0.0.66 (reviewed 2026-08-08)

**Decision: KEEP `0.0.65`.**

| Input | Finding |
|---|---|
| Upstream latest | `0.0.66`, published 2026-07-31 |
| Breaking change | **Yes** — `feat!(mcp): add 2026-07-28 spec support` (PR #1254); `feat!` is an explicit breaking marker |
| Security fixes in 0.0.66 | `fix(http): reject unknown wellknown paths in proxy` (#1316), `fix(http): use const url instead of user provided url in wellknown proxy` (#1323), `feat(tls): TLS_MIN_VERSION / TLS_CIPHER_SUITES` (#1270) |
| Do those fixes affect us? | **No** — all are in the **HTTP transport / wellknown proxy** surface. This plugin runs the server over **stdio**, so the affected code paths are unreachable in this configuration |
| Published advisories | None — GitHub Security Advisories for the repo: empty; OSV query for `npm/kubernetes-mcp-server@0.0.65`: no vulnerabilities |
| Read-only gate | Verified on `0.0.65` only; not re-verified on `0.0.66` |

Rationale: adopting a protocol-revision breaking release would invalidate the
`SECURITY_VERIFIED` evidence backing the read-only guarantee, in exchange for
fixes that do not reach the stdio configuration this plugin ships. Stability
of the verified read-only gate wins.

**Re-evaluation trigger** (upstream backports security fixes only into the
latest release, so the pin is not free):

1. Any CVE/GHSA/OSV advisory affecting `0.0.65` on the stdio surface.
2. Any advisory in the read-only tool-gating logic itself.
3. Routine re-review at the next collection release.

On trigger: move the pin in `plugin.yml`, regenerate via the Builder, and
re-run the read-only verification (tools/list must show no
create/delete/update/apply tools) before shipping.
