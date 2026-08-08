/**
 * Conservative input checks for the read-only query tool.
 *
 * These are NOT the primary security boundary — PostgreSQL session
 * read-only enforcement is. They exist as defense-in-depth: reject obviously
 * unsafe statements before they reach the server, and enforce one-statement
 * discipline.
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
  "COPY",
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
  // procedural / command execution
  "\\!",
  "\\copy",
  "\\g",
  "\\o",
  "\\ir",
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
    throw new Error("Dollar-quoted bodies are not allowed in the read-only query tool");
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
 * Reject statements containing forbidden keywords (word-boundary aware).
 * Also rejects leading keywords that imply mutation (INSERT/UPDATE/...).
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
  return single;
}
