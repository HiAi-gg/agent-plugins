# BUILD_NOTES — kubernetes

## Product rationale

Kubernetes inspection/diagnostics (pods, resources, events, logs, health) is a
high-value agent workflow. The `containers/kubernetes-mcp-server` provides a
read-only-capable MCP server; this plugin pairs it with workflow skills.

## Architecture

```
kubernetes-mcp-server@0.0.65 (stdio, pinned, --read-only --disable-multi-cluster)
+ 3 Agent Skills (diagnose-pod, review-cluster, explain-kubernetes-resource)
```

## Upstream (Trust B)

`kubernetes-mcp-server` is a **trusted community** Kubernetes MCP server from
the `containers` project (Red Hat ecosystem). Per the mission, Kubernetes is
the only pre-approved Trust B category. It is **not** described as an official
Kubernetes/CNCF MCP anywhere in this plugin. See docs/UPSTREAM_TRUST.md.

## Alternatives rejected

- Official CNCF MCP — none exists.
- Other community kubectl MCP servers — not reviewed; the `containers` server
  is the pre-approved Trust B choice.

## Skill decisions

- `diagnose-pod` — pod failure diagnosis.
- `review-cluster` — cluster/namespace health review.
- `explain-kubernetes-resource` — resource explanation.
- All read-first; consistent with the read-only server.

## Runtime testing (disposable cluster)

Verified against a disposable k3s cluster (rancher/k3s v1.31.2 in Docker):

```
initialize       OK (v0.0.65)
tools/list       14 tools; all read-only (no create/delete/update/apply)
pods_list        real pods returned
pods_get         pod details returned
pods_log         nginx logs returned
events_list      cluster events returned
mutation tools   NONE (read-only enforced)
```

Status: **RUNTIME_VERIFIED**, **SECURITY_VERIFIED** (mutation paths absent).

## Limitations

- Requires kubeconfig/current context.
- Single cluster (`--disable-multi-cluster`).
- Trusted community upstream, not official.
