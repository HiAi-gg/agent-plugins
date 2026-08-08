---
name: diagnose-pod
description: Debug a failing, unhealthy, CrashLoopBackOff, or ImagePullBackOff Kubernetes pod. Use when a pod is not Ready, restarting, stuck in Pending, or when a workload is misbehaving.
license: MIT
compatibility: Requires the kubernetes MCP server configured in this plugin (kubernetes-mcp-server@0.0.65, --read-only) or kubectl with a configured kubeconfig and access to the relevant namespace.
metadata:
  plugin: kubernetes
  kind: troubleshooting
---

# Debug a Kubernetes Pod

Use this skill when a pod is failing, crash-looping, not becoming Ready, or
when a workload seems broken.

## Workflow

### 1. Orient

```bash
kubectl config current-context                 # confirm cluster/namespace
kubectl get pods -n <ns> -o wide               # all pods, node, IP, readiness
kubectl get events -n <ns> --sort-by=.lastTimestamp | tail -30
```

Note the pod name, its phase, and its restart count.

### 2. Read the pod spec and status

```bash
kubectl describe pod <pod> -n <ns>
kubectl get pod <pod> -n <ns> -o yaml
```

Key fields: `status.conditions` (especially `Ready`), `status.containerStatuses[*]`
(`waiting.reason`, `lastState.terminated.exitCode`), and `status.hostIP`/`podIP`.

Common `waiting.reason` values:

- `CrashLoopBackOff` — the container starts then exits; get logs (step 3).
- `ImagePullBackOff` / `ErrImagePull` — bad image tag, registry auth, or
  pull policy; check `kubectl describe pod` events for the exact 401/404/503.
- `Pending` — scheduling problem: insufficient resources, node taints, or a
  missing PVC. Look at events.
- `CreateContainerConfigError` — invalid env/secret/configmap references.

### 3. Get logs

```bash
kubectl logs <pod> -n <ns> --tail=200
kubectl logs <pod> -n <ns> -c <container> --tail=200   # multi-container pods
kubectl logs <pod> -n <ns> --previous --tail=200        # crashed container
```

For a crash loop, `--previous` shows the last run before the crash.

### 4. Inspect the runtime state

For running-but-broken pods:

```bash
kubectl exec -it <pod> -n <ns> -- sh -c 'ps aux; cat /etc/resolv.conf; env'
kubectl exec <pod> -n <ns> -- curl -v http://<service>   # connectivity probe
```

If `exec` fails with "unable to upgrade connection", the pod is crashing or the
API server cannot reach kubelet — check node status.

### 5. Check the workload owner

```bash
kubectl get deploy,sts,ds -n <ns> | grep <workload>
kubectl rollout status deploy/<name> -n <ns>
kubectl rollout history deploy/<name> -n <ns>
```

If a Deployment is healthy but pods are bad, look at replica/strategy and the
latest rollout.

### 6. Report

State: pod phase + restart count, the decisive event/log/exit code, and the most
likely root cause with the narrowest fix (image tag, resource limits, env,
secret reference, rollout rollback). Cite evidence — never speculate without a
log line or event to back it.

## Guardrails

- Diagnosis is read-only (`get`, `describe`, `logs`, `exec` for inspection).
- Do not `kubectl delete`, scale down, or `rollout undo` without explicit user
  authorization.
- Do not `kubectl exec` with write intent (installing packages, writing files)
  unless the user asked for a fix inside the pod.
