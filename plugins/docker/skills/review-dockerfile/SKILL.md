---
name: review-dockerfile
description: "Review a Dockerfile for correctness, best practices, and security: base image, layers, caching, secrets, and image size. Use when writing, auditing, or optimizing a Dockerfile."
---

---
name: review-dockerfile
description: Review a Dockerfile for correctness, best practices, and security: base image, layers, caching, secrets, and image size. Use when writing, auditing, or optimizing a Dockerfile.
license: MIT
compatibility: Requires the docker CLI (for docker build validation) or just the Dockerfile text.
metadata:
  plugin: docker
  kind: dockerfile-review
---

# Review a Dockerfile

Use this skill when an agent must audit or improve a Dockerfile.

## Workflow

### 1. Read the Dockerfile top to bottom

Walk through: base image, package installs, copy/run steps, entrypoint, and
exposed ports. Note the overall stage structure (multi-stage or single).

### 2. Check the base image

- **Tag specificity**: `latest` or floating tags are non-reproducible — flag
  and suggest pinning a digest or a specific version tag.
- **Image size/security**: prefer slim/distroless/alpine where appropriate for
  the runtime; note unnecessary build tools left in a runtime image.

### 3. Check layers and caching

- **Order**: dependencies before source (cache-friendly): `COPY package.json
  .` + `RUN install` before `COPY . .`.
- **Layer bloat**: each `RUN` adds a layer; suggest combining related steps
  and cleaning package caches in the same layer.
- **Invalidated cache**: copying the whole context before dependency
  installation defeats caching.

### 4. Check security

- **Secrets**: `ARG`/`ENV` with credentials in the image — flag and suggest
  BuildKit secrets or runtime env injection. Never commit secrets.
- **User**: does the image run as root? Suggest a non-root `USER`.
- **Exposure**: `EXPOSE` and port usage match; unnecessary packages removed.
- **Untrusted input**: `COPY` of untrusted files executed at build time.

### 5. Validate

- If the docker CLI is available and the user wants, run
  `docker build --check` (or a full build) to catch syntax/stage errors —
  building images is a heavier action; confirm with the user first.

### 6. Report

Give: the review verdict, findings by category (base image, caching, security,
size) with line references, and concrete suggested edits. Do not modify the
Dockerfile without user intent.

## Guardrails

- Review is read-only; editing the Dockerfile requires user intent.
- Never put secrets in a Dockerfile or in this skill's output.

