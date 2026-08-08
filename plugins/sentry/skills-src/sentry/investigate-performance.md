---
name: investigate-performance
description: Analyze a Sentry trace or performance span to find the slow or failing step in a request: spans, durations, dependencies, and errors. Use when investigating latency, timeouts, or which service/query a failure originates from.
license: MIT
compatibility: Requires the sentry MCP server (hosted, OAuth via client) with performance/tracing data access.
metadata:
  plugin: sentry
  kind: tracing
---

# Investigate Performance (Sentry Trace)

Use this skill when an agent must find where a request is slow or which span
failed.

## Workflow

### 1. Locate the trace

- Identify the trace/transaction: from the event's trace id, the issue's
  samples, or the user's description of the slow request.
- Fetch the transaction and its span tree.

### 2. Find the bottleneck

- List the top spans by duration (self-time, not wall time).
- Flag spans whose time dominates the transaction, or that exceed a sensible
  budget for the operation type.
- Look for the classic offenders: external HTTP calls, database queries,
  serialization, I/O waits.

### 3. Trace failures

- If a span errored: which operation, what status/error, and which downstream
  system (service, DB, external API)?
- Correlate the failing span with the issue/exception if one exists.

### 4. Correlate with infrastructure

- Note span attributes: service name, DB statement type, HTTP status.
- If a downstream service is slow, say which one — do not assume it is the
  application's fault.

### 5. Report

Give: the transaction, the top spans with durations, the bottleneck or failing
span, and the most likely fix (optimize the query, add a timeout/retry, cache,
or escalate to the owning service). Tracing is read-only.
