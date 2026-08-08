# UPSTREAM_TRUST — github

| Field | Value |
|---|---|
| Upstream project | GitHub MCP server (GitHub Copilot-hosted endpoint) |
| Upstream owner | GitHub |
| Repository | https://github.com/github/github-mcp-server |
| License | MIT (project); endpoint operated by vendor |
| Trust level | **TRUST A — First Party** |
| Selected version | vendor-operated endpoint (not pinnable); `https://api.githubcopilot.com/mcp/` |
| Why trusted | GitHub operates the endpoint and the underlying server project; first-party vendor ownership |
| Maintenance evidence | Active official project with releases and vendor support |
| Authentication model | OAuth, host/client-managed; no tokens in the plugin |
| Write capabilities | The endpoint exposes write tools (comments, issues, PRs, releases); plugin skills default to read-only |
| Known limitations | Requires interactive OAuth; tool set controlled by GitHub; endpoint version not pinnable |
| Verification date | 2026-08-07 |

Endpoint verification: `CONFIG_VALIDATED` (schema-conformant streamable-http
config); `AUTH_RUNTIME_NOT_VERIFIED` (OAuth requires an interactive user grant
not available in the build environment).
