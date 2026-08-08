---
name: inspect-docker-environment
description: "Produce a read-only inventory of a local Docker environment: running and stopped containers, images, networks, volumes, and disk usage. Use when getting oriented in an unfamiliar Docker setup or before proposing container changes."
---

---
name: inspect-docker-environment
description: Produce a read-only inventory of a local Docker environment: running and stopped containers, images, networks, volumes, and disk usage. Use when getting oriented in an unfamiliar Docker setup or before proposing container changes.
license: MIT
compatibility: Requires the docker CLI and a running Docker daemon.
metadata:
  plugin: docker
  kind: orientation
---

# Inspect a Docker Environment

Use this skill to get a reliable, read-only picture of what Docker is running on
a machine before doing anything else.

## Workflow

### 1. Daemon health

```bash
docker info                     # engine info; confirms daemon is reachable
docker version                  # client + server versions
docker system df                # disk usage: images, containers, volumes, cache
```

If `docker info` fails, stop — the daemon is not reachable and nothing below
will work.

### 2. Inventory

```bash
docker ps -a                     # every container (running + stopped)
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
docker images                    # local images
docker network ls
docker volume ls
docker compose ls -a             # compose projects (uses compose plugin)
```

### 3. Focus on what matters

For the user's question, drill into the relevant objects:

- Containers: `docker inspect <name>` for mounts, ports, env, restart policy.
- Images: `docker image inspect <image>` for layers/size, or `docker history`
  for build steps.
- Networks: `docker network inspect <net>` for members and subnet.
- Volumes: `docker volume inspect <vol>` for mountpoint and driver.

### 4. Report

Give a compact inventory: N running/stopped containers, notable images and their
sizes, networks with their members, volumes, and any red flags (unused images,
stale volumes, containers with no restart policy, `latest` tags). Prioritize
facts that are relevant to the user's task.

## Guardrails

- Entirely read-only. Never `docker rm`, `docker rmi`, `docker volume prune`,
  or `docker system prune` unless the user explicitly requests cleanup.
- On large environments, prefer `--format` projections and `docker system df`
  over dumping every container's full inspect.

