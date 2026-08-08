---
name: investigate-ci
description: "Investigate GitHub Actions workflow failures: find the failed run, read the failing job step, examine logs, and identify the root cause. Use when a CI run fails, a workflow does not trigger, or a check is stuck or skipped."
---

# Investigate a GitHub Actions Failure

Use this skill when a GitHub Actions workflow fails, does not trigger, or behaves
unexpectedly.

## Workflow

### 1. Locate the run

- Find the workflow runs for the branch/commit in question: the failing run, its
  head SHA, and the workflow name.
- Confirm the run's event (push, pull_request, schedule, manual) — an unexpected
  trigger is itself a clue.

### 2. Isolate the failure

- From the run, get the jobs and their conclusions.
- Find the first failed job and the failing step; fetch the step log.
- Read the log tail first (the actual error), then scan up for context.

### 3. Classify the failure

Common classes:

- **Toolchain**: dependency install/version drift, node/python/rust version
  mismatch, cache issues. Look at the install/setup step.
- **Test**: assertion failures, flaky tests (timeouts, order dependence,
  network-dependent tests). Check if the same test fails on main.
- **Build**: type errors, lint, bundling, missing env at build time.
- **Infra**: runner provisioning, secrets missing, registry/auth failures,
  concurrency limits.
- **Workflow YAML**: invalid expression, missing permissions, matrix expansion
  failure.

### 4. Correlate

- Compare against the last green run on the same branch: what changed in between
  (commit range, dependency bumps, workflow file changes)?
- If the failure reproduces on main, it is not caused by the PR's code.

### 5. Report

State: the run/workflow/job/step, the decisive log lines, the root cause, and the
narrowest fix (pin a dependency, fix the test, adjust the workflow, add a
missing secret). Reruns/retries of the workflow are **write** actions — only
trigger them when the user asks.

