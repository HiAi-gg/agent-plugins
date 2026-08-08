/**
 * HiAI read-only PostgreSQL inspection MCP server.
 *
 * Implements a compact diagnostic API (13 tools; analyze_query intentionally
 * omitted from v0.0.1). All data access is read-only: the session is forced
 * read-only server-side, and the query tool applies conservative input checks
 * and output limits.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import {
  type PgConfig,
  type SqlDatabase,
  DEFAULT_CONFIG,
  applySessionSafety,
  firstRow,
  getDb,
  redactUrl,
  scrubSecrets,
} from "./connection.js";
import { assertReadOnlyStatement } from "./query-safety.js";

const MAX_RESULT_BYTES = 1_000_000;

function truncateText(s: string, maxBytes: number): { text: string; truncated: boolean } {
  if (Buffer.byteLength(s, "utf8") <= maxBytes) return { text: s, truncated: false };
  const buf = Buffer.from(s, "utf8");
  return { text: buf.subarray(0, maxBytes).toString("utf8") + "\n\u2026 [truncated]", truncated: true };
}

/** Run a statement via Bun.SQL and return row objects. */
async function execSql(db: SqlDatabase, sql: string, params?: unknown[]): Promise<Record<string, unknown>[]> {
  return db.unsafe(sql, params).execute();
}

/** Build a structured success result. */
function ok(payload: unknown, isError = false): CallToolResult {
  const text = JSON.stringify(payload, null, 2);
  const { text: safe, truncated } = truncateText(text, MAX_RESULT_BYTES);
  const result: CallToolResult = {
    content: [{ type: "text", text: safe }],
  };
  if (isError) result.isError = true;
  if (truncated) (result as Record<string, unknown>).truncated = true;
  return result;
}

/** Build a structured error result (never a crash). */
function errorResult(e: unknown): CallToolResult {
  const msg = e instanceof Error ? e.message : String(e);
  return ok({
    summary: "Error",
    data: null,
    warnings: [],
    truncated: false,
    error: scrubSecrets(msg),
  }, true);
}

export function createServer(config: PgConfig = DEFAULT_CONFIG) {
  const db = getDb(config);
  applySessionSafety(db, config);

  const server = new McpServer({
    name: "hiai-postgres-mcp",
    version: "0.0.1",
  });

  // 1. database_info
  server.tool("database_info", "Safe PostgreSQL metadata: version, database, user, settings, extensions.", {}, async () => {
    try {
      const info = (await firstRow(db, `SELECT version() AS version`)) as { version: string } | undefined;
      const dbInfo = (await firstRow(
        db,
        `SELECT current_database() AS database, current_user AS user,
                current_setting('server_version') AS server_version,
                current_setting('transaction_read_only') AS transaction_read_only,
                current_setting('statement_timeout') AS statement_timeout,
                current_setting('lock_timeout') AS lock_timeout,
                pg_postmaster_start_time() AS started_at`
      )) as Record<string, unknown> | undefined;
      const exts = await execSql(db, `SELECT extname, extversion FROM pg_extension ORDER BY extname`);
      return ok({ summary: "Database info", data: { ...info, ...dbInfo, extensions: exts, connection: redactUrl(config.url) }, warnings: [], truncated: false });
    } catch (e: unknown) {
      return errorResult(e);
    }
  });

  // 2. list_schemas
  server.tool("list_schemas", "List visible schemas.", {}, async () => {
    try {
      const rows = await execSql(
        db,
        `SELECT n.nspname AS schema, r.rolname AS owner
         FROM pg_catalog.pg_namespace n
         JOIN pg_catalog.pg_roles r ON r.oid = n.nspowner
         WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'
         ORDER BY n.nspname`
      );
      return ok({ summary: `Schemas (${rows.length})`, data: rows, warnings: [], truncated: false });
    } catch (e: unknown) {
      return errorResult(e);
    }
  });

  // 3. list_tables
  server.tool("list_tables", "List tables/views in a schema with size estimates.", { schema: z.string().optional().describe("Schema filter (default public)"), limit: z.number().int().positive().max(500).optional().describe("Max tables (default 100)") }, async ({ schema = "public", limit = 100 }) => {
    try {
      const rows = await execSql(
        db,
        `SELECT schemaname AS schema, tablename AS table,
                pg_size_pretty(pg_total_relation_size(format('%I.%I', schemaname, tablename)::regclass)) AS total_size
         FROM pg_catalog.pg_tables
         WHERE schemaname = $1
         ORDER BY pg_total_relation_size(format('%I.%I', schemaname, tablename)::regclass) DESC
         LIMIT $2`,
        [schema, limit]
      );
      return ok({ summary: `Tables in ${schema} (${rows.length})`, data: rows, warnings: [], truncated: rows.length === limit });
    } catch (e: unknown) {
      return errorResult(e);
    }
  });

  // 4. describe_table
  server.tool("describe_table", "Columns, types, nullability, defaults, PK, FKs, constraints, indexes for a table.", { schema: z.string().default("public"), table: z.string() }, async ({ schema, table }) => {
    try {
      const columns = await execSql(
        db,
        `SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = $2
         ORDER BY ordinal_position`,
        [schema, table]
      );
      const pk = await execSql(
        db,
        `SELECT a.attname AS column
         FROM pg_index i JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
         WHERE i.indrelid = format('%I.%I', $1::text, $2::text)::regclass AND i.indisprimary`,
        [schema, table]
      );
      const fks = await execSql(
        db,
        `SELECT conname AS constraint_name,
                pg_get_constraintdef(oid) AS definition
         FROM pg_constraint
         WHERE conrelid = format('%I.%I', $1::text, $2::text)::regclass AND contype = 'f'`,
        [schema, table]
      );
      const indexes = await execSql(
        db,
        `SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = $1 AND tablename = $2 ORDER BY indexname`,
        [schema, table]
      );
      return ok({ summary: `Table ${schema}.${table}`, data: { columns, primary_key: pk, foreign_keys: fks, indexes }, warnings: [], truncated: false });
    } catch (e: unknown) {
      return errorResult(e);
    }
  });

  // 5. list_indexes
  server.tool("list_indexes", "Indexes for a table with definition and size.", { schema: z.string().default("public"), table: z.string() }, async ({ schema, table }) => {
    try {
      const rows = await execSql(
        db,
        `SELECT schemaname AS schema, tablename AS table, indexname AS index_name,
                pg_size_pretty(pg_relation_size(format('%I.%I', schemaname, indexname)::regclass)) AS index_size,
                indexdef AS definition
         FROM pg_indexes WHERE schemaname = $1 AND tablename = $2 ORDER BY indexname`,
        [schema, table]
      );
      return ok({ summary: `Indexes on ${schema}.${table} (${rows.length})`, data: rows, warnings: ["Sizes are relation sizes; usage counters would require pg_stat_user_indexes."], truncated: false });
    } catch (e: unknown) {
      return errorResult(e);
    }
  });

  // 6. query
  server.tool("query", "Run a single read-only SQL statement (SELECT / catalog / EXPLAIN only).", {
    sql: z.string().describe("Single read-only SQL statement"),
    params: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional().describe("Optional parameters ($1, $2, ...)"),
    row_limit: z.number().int().positive().max(500).optional().describe("Max rows returned (default 100)"),
  }, async ({ sql, params = [], row_limit = 100 }) => {
    try {
      const stmt = assertReadOnlyStatement(sql);
      const result = await execSql(db, stmt, params);
      const rows = Array.isArray(result) ? result : [];
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      const truncated = rows.length > row_limit;
      const out = {
        summary: `Query returned ${rows.length} rows`,
        data: { columns, rows: truncated ? rows.slice(0, row_limit) : rows },
        warnings: [],
        truncated,
      };
      return ok(out);
    } catch (e: unknown) {
      return errorResult(e);
    }
  });

  // 7. explain_query
  server.tool("explain_query", "EXPLAIN (FORMAT JSON) without executing the statement.", { sql: z.string().describe("Statement to explain (not executed)") }, async ({ sql }) => {
    try {
      const stmt = assertReadOnlyStatement(sql);
      const rows = await execSql(db, `EXPLAIN (FORMAT JSON, VERBOSE) ${stmt}`);
      return ok({ summary: "EXPLAIN (not executed)", data: rows, warnings: [], truncated: false });
    } catch (e: unknown) {
      return errorResult(e);
    }
  });

  // 8. database_activity
  server.tool("database_activity", "Active sessions, idle-in-transaction, long queries, waits.", {}, async () => {
    try {
      const rows = await execSql(
        db,
        `SELECT pid, state, wait_event_type, wait_event,
                now() - query_start AS query_age,
                now() - xact_start AS transaction_age,
                application_name, left(query, 120) AS query_excerpt
         FROM pg_stat_activity
         WHERE state IS NOT NULL AND pid <> pg_backend_pid()
         ORDER BY query_start NULLS LAST`
      );
      return ok({ summary: `Activity (${rows.length} sessions)`, data: rows, warnings: [], truncated: false });
    } catch (e: unknown) {
      return errorResult(e);
    }
  });

  // 9. locks
  server.tool("locks", "Lock diagnosis: blocked vs blocking sessions.", {}, async () => {
    try {
      const rows = await execSql(
        db,
        `SELECT blocked.pid AS blocked_pid, blocking.pid AS blocking_pid,
                blocked_rel.relname AS relation,
                blocked.locktype AS lock_type,
                now() - blocked_s.query_start AS query_age,
                now() - blocked_s.xact_start AS transaction_age,
                left(blocked_s.query, 120) AS blocked_query_excerpt,
                left(blocking_s.query, 120) AS blocking_query_excerpt
         FROM pg_locks blocked
         JOIN pg_stat_activity blocked_s ON blocked_s.pid = blocked.pid
         JOIN pg_locks blocking ON blocking.locktype = blocked.locktype
              AND blocking.database IS NOT DISTINCT FROM blocked.database
              AND blocking.relation IS NOT DISTINCT FROM blocked.relation
              AND blocking.pid <> blocked.pid
         JOIN pg_stat_activity blocking_s ON blocking_s.pid = blocking.pid
         LEFT JOIN pg_class blocked_rel ON blocked_rel.oid = blocked.relation
         WHERE NOT blocked.granted AND blocking.granted`
      );
      return ok({ summary: rows.length ? `Lock waits (${rows.length})` : "No lock waits detected", data: rows, warnings: [], truncated: false });
    } catch (e: unknown) {
      return errorResult(e);
    }
  });

  // 10. slow_queries
  server.tool("slow_queries", "Top statements by total time from pg_stat_statements (optional).", { limit: z.number().int().positive().max(50).optional().describe("Max statements (default 10)") }, async ({ limit = 10 }) => {
    try {
      const rows = await execSql(
        db,
        `SELECT queryid, left(query, 200) AS query,
                calls, total_exec_time, mean_exec_time, max_exec_time, rows
         FROM pg_stat_statements
         ORDER BY total_exec_time DESC LIMIT $1`,
        [limit]
      );
      return ok({ summary: `Top ${rows.length} statements by total time`, data: rows, warnings: [], truncated: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      const unavailable = /does not exist|permission denied/i.test(msg);
      return ok({ summary: "pg_stat_statements unavailable", data: null, warnings: [], truncated: false, available: false, reason: unavailable ? "pg_stat_statements is not installed or accessible" : scrubSecrets(msg) });
    }
  });

  // 11. table_health
  server.tool("table_health", "Maintenance signals for a table: live/dead tuples, last vacuum/analyze, sizes.", { schema: z.string().default("public"), table: z.string() }, async ({ schema, table }) => {
    try {
      const rows = await execSql(
        db,
        `SELECT n_live_tup, n_dead_tup, last_vacuum, last_autovacuum, last_analyze, last_autoanalyze,
                pg_size_pretty(pg_total_relation_size(format('%I.%I', $1::text, $2::text)::regclass)) AS total_size
         FROM pg_stat_user_tables
         WHERE schemaname = $1 AND relname = $2`,
        [schema, table]
      );
      return ok({ summary: `Maintenance signals for ${schema}.${table}`, data: rows, warnings: ["These are health signals, not exact diagnoses."], truncated: false });
    } catch (e: unknown) {
      return errorResult(e);
    }
  });

  // 12. database_sizes
  server.tool("database_sizes", "Database size, largest schemas/tables/indexes.", {}, async () => {
    try {
      const dbSize = await firstRow(
        db,
        `SELECT pg_size_pretty(pg_database_size(current_database())) AS database_size`
      );
      const tables = await execSql(
        db,
        `SELECT schemaname AS schema, relname AS table, pg_size_pretty(pg_total_relation_size(relid)) AS total_size
         FROM pg_stat_user_tables
         ORDER BY pg_total_relation_size(relid) DESC LIMIT 20`
      );
      const indexes = await execSql(
        db,
        `SELECT schemaname AS schema, relname AS table, indexrelname AS index_name,
                pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
         FROM pg_stat_user_indexes
         ORDER BY pg_relation_size(indexrelid) DESC LIMIT 20`
      );
      return ok({ summary: "Database sizes", data: { database: dbSize, largest_tables: tables, largest_indexes: indexes }, warnings: [], truncated: false });
    } catch (e: unknown) {
      return errorResult(e);
    }
  });

  // 13. health_summary
  server.tool("health_summary", "High-level diagnostic summary combining inexpensive checks.", {}, async () => {
    try {
      const dbSize = (await firstRow(db, `SELECT pg_size_pretty(pg_database_size(current_database())) AS s`)) as { s: string };
      const activity = (await firstRow(db, `SELECT count(*) AS n FROM pg_stat_activity WHERE state = 'active' AND pid <> pg_backend_pid()`)) as { n: number };
      const longTx = (await firstRow(db, `SELECT count(*) AS n FROM pg_stat_activity WHERE xact_start < now() - interval '5 minutes' AND pid <> pg_backend_pid()`)) as { n: number };
      const locks = (await firstRow(
        db,
        `SELECT count(*) AS n FROM pg_locks blocked
         JOIN pg_locks blocking ON blocking.locktype = blocked.locktype AND blocking.pid <> blocked.pid
         WHERE NOT blocked.granted AND blocking.granted`
      )) as { n: number };
      const deadTuples = (await firstRow(
        db,
        `SELECT count(*) AS n FROM pg_stat_user_tables WHERE n_dead_tup > 1000`
      )) as { n: number };
      return ok({ summary: "Health summary", data: { database_size: dbSize.s, active_sessions: activity.n, long_transactions: longTx.n, lock_waits: locks.n, tables_with_many_dead_tuples: deadTuples.n }, warnings: [], truncated: false });
    } catch (e: unknown) {
      return errorResult(e);
    }
  });

  return server;
}

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e);
  process.stderr.write(`hiai-postgres-mcp fatal: ${scrubSecrets(msg)}\n`);
  process.exit(1);
});
