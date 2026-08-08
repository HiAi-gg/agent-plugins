# UPSTREAM_TRUST — docker

| Field | Value |
|---|---|
| Upstream project | docker CLI / docker compose (skills reference standard CLIs) |
| Upstream owner | Docker (Docker Inc / Moby project) |
| Repository | https://github.com/docker/cli |
| License | Apache-2.0 (CLI) |
| Trust level | **TRUST A — First Party** (the standard docker CLI; no third-party dependency) |
| Selected version | system-installed `docker` / `docker compose` (not pinned — host tooling) |
| Why trusted | The standard, vendor-maintained Docker CLI; ubiquitous |
| Maintenance evidence | Official Docker releases; Moby/docker-cli active maintenance |
| Authentication model | None stored by the plugin; Docker's own registry auth via `~/.docker/config.json` |
| Write capabilities | CLI can mutate (rm, prune, down -v, volume delete); plugin skills are read-first and gate destructive ops |
| Known limitations | Requires agent shell access; compose plugin needed for compose workflows |
| Verification date | 2026-08-07 |

No MCP dependency in this plugin. Skills reference the standard CLI only.
