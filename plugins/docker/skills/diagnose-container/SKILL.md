---
name: diagnose-container
description: Diagnose why a Docker container is failing, unhealthy, crash-looping, or not starting. Use when a container exits with an error, is restarting, reports unhealthy, or a service is unreachable.
---

# Diagnose a Docker Failure

Use this skill when a container will not start, is restarting in a loop, is
marked unhealthy, or a service seems broken.

## Workflow

### 1. Identify the container and its state

```bash
docker ps -a                       # all containers, including stopped/exited
docker ps -a --filter name=<name>  # narrow by name
docker inspect <container> --format '{{.State.Status}} restarts={{.RestartCount}}'
```

Record: status (`exited`/`restarting`/`unhealthy`), restart count, exit code.

### 2. Read the logs

```bash
docker logs <container>                    # full log
docker logs --tail 200 --timestamps <c>    # recent lines with timestamps
docker logs -f <container>                 # only if tailing is warranted
```

For a crash-loop, `--tail 100` of the last run is usually enough — do not hold a
follow open.

### 3. Check the exit code and reason

```bash
docker inspect <container> --format '{{.State.ExitCode}} {{.State.Error}}'
docker inspect <container> --format '{{.HostConfig.RestartPolicy.Name}}'
```

Common causes:

- **Exit 1 + `Error: ...`** — the app failed; read logs.
- **Exit 127/137** — missing binary or OOM kill; check `docker inspect` memory
  limits and `dmesg`/host for OOM.
- **`unhealthy`** — the healthcheck is failing; run the healthcheck command
  manually inside the container:
  ```bash
  docker exec <container> <healthcheck-command>
  ```
- **Restarting loop with no logs** — the process forks/daemonizes (bad for
  containers) or the entrypoint is wrong.

### 4. Check configuration

```bash
docker inspect <container> --format '{{json .Config}}' | jq .   # env, entrypoint, image
docker inspect <container> --format '{{json .HostConfig}}' | jq . # mounts, ports, limits
```

Look for: wrong `ENTRYPOINT`/`CMD`, missing env vars, bind mounts pointing at
wrong host paths, ports already in use.

### 5. Reproduce and verify

- If the failure is at startup, try running the image with an override:
  ```bash
  docker run --rm --entrypoint sh <image> -c 'env && pwd && ls'
  ```
- Confirm the image exists locally: `docker image inspect <image>`.

### 6. Report

Give: container/state, exit code, the decisive log line(s), and the most likely
root cause with the narrowest fix (config change, env var, image tag, restart
policy). Never guess — cite the log line or inspect output that supports each
conclusion.

## Guardrails

- Prefer read-only commands (`ps`, `logs`, `inspect`) during diagnosis.
- Do not run `docker rm -f`, `docker volume rm`, or destructive restarts without
  explicit user authorization.

