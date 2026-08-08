---
name: review-cloudflare-config
description: Review a Cloudflare account/zone configuration for correctness and security: Workers, DNS, rules, cache, and settings. Use when onboarding to a Cloudflare setup, auditing configuration, or checking for misconfigurations.
license: MIT
compatibility: Requires the cloudflare MCP server configured in this plugin (https://mcp.cloudflare.com/mcp) with OAuth or an API token at the client level.
metadata:
  plugin: cloudflare
  kind: configuration-review
---

# Review Cloudflare Configuration

Use this skill when an agent must produce a read-only health/config review of a
Cloudflare account or zone.

## Context

The Cloudflare MCP server uses a code-mode pattern: `search` and `execute`.
This skill is the workflow for a configuration review.

## Workflow

### 1. Scope the review

- Confirm the scope: one zone, a set of zones, or the whole account.
- List the areas to review: DNS, Workers, rules (WAF/redirect), cache,
  security settings.

### 2. Gather the configuration

Use `search` to find the relevant endpoints, then `execute` to fetch:

- **Zones**: status, plan, name servers, SSL mode.
- **DNS**: records (see `inspect-dns`) — proxied status, TTLs, targets.
- **Workers**: deployed scripts, routes, and bindings (see `debug-worker`).
- **Rules**: WAF rules, redirect rules, cache rules — enabled states and
  effects.
- **Security**: SSL/TLS mode, security level, bot/rate settings.

### 3. Identify issues

Look for:

- DNS records that are DNS-only when they should be proxied (or vice versa).
- Workers on routes with no matching script or wrong bindings.
- Rules that are disabled when they should be active, or overly broad rules.
- SSL mode that is too permissive (e.g. Flexible) for production.
- Cache rules that could serve stale content.

### 4. Report

Give: a structured review (zone/account state, each area with its settings),
flagged issues ranked by impact, and recommendations. This is a review —
changing any configuration requires explicit user intent.

## Guardrails

- Read-only; no config changes, no cache purges, no DNS edits.
- Do not print tokens or secret binding values.
