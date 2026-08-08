/**
 * PostgreSQL connection management for the HiAI read-only PostgreSQL MCP.
 *
 * Safety model (defense in depth):
 *  1. Server-side: every session is forced read-only via PostgreSQL session
 *     settings (default_transaction_read_only, transaction_read_only) and a
 *     strict statement_timeout / lock_timeout.
 *  2. Tool-level: the only SQL-executing tool (query) is documented
 *     read-only; the server itself provides no write tool.
 *  3. Conservative input checks: single statement, no trailing semicolons
 *     beyond one, forbidden keywords rejected before execution.
 *  4. Output limits: row caps and byte caps with an explicit `truncated`
 *     flag (never silent truncation).
 *  5. Credential redaction: connection strings are never echoed; errors are
 *     scrubbed of password material.
 */

/**
 * Bun.SQL database handle. `Bun.SQL` exists at runtime; the bun type
 * declarations expose it under `Bun.SQL` (a `Database` class). We type it
 * narrowly here to the API surface we use so the MCP stays decoupled from
 * Bun's evolving type exports.
 *
 * Bun.SQL API (verified against Bun 1.3.x):
 *   - `db.unsafe(sql)` -> Query (Promise-like) with `.execute()` returning
 *     an array of row objects, `.values()` returning arrays of scalars, and
 *     `.run()` for non-SELECT.
 *   - `db.begin()` / `db.transaction()` for transactions.
 */
export type SqlDatabase = {
  unsafe(
    sql: string,
    params?: unknown[],
  ): {
    execute(...paramsOrArray: unknown[]): Promise<Record<string, unknown>[]>;
    values(...paramsOrArray: unknown[]): Promise<unknown[][]>;
    run(
      ...paramsOrArray: unknown[]
    ): Promise<{ changes: number; lastInsertRowid: unknown }>;
  };
  close(): void;
};

export interface PgConfig {
  /** PostgreSQL connection string. Must NOT contain credentials we leak. */
  url: string;
  /** Statement timeout in milliseconds (0 = no timeout). */
  statementTimeoutMs: number;
  /** Lock timeout in milliseconds. */
  lockTimeoutMs: number;
  /** Idle-in-transaction session timeout in milliseconds. */
  idleInTransactionTimeoutMs: number;
  /** Default result row limit. */
  defaultRowLimit: number;
  /** Hard maximum result row limit. */
  maxRowLimit: number;
  /** Hard maximum result bytes. */
  maxResultBytes: number;
  /** Application name reported to PostgreSQL. */
  appName: string;
}

/** Resolve the required DATABASE_URL, failing fast when it is unset. */
export function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url || url.trim() === "") {
    throw new Error(
      "DATABASE_URL environment variable is required. Set it to your PostgreSQL connection string.",
    );
  }
  return url;
}

export const DEFAULT_CONFIG: PgConfig = {
  url: requireDatabaseUrl(),
  statementTimeoutMs: 10_000,
  lockTimeoutMs: 5_000,
  idleInTransactionTimeoutMs: 60_000,
  defaultRowLimit: 100,
  maxRowLimit: 500,
  maxResultBytes: 1_000_000,
  appName: "hiai-agent-plugin-postgresql",
};

/** Redact credentials from a connection string for display. */
export function redactUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.password) u.password = "***";
    if (u.username) u.username = "***";
    return u.toString();
  } catch {
    // Not a parseable URL; strip anything between :// and @ as best effort.
    return url.replace(/(:\/\/)[^@]+@/, "$1***:***@");
  }
}

/** Scrub credential-looking material from arbitrary error/diagnostic text. */
export function scrubSecrets(text: string): string {
  return text
    .replace(/password=([^\s]+)/gi, "password=***")
    .replace(/postgres(ql)?:\/\/[^@\s]+@/gi, (m) =>
      m.replace(/[^@\s]+@/, "***@"),
    );
}

let db: SqlDatabase | null = null;

/**
 * Build the connection URL with server-side safety options embedded in the
 * conninfo. This is the PRIMARY read-only enforcement: PostgreSQL itself
 * applies `default_transaction_read_only=on` to EVERY pooled connection
 * (Bun.SQL pools connections, so per-session set_config alone would only
 * affect whichever pooled connection ran it).
 */
export function buildSafeUrl(rawUrl: string, config: PgConfig): string {
  const sep = rawUrl.includes("?") ? "&" : "?";
  const options = [
    "default_transaction_read_only=on",
    `statement_timeout=${config.statementTimeoutMs}`,
    `lock_timeout=${config.lockTimeoutMs}`,
    `idle_in_transaction_session_timeout=${config.idleInTransactionTimeoutMs}`,
    `application_name=${config.appName}`,
  ];
  return `${rawUrl}${sep}options=${encodeURIComponent(`-c ${options.join(" -c ")}`)}`;
}

export function getDb(config: PgConfig = DEFAULT_CONFIG): SqlDatabase {
  if (db) return db;
  if (!config.url || config.url.trim() === "") {
    throw new Error(
      "DATABASE_URL environment variable is required. Set it to your PostgreSQL connection string.",
    );
  }
  // Bun.SQL is available at runtime; cast through unknown to keep the MCP
  // decoupled from Bun's exact type export shape.
  const Database = (Bun as unknown as { SQL: new (url: string) => SqlDatabase })
    .SQL;
  db = new Database(buildSafeUrl(config.url, config));
  return db;
}

/**
 * Apply session-level safety settings on a fresh connection.
 * These are enforced server-side by PostgreSQL itself. The conninfo options
 * (buildSafeUrl) are the primary enforcement for pooled connections; these
 * set_config calls reinforce the current connection.
 */
export function applySessionSafety(db: SqlDatabase, config: PgConfig): void {
  db.unsafe(`SELECT set_config('application_name', $1, false)`, [
    config.appName,
  ])
    .execute()
    .catch(() => {});
  db.unsafe(`SELECT set_config('default_transaction_read_only', 'on', false)`)
    .execute()
    .catch(() => {});
  db.unsafe(`SELECT set_config('transaction_read_only', 'on', true)`)
    .execute()
    .catch(() => {});
  db.unsafe(`SELECT set_config('statement_timeout', $1, false)`, [
    String(config.statementTimeoutMs),
  ])
    .execute()
    .catch(() => {});
  db.unsafe(`SELECT set_config('lock_timeout', $1, false)`, [
    String(config.lockTimeoutMs),
  ])
    .execute()
    .catch(() => {});
  db.unsafe(
    `SELECT set_config('idle_in_transaction_session_timeout', $1, false)`,
    [String(config.idleInTransactionTimeoutMs)],
  )
    .execute()
    .catch(() => {});
}

/** Reset the singleton (used by tests). */
export function resetDb(): void {
  db = null;
}

/** Execute a statement and return the first row (or undefined). */
export async function firstRow(
  db: SqlDatabase,
  sql: string,
  params?: unknown[],
): Promise<Record<string, unknown> | undefined> {
  const rows = await db.unsafe(sql, params).execute();
  return rows[0];
}
