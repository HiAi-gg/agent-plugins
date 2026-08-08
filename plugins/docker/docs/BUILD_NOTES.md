# BUILD_NOTES — docker

## Product rationale

Local Docker inspection/diagnosis is a common agent task, and agents already
have the `docker` CLI. A skills-only plugin teaches the discipline (which
commands, what order, what the output means) without adding an MCP layer.

## Architecture

```
Skills-only (no MCP):
inspect-docker-environment, diagnose-container, diagnose-compose, review-dockerfile
```

## Why skills-only

- Docker's official MCP (`docker/hub-mcp`) targets **Docker Hub**, not local
  daemons.
- Docker MCP Gateway manages MCP server lifecycles, not local container
  diagnostics.
- No trusted local-Docker MCP integration exists to justify an MCP layer; a
  separate future `docker-hub` plugin may use the Hub MCP.

## Skill decisions

- Mission skill list: `inspect-docker-environment`, `diagnose-container`,
  `diagnose-compose`, `review-dockerfile`.
- `inspect-docker-environment` (renamed from `review-docker-environment`) —
  environment inventory.
- `diagnose-container` — container failure diagnosis.
- `diagnose-compose` — compose project understanding.
- `review-dockerfile` (new) — Dockerfile review (base image, caching,
  secrets, size).
- The earlier `inspect-container` skill was superseded by
  `inspect-docker-environment` + `diagnose-container` to avoid overlap per the
  mission.

## Runtime testing

- Skills are CLI-command workflows over standard `docker`/`docker compose`;
  N/A beyond schema validity (no daemon-side interaction required to validate
  the plugin).

## Limitations

- Requires agent shell access to docker.
- Does not manage Docker Hub.
