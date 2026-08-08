# Security Policy

## Reporting a vulnerability

If you find a security issue in this collection — plugin configs, Skills, the
bundled PostgreSQL MCP, credential handling, path handling, or read/write
defaults — report it privately to the HiAI organization. Do not open a public
issue for a vulnerability.

For vulnerabilities in **upstream third-party MCPs or CLIs** that a plugin
integrates, please also report to the relevant upstream project. HiAI does not
control first-party vendor MCP infrastructure (GitHub, Sentry, Figma,
Cloudflare, Notion hosted endpoints).

## What this collection is responsible for

- Plugin manifests (`plugin.json`, `mcp.json`) and their configs.
- Agent Skills (instructions and behavior).
- The bundled HiAI PostgreSQL MCP (`plugins/postgresql/packages/postgres-mcp`).
- Documentation accuracy around authentication and security.

## What users should verify

- Never commit or share credentials: `.env` values, API keys, OAuth tokens,
  PATs, database passwords, private keys, credential-bearing `DATABASE_URL`s,
  or Authorization headers.
- Read/write defaults: most plugins are read/inspect-first; verify the
  posture in each plugin README before granting access.
- Remote MCP endpoints require host-managed OAuth — the plugin itself never
  embeds tokens.

## Security posture

See [docs/TRUST_POLICY.md](docs/TRUST_POLICY.md) for the upstream trust
model, and each plugin's `docs/` for per-plugin security behavior (e.g.
PostgreSQL server-side read-only enforcement and its security verification
matrix).
