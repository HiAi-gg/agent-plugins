---
name: diagnose-compose
description: "Explain and inspect a docker compose project: services, networks, volumes, dependencies, overrides, and effective merged configuration. Use when the user asks what a compose file does, how services connect, or why a compose-based stack is misconfigured."
---

# Understand a Docker Compose Project

Use this skill when the user wants to know what a compose project contains, how
its services relate, or how configuration is actually applied.

## Workflow

### 1. Locate the compose files

Look for `docker-compose.yml`, `compose.yml`, or `compose.yaml`, plus any
overrides (`compose.override.yml`, `compose.prod.yml`, environment-specific
files). Note which file the project actually uses — the active file set matters.

### 2. Read the effective configuration

Ask Docker to render the merged, real configuration rather than reading only one
YAML file:

```bash
docker compose config                 # merged config
docker compose config --services      # just the service list
docker compose config --volumes       # volume declarations
docker compose config --images        # images used
```

`docker compose config` also reports validation errors (duplicate keys, wrong
types) — a clean run is itself a useful fact.

### 3. Explain services and their relationships

For each service, summarize:

- image / build context,
- ports and exposed ports,
- environment and secrets,
- volumes,
- `depends_on` edges (startup order and health gating),
- network membership.

Map the dependency graph: which services call which, and whether the ordering
matches (`depends_on` with `condition: service_healthy` vs plain start order).

### 4. Inspect the running project

```bash
docker compose ps              # status per service
docker compose top             # processes inside each container
docker compose ls -a           # all projects and their compose files
docker network inspect <net>   # which containers are on which network
```

### 5. Report

Explain the project in terms the user can act on: what runs, how the pieces
connect, and any configuration surprises (port collisions, missing env,
unmounted volumes, `latest` tags that should be pinned). Distinguish "what the
compose files say" from "what is actually running".

## Guardrails

- Read-only commands throughout; do not `docker compose down -v` or `up` with
  destructive flags unless the user explicitly asked to change state.

