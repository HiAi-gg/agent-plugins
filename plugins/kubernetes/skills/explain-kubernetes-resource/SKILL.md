---
name: explain-kubernetes-resource
description: Explain what a Kubernetes resource does, how its spec maps to runtime objects, and how workloads relate (Deployments, Services, Ingress, ConfigMaps, Secrets, PVCs). Use when the user asks what a YAML manifest means, what a resource does, or how objects connect.
---

---
name: explain-kubernetes-resource
description: Explain what a Kubernetes resource does, how its spec maps to runtime objects, and how workloads relate (Deployments, Services, Ingress, ConfigMaps, Secrets, PVCs). Use when the user asks what a YAML manifest means, what a resource does, or how objects connect.
license: MIT
compatibility: Requires the kubernetes MCP server configured in this plugin (kubernetes-mcp-server@0.0.65, --read-only) or kubectl with access to the cluster; can also work from manifest files alone.
metadata:
  plugin: kubernetes
  kind: understanding
---

# Explain a Kubernetes Resource

Use this skill when the user points at a manifest or resource name and wants to
understand what it does and how it fits together.

## Workflow

### 1. Get the resource

Prefer the live object with `-o yaml` so output reflects reality, and cross-check
against the source manifest when both exist:

```bash
kubectl get <kind> <name> -n <ns> -o yaml
```

Kinds to cover: `deploy`, `sts`, `ds`, `svc`, `ingress`, `configmap`, `secret`,
`pvc`, `networkpolicy`, `serviceaccount`, `role`/`rolebinding` (namespaced) and
their cluster-scoped counterparts (`clusterrole`, `clusterrolebinding`, `ns`).

### 2. Explain the spec section by section

For a workload:

- `spec.replicas` + `spec.strategy` (Recreate vs RollingUpdate).
- `spec.selector` and `template.metadata.labels` — the label wiring that
  connects workloads to Services.
- `spec.template.spec` — containers, images, ports, resources (requests/limits),
  probes (`livenessProbe`, `readinessProbe`, `startupProbe`), env and
  `envFrom` (ConfigMap/Secret references), volumes and mounts, `securityContext`.

For a Service/Ingress:

- `type` (ClusterIP/NodePort/LoadBalancer) and `ports` — how traffic maps to
  targetPort.
- `spec.selector` — which pods the Service routes to.
- Ingress host/path → service/port routing.

### 3. Trace the wiring

Answer concretely:

- Which pods does this Service select? (`kubectl get endpoints <svc> -n <ns>`)
- Which ConfigMap/Secret does the workload consume?
- Does the Deployment's image tag match what is running?
- Are there `readinessProbe` failures keeping pods out of the Service?

### 4. Report

Give a compact explanation: what the object is for, its key spec fields, and how
it connects to its neighbors. Call out anything that looks wrong (mismatched
selectors, missing probes, missing resources, `latest` tags) as observations,
not fixes.

## Guardrails

- Read-only (`get`/`describe`). No `kubectl apply`, `edit`, or `delete` unless
  the user explicitly asks to change the cluster.
- Do not dump full Secret values into responses.

