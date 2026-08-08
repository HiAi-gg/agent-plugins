/**
 * Conservative input checks for the read-only query tool.
 *
 * These are NOT the primary security boundary — PostgreSQL session
 * read-only enforcement and role privileges are. They exist as
 * defense-in-depth: reject obviously unsafe statements before they reach the
 * server, and enforce one-statement discipline.
 */

export const FORBIDDEN_KEYWORDS = [
  // DML / DDL / DCL
  "INSERT",
  "UPDATE",
  "DELETE",
  "MERGE",
  "TRUNCATE",
  "CREATE",
  "ALTER",
  "DROP",
  "GRANT",
  "REVOKE",
  "COMMENT",
  "REINDEX",
  "VACUUM",
  "ANALYZE", // bare ANALYZE (statement-level) mutates statistics
  "CLUSTER",
  "REFRESH",
  "SECURITY",
  "CALL",
  "DO ",
  "INTO", // SELECT ... INTO creates a table
  // transactions / session manipulation that could disable safety
  "BEGIN",
  "COMMIT",
  "ROLLBACK",
  "SAVEPOINT",
  "SET ",
  "RESET",
  "PREPARE",
  "EXECUTE",
  "DEALLOCATE",
  "DISCARD",
  "LISTEN",
  "NOTIFY",
  "UNLISTEN",
];

/**
 * Function names that must never run through the query tool. Blocking these is
 * defense-in-depth; PostgreSQL role privileges remain part of the security
 * boundary:
 *
 * - `set_config` can disable the session-level read-only boundary
 *   (`default_transaction_read_only`, `statement_timeout`, ...).
 * - `pg_read_file` / `pg_read_binary_file` / `pg_ls_*` / `pg_stat_file` /
 *   `pg_file_*` / `pg_logdir_files` / `pg_walfile_name` expose the server
 *   filesystem when the role permits.
 * - `pg_reload_conf` / `pg_switch_wal` / `pg_terminate_backend` /
 *   `pg_cancel_backend` / `lo_*` mutate server or session state.
 * - `pg_authid` / `pg_shadow` expose stored password verifiers.
 */
export const FORBIDDEN_FUNCTIONS = [
  // session / read-only state
  "set_config",
  // server file access
  "pg_read_file",
  "pg_read_binary_file",
  "pg_ls_dir",
  "pg_ls_waldir",
  "pg_ls_archive_statusdir",
  "pg_ls_logdir",
  "pg_ls_tmpdir",
  "pg_stat_file",
  "pg_file_rename",
  "pg_file_unlink",
  "pg_file_write",
  "pg_logdir_files",
  "pg_walfile_name",
  "pg_walfile_name_offset",
  // server / session administration
  "pg_reload_conf",
  "pg_rotate_logfile",
  "pg_switch_wal",
  "pg_terminate_backend",
  "pg_cancel_backend",
  // large objects (server-side write surface)
  "lo_import",
  "lo_export",
  "lo_from_bytea",
  "lo_put",
  // credential-bearing catalog relations
  "pg_authid",
  "pg_shadow",
];

/** Strip SQL comments (line + block) so keywords inside comments don't block. */
export function stripComments(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--[^\n]*/g, " ")
    .replace(/^\s*--.*$/gm, " ");
}

/**
 * Split a statement list and reject anything that isn't exactly one statement.
 * We do not fully parse SQL; we use conservative heuristics:
 *  - semicolons are only allowed as a single trailing terminator
 *  - no dollar-quoted bodies that could hide a second statement
 * Returns the normalized single statement or throws.
 */
export function assertSingleStatement(sql: string): string {
  const cleaned = stripComments(sql).trim();
  if (!cleaned) throw new Error("Empty SQL statement");
  if (/\$\$/.test(cleaned) || /\$[A-Za-z_][A-Za-z0-9_]*\$/.test(cleaned)) {
    throw new Error(
      "Dollar-quoted bodies are not allowed in the read-only query tool",
    );
  }
  // Count statement terminators outside of quotes (naive but conservative).
  const stripped = cleaned.replace(/'[^']*'/g, "''").replace(/"[^"]*"/g, '""');
  const terminators = (stripped.match(/;/g) || []).length;
  if (terminators > 1) {
    throw new Error("Multiple statements are not allowed");
  }
  if (terminators === 1 && !cleaned.trimEnd().endsWith(";")) {
    throw new Error("Semicolon must be a single trailing terminator");
  }
  return cleaned.endsWith(";") ? cleaned.slice(0, -1) : cleaned;
}

/**
 * COPY is a SQL utility statement (`COPY ... TO` / `COPY ... FROM`) that can
 * write files or pipe to programs, but "copy" is also a legitimate
 * identifier. It is checked as a statement-leading keyword so that
 * `SELECT copy FROM ...` and `SELECT 1 AS copy` are not rejected. (psql
 * backslash meta-commands like `\copy` are not checked at all: the MCP sends
 * SQL straight to PostgreSQL through the driver, never through interactive
 * psql, so they cannot be executed here.)
 */
export function assertNoLeadingCopy(sql: string): void {
  if (/^\s*COPY\b/i.test(sql)) {
    throw new Error("Statement rejected (forbidden keyword: COPY)");
  }
}

/**
 * Reject statements containing forbidden keywords or function names
 * (word-boundary aware). Also rejects statement-leading COPY.
 */
export function assertReadOnlyStatement(sql: string): string {
  const single = assertSingleStatement(sql);
  const upper = single.toUpperCase();
  for (const kw of FORBIDDEN_KEYWORDS) {
    const re = new RegExp(`\\b${kw.trim()}\\b`, "i");
    if (re.test(upper)) {
      throw new Error(`Statement rejected (forbidden keyword: ${kw.trim()})`);
    }
  }
  for (const fn of FORBIDDEN_FUNCTIONS) {
    const re = new RegExp(`\\b${fn}\\b`, "i");
    if (re.test(upper)) {
      throw new Error(`Statement rejected (forbidden function: ${fn})`);
    }
  }
  assertNoLeadingCopy(single);
  return single;
}
