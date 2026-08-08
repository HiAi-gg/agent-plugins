---
name: review-cluster
description: "Perform a read-only health review of a Kubernetes cluster or namespace: node status, workload state, resource pressure, events, and obvious misconfigurations. Use when asked for an overall cluster or namespace health assessment."
---

---
name: review-cluster
description: Perform a read-only health review of a Kubernetes cluster or namespace: node status, workload state, resource pressure, events, and obvious misconfigurations. Use when asked for an overall cluster or namespace health assessment.
license: MIT
compatibility: Requires the kubernetes MCP server configured in this plugin (kubernetes-mcp-server@0.0.65, --read-only) or kubectl with read access to the target cluster/namespace.
metadata:
  plugin: kubernetes
  kind: review
---

# Review Kubernetes Cluster Health

Use this skill to produce a read-only health assessment of a cluster (or a
single namespace).

## Workflow

### 1. Nodes

```bash
kubectl get nodes -o wide
kubectl describe nodes | grep -A5 -E 'Conditions:|Allocated resources:' | head -60
```

Look for: `NotReady` nodes, `MemoryPressure`/`DiskPressure`, high allocated
request/limit ratios, taints blocking workloads.

### 2. Workloads

```bash
kubectl get deploy,sts,ds -A -o wide | awk 'NR==1 || $4!=1 || $5!=$3'   # non-ready
kubectl get pods -A --field-selector=status.phase!=Running -o wide
kubectl get pods -A | grep -E 'CrashLoopBackOff|ImagePullBackOff|Pending|Error'
```

Focus on non-ready replicas and abnormal pod phases.

### 3. Events

```bash
kubectl get events -A --sort-by=.lastTimestamp | tail -40
```

Recent `Warning` events with repeated counts are the highest-signal items.

### 4. Resource pressure

```bash
kubectl top nodes
kubectl top pods -A | sort -k3 -h | tail -20   # CPU
kubectl top pods -A | sort -k4 -h | tail -20   # memory
```

(Requires metrics-server.) Note any pod nearing its limits.

### 5. Networking and storage

```bash
kubectl get svc,ingress -A | grep -E 'Pending|LoadBalancer'  # stuck LBs
kubectl get pvc -A | grep -v Bound                          # non-bound PVCs
```

### 6. Report

Give a scored summary: healthy/at-risk areas, the top issues with evidence
(node condition, event, top line), and recommendations ranked by impact. Keep
recommendations separated from observations.

## Guardrails

- Entirely read-only. No `kubectl drain`, `cordon`, `delete`, or `scale`.
- `kubectl top` may fail if metrics-server is absent — say so rather than
  interpreting nothing as "no load".

