# Kubernetes Agent Plugin

Inspect and diagnose Kubernetes clusters: pods, resources, events, logs, and
health — via a **trusted read-only Kubernetes MCP server** plus workflow
skills.

An [Agent Plugin](https://agent-plugins.org/) (spec **1.0.0**).

## What is this?

A **Skills + MCP** plugin:

- **MCP server** (`kubernetes`) — `kubernetes-mcp-server@0.0.65` launched with
  `--read-only` and `--disable-multi-cluster`, so only read-annotated tools
  are exposed.
- **Skills**: `diagnose-pod`, `review-cluster`, `explain-kubernetes-resource`
  — read-only workflows for pod debugging, cluster health review, and resource
  explanation.

## Why would I install it?

- The MCP server gives typed tool access; the skills teach the *investigation
  order* (evidence → cause → next step).
- `--read-only` is enforced by the server, not just by the skills — verified
  against a disposable cluster (see below).
- No credentials stored — uses the user's existing kubeconfig/current context.

## What MCP/upstream does it use?

- **Server**: `kubernetes` — stdio,
  `npx -y kubernetes-mcp-server@0.0.65 --read-only --disable-multi-cluster`
  (pinned).

> **Trust note**: `kubernetes-mcp-server` is a **trusted community Kubernetes
> MCP server** (from the `containers` project), **not** an official Kubernetes
> or CNCF MCP. See `docs/UPSTREAM_TRUST.md` for the trust assessment.

## Does it need authentication?

**No credentials in the plugin.** The server uses the ambient kubeconfig /
current context (`KUBECONFIG`, `~/.kube/config`, or in-cluster). Never commit
a kubeconfig or service-account token.

## Is it read-only?

**Yes — enforced and verified.** `--read-only` makes the server expose only
read-annotated tools. This was runtime-verified against a disposable k3s
cluster (see below): 14 tools, **no create/delete/update/apply tools exist**
under read-only mode.

## What clients were actually tested?

stdio MCP transport, runtime-verified in this release cycle against a
**disposable k3s cluster**:

```
initialize       OK (v0.0.65)
tools/list       14 tools, all read-only
pods_list        real pods returned
pods_get         pod details returned
pods_log         nginx logs returned
events_list      cluster events returned
mutation tools   NONE (read-only enforced)
```

Status: **RUNTIME_VERIFIED**, **SECURITY_VERIFIED**. Verify in your specific
client.

## Requirements

- Node.js 18+ with `npx`.
- A working kubeconfig / current context with read access.
- Network access on first run to fetch the server package.

## Installation

Copy the plugin's **runtime files** (`plugin.json`, `mcp.json`, `skills/`,
`README.md`, `LICENSE`) into your Agent Plugins client's plugin folder, or use
your client's plugin install flow. Do **not** copy the authoring sources
(`plugin.yml`, `skills-src/`, `docs/`) — see the collection README for the full
boundary. No build step is required.

## Configuration

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "kubernetes": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "kubernetes-mcp-server@0.0.65",
        "--read-only",
        "--disable-multi-cluster"
      ]
    }
  }
}
```

`--disable-multi-cluster` runs all tools against the default cluster/context.
This version is an **inspection/diagnostics** plugin, not a cluster automation
plugin.

## Why is the server pinned to 0.0.65 and not 0.0.66?

**Pinned to 0.0.65 for stability; 0.0.66 introduces breaking spec changes.**

Upstream `0.0.66` (2026-07-31) ships
`feat!(mcp): add 2026-07-28 spec support` — an explicitly breaking (`feat!`)
MCP protocol-revision change. Our read-only guarantee (14 read-annotated
tools, no mutation tools) was runtime-verified against `0.0.65`; that evidence
does not automatically carry across a protocol-revision bump.

The security-relevant fixes in `0.0.66` — wellknown-proxy path hardening and
`TLS_MIN_VERSION`/`TLS_CIPHER_SUITES` support — apply to the server's **HTTP
transport**. This plugin runs the server over **stdio**, so those code paths
are not reachable in this configuration. No CVE/GHSA advisory and no OSV entry
exists against `0.0.65` at the pin review date.

**Review trigger**: upstream backports security fixes only into the latest
release. If an advisory lands that affects the stdio/read-only surface, the
pin must be moved to the fixed release and the read-only gate re-verified
before shipping.

Pin reviewed: **2026-08-08** (upstream latest at review: `0.0.66`).

## Examples

1. "Why is my pod CrashLoopBackOff?" → `diagnose-pod`.
2. "Give me a health overview of the staging cluster" → `review-cluster`.
3. "Explain this Deployment and Service and how they connect" →
   `explain-kubernetes-resource`.

## Upstream MCP

| Server | Version | License | Source |
|---|---|---|---|
| Kubernetes MCP Server | `kubernetes-mcp-server@0.0.65` (pinned; upstream latest `0.0.66` — see pin rationale above) | Apache-2.0 | [containers/kubernetes-mcp-server](https://github.com/containers/kubernetes-mcp-server) |

## Agent Plugins version

**1.0.0 (Working Draft)** — https://agent-plugins.org/specification

## Runtime requirements

Node.js 18+, `npx`, network on first run, reachable cluster context.

## Security / default behavior

- Server-level read-only enforcement (`--read-only`), runtime-verified.
- No kubeconfig/credentials in the plugin; uses the user's context.
- Skills default to read-only; no destructive operations.
- Secret values are never dumped into responses.

## Known limitations

- Requires a configured kubeconfig/current context to function.
- `--disable-multi-cluster` means only the default context is used.
- Trusted community upstream (not official Kubernetes/CNCF).

## License

MIT. See [LICENSE](LICENSE). Upstream `kubernetes-mcp-server` is Apache-2.0
(containers project); HiAI is not affiliated with or endorsed by it.

## CHANGELOG

See [CHANGELOG.md](CHANGELOG.md).
