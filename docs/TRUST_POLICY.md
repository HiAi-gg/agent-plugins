# Trust Policy

How upstream dependencies are classified in this collection. The official
Agent Plugins, Agent Skills, and MCP specifications remain the normative
source of truth; this policy governs which upstreams HiAI is willing to
package.

## Trust A — First-party / vendor-owned

Vendor-owned MCP server, hosted endpoint, CLI, or official integration.

| Plugin | Upstream |
|---|---|
| github | GitHub Copilot-hosted MCP |
| context7 | Upstash Context7 MCP |
| firecrawl | Firecrawl MCP |
| redis | Redis MCP server (`redis-mcp-server`) |
| sentry | Sentry hosted MCP |
| supabase | Supabase PostgREST MCP |
| figma | Figma hosted MCP |
| cloudflare | Cloudflare Code Mode MCP |
| notion | Notion hosted MCP |
| docker | docker / docker compose CLI (vendor-maintained) |

## Trust B — Established community (explicit review)

An established community upstream that passed explicit review: meaningful
adoption, active maintenance, releases, multiple maintainers, clear license,
CI/tests, credible security posture, and runtime verification by HiAI.

Two upstreams are **intentional Trust B entries**:

| Plugin | Upstream | Pin |
|---|---|---|
| kubernetes | `containers/kubernetes-mcp-server` | `0.0.65` |
| agent-browser | `vercel-labs/agent-browser` CLI (Apache-2.0) | `0.31.1` |

Kubernetes is described factually as a "trusted community Kubernetes MCP
server", never as official Kubernetes or CNCF tooling. agent-browser is a
skills-only plugin over the upstream CLI (no MCP server); it is described as a
community CLI from the vercel-labs org, never as an official Vercel product.

**Pin status (reviewed 2026-08-08)**: upstream latest is `0.0.66`, which is an
explicitly breaking release (`feat!(mcp): add 2026-07-28 spec support`). The
pin is **deliberately held at `0.0.65`**, the version the read-only gate was
runtime-verified against. The security fixes in `0.0.66` are confined to the
HTTP/wellknown-proxy surface, which this stdio configuration does not use, and
no advisory exists against `0.0.65`. Because upstream only patches security
fixes into the latest release, this pin is re-evaluated at every collection
release and immediately on any advisory touching the stdio or read-only
gating surface. Full record: `plugins/kubernetes/docs/UPSTREAM_TRUST.md`.

## HiAI Native

Runtime owned and maintained directly by HiAI.

Currently **PostgreSQL** falls into this category: its MCP
(`plugins/postgresql/packages/postgres-mcp`) is bundled with and maintained by
HiAI, using the official MCP TypeScript SDK and Bun.SQL.

## Rules

- No Trust C (ordinary/weak community) dependencies as defaults.
- Do not imply Docker has an MCP upstream — Docker is skills-only over the
  standard CLI.
- Do not overbrand upstreams: "Uses the official Redis MCP server" is factual;
  "Official HiAI GitHub integration" would wrongly imply endorsement.
- Upstream versions are pinned where practical; vendor-operated remote
  endpoints are recorded by endpoint + verification date.

See each plugin's `docs/UPSTREAM_TRUST.md` for the full record.
