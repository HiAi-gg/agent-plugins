# UPSTREAM_TRUST — sentry

| Field | Value |
|---|---|
| Upstream project | Sentry MCP |
| Upstream owner | Sentry |
| Repository | https://github.com/getsentry/sentry-mcp |
| License | MIT (project); endpoint operated by vendor |
| Trust level | **TRUST A — First Party** |
| Selected version | vendor-operated endpoint (not pinnable); `https://mcp.sentry.dev/mcp` |
| Why trusted | Sentry operates the endpoint and the underlying project; first-party vendor ownership |
| Maintenance evidence | Active official project; vendor-operated hosted endpoint |
| Authentication model | OAuth, host/client-managed; no tokens in the plugin |
| Write capabilities | Endpoint exposes Sentry state (issues, events, releases); plugin skills default to read-only |
| Known limitations | Requires interactive OAuth (real user); endpoint tool set controlled by Sentry |
| Verification date | 2026-08-07 |

Endpoint verification: `CONFIG_VALIDATED` (schema-conformant streamable-http
config); `AUTH_RUNTIME_REQUIRES_USER` (OAuth requires a real user grant not
available in the build environment).
