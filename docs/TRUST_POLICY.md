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

Currently Kubernetes is the **intentional Trust B exception**:
`containers/kubernetes-mcp-server` (pinned `0.0.65`). It is described
factually as a "trusted community Kubernetes MCP server", never as official
Kubernetes or CNCF tooling.

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
