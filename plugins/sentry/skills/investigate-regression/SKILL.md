---
name: investigate-regression
description: "Determine whether a Sentry issue is a regression and find what changed: compare event timing against releases, find the introducing commit or deploy, and narrow the cause. Use when an error spiked or reappeared after a deploy."
---

# Investigate a Regression

Use this skill when an error spikes, reappears, or starts at a clear point in
time — the classic regression signal.

## Workflow

### 1. Establish the timeline

- First seen and the volume curve (when did it start / spike?).
- Align that timestamp with the release cadence: which release/deploy landed
  closest to the spike?

### 2. Identify the release

- Fetch the releases around the spike (before/at/after).
- For the candidate release, list the commits included (or the PRs merged).

### 3. Correlate the change with the error

- Compare the issue's culprit (file/function) with the files touched in the
  candidate release's commits.
- A matching file/function is strong evidence; also check for dependency,
  config, or SDK version changes in the same window.

### 4. Narrow further

- If multiple candidates: compare event attributes before vs after the spike
  (exception message, stack frames, affected users) — a changed stack frame or
  message points at the new code path.
- Check if the same issue exists on an older release line (did it never happen
  before, or was it always broken?).

### 5. Report

State: the spike timeline, the candidate release(s), the commit/change most
likely responsible (with evidence), and the recommended verification (reproduce,
roll back, or fix forward). Mutating issue/release state requires explicit user
intent.

