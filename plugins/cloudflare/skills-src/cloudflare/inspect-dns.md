---
name: inspect-dns
description: Inspect DNS records and zone configuration for a Cloudflare zone: list records, check propagation/status, and identify misconfigurations. Use when a domain resolves incorrectly, DNS records look wrong, or before changing DNS.
license: MIT
compatibility: Requires the cloudflare MCP server configured in this plugin (https://mcp.cloudflare.com/mcp) with OAuth or an API token at the client level.
metadata:
  plugin: cloudflare
  kind: dns-inspection
---

# Inspect Cloudflare DNS

Use this skill when an agent must understand or verify the DNS configuration of
a Cloudflare zone.

## Context

The Cloudflare MCP server uses a code-mode pattern: `search` and `execute`.
This skill is the workflow for DNS inspection.

## Workflow

### 1. Identify the zone

- Confirm the zone (domain) to inspect and the account/zone id if known.
- Use `search` to find the DNS zone endpoints.

### 2. Fetch the zone and its records

- `execute` to list the zone (status: active/pending, name servers, plan).
- `execute` to list the DNS records for the zone: name, type, content, TTL,
  proxied status.

### 3. Assess the records

For the records relevant to the question:

- **Proxied vs DNS-only**: is the record orange-clouded (proxied)? A proxied
  A/AAAA record hides the origin IP; a DNS-only record exposes it.
- **TTL**: auto vs explicit; very low TTLs for non-critical records are a
  smell.
- **Content**: does the record point where expected (origin IP, CNAME target,
  MX priority)?
- **Duplicates/conflicts**: multiple A records, a CNAME conflicting with
  other records.

### 4. Check zone health signals

- Zone status (active vs pending — pending means name servers not switched).
- Whether Cloudflare's name servers match the registrar's.

### 5. Report

Give: the zone status, the relevant records (name/type/content/TTL/proxied),
any misconfigurations (wrong target, DNS-only for a proxy-protected origin,
pending zone), and recommendations. This is inspection — changing records
requires explicit user intent.

## Guardrails

- Read-first: list/describe only; no record creation, updates, or deletions
  without explicit user intent.
- Do not print account/zone API tokens.
