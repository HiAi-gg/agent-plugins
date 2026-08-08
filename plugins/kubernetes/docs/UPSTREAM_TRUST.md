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
| Maintenance evidence | Versioned npm releases (0.0.65/0.0.66 at pin time); active repo; documented read-only mode |
| Authentication model | Uses ambient kubeconfig/current context; no credentials in the plugin |
| Write capabilities | Read-only mode exposes only read-annotated tools (verified: 14 tools, no mutation tools) |
| Known limitations | Requires kubeconfig; single cluster in this config; community (not official Kubernetes/CNCF) upstream |
| Verification date | 2026-08-07 |

Runtime verification: `RUNTIME_VERIFIED` + `SECURITY_VERIFIED` — initialize,
tools/list (14 read-only tools), pods_list, pods_get, pods_log, events_list,
and confirmed no mutation tools exist under `--read-only`.
