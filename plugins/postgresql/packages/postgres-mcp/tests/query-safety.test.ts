import { describe, expect, test } from "bun:test";
import {
  assertReadOnlyStatement,
  assertSingleStatement,
} from "../src/query-safety";

describe("assertSingleStatement", () => {
  test("accepts a single SELECT", () => {
    expect(assertSingleStatement("SELECT 1")).toBe("SELECT 1");
  });
  test("accepts trailing semicolon", () => {
    expect(assertSingleStatement("SELECT 1;")).toBe("SELECT 1");
  });
  test("rejects multiple statements", () => {
    expect(() => assertSingleStatement("SELECT 1; SELECT 2")).toThrow(
      /Multiple statements|Semicolon/,
    );
  });
  test("rejects dollar-quoted bodies", () => {
    expect(() => assertSingleStatement("SELECT $$x$$")).toThrow(
      "Dollar-quoted",
    );
  });
});

describe("assertReadOnlyStatement", () => {
  test("rejects INSERT", () => {
    expect(() => assertReadOnlyStatement("INSERT INTO t VALUES (1)")).toThrow(
      "forbidden keyword",
    );
  });
  test("rejects UPDATE", () => {
    expect(() => assertReadOnlyStatement("UPDATE t SET a=1")).toThrow(
      "forbidden keyword",
    );
  });
  test("rejects DELETE", () => {
    expect(() => assertReadOnlyStatement("DELETE FROM t")).toThrow(
      "forbidden keyword",
    );
  });
  test("rejects DDL", () => {
    expect(() => assertReadOnlyStatement("CREATE TABLE x (a int)")).toThrow(
      "forbidden keyword",
    );
    expect(() => assertReadOnlyStatement("DROP TABLE x")).toThrow(
      "forbidden keyword",
    );
  });
  test("rejects SELECT INTO", () => {
    expect(() => assertReadOnlyStatement("SELECT * INTO y FROM t")).toThrow(
      "forbidden keyword",
    );
  });
  test("rejects SET", () => {
    expect(() =>
      assertReadOnlyStatement("SET default_transaction_read_only = off"),
    ).toThrow("forbidden keyword");
  });
  test("accepts SELECT with IN in WHERE", () => {
    expect(assertReadOnlyStatement("SELECT * FROM t WHERE a IN (1,2)")).toBe(
      "SELECT * FROM t WHERE a IN (1,2)",
    );
  });
});

// F-1 regression: psql backslash meta-commands (g/o/copy/ir) were compiled
// through identity escapes into bare-letter word matches, rejecting legitimate
// identifiers. The MCP sends SQL directly to PostgreSQL (never interactive
// psql), so psql meta-commands cannot be executed and must not be filtered.
describe("F-1 regression: legitimate identifiers are accepted", () => {
  test("accepts generate_series with column alias g", () => {
    const sql = "SELECT g FROM generate_series(1,1000) AS x(g)";
    expect(assertReadOnlyStatement(sql)).toBe(sql);
  });
  test("accepts table alias o", () => {
    const sql = "SELECT o.total FROM app.orders o WHERE o.id = 1";
    expect(assertReadOnlyStatement(sql)).toBe(sql);
  });
  test("accepts column named copy", () => {
    const sql = "SELECT copy FROM some_table";
    expect(assertReadOnlyStatement(sql)).toBe(sql);
  });
  test("accepts column named role", () => {
    const sql = "SELECT role FROM some_table";
    expect(assertReadOnlyStatement(sql)).toBe(sql);
  });
  test("accepts SELECT 1 AS copy", () => {
    expect(assertReadOnlyStatement("SELECT 1 AS copy")).toBe(
      "SELECT 1 AS copy",
    );
  });
  test("accepts alias ir", () => {
    expect(assertReadOnlyStatement("SELECT ir.id FROM app.users ir")).toBe(
      "SELECT ir.id FROM app.users ir",
    );
  });
});

// F-2 / F-3: the query tool must reject function calls that can disable the
// read-only boundary (set_config) or reach server files / admin state
// (pg_read_file & friends). These blocks are defense-in-depth; PostgreSQL role
// privileges remain the primary boundary.
describe("F-2/F-3 regression: blocked functions are rejected", () => {
  test("rejects set_config read-only bypass", () => {
    expect(() =>
      assertReadOnlyStatement(
        "SELECT set_config('default_transaction_read_only','off',false)",
      ),
    ).toThrow("forbidden function: set_config");
  });
  test("rejects set_config statement timeout bypass", () => {
    expect(() =>
      assertReadOnlyStatement(
        "SELECT set_config('statement_timeout','0',false)",
      ),
    ).toThrow("forbidden function");
  });
  test("rejects pg_read_file", () => {
    expect(() =>
      assertReadOnlyStatement("SELECT pg_read_file('/etc/passwd')"),
    ).toThrow("forbidden function: pg_read_file");
  });
  test("rejects pg_read_binary_file", () => {
    expect(() =>
      assertReadOnlyStatement("SELECT pg_read_binary_file('PG_VERSION')"),
    ).toThrow("forbidden function: pg_read_binary_file");
  });
  test("rejects pg_ls_dir", () => {
    expect(() =>
      assertReadOnlyStatement("SELECT count(*) FROM pg_ls_dir('/')"),
    ).toThrow("forbidden function: pg_ls_dir");
  });
  test("rejects pg_stat_file", () => {
    expect(() =>
      assertReadOnlyStatement("SELECT pg_stat_file('PG_VERSION')"),
    ).toThrow("forbidden function: pg_stat_file");
  });
  test("rejects pg_file_rename", () => {
    expect(() =>
      assertReadOnlyStatement("SELECT pg_file_rename('a','b')"),
    ).toThrow("forbidden function");
  });
  test("rejects pg_file_unlink", () => {
    expect(() => assertReadOnlyStatement("SELECT pg_file_unlink('a')")).toThrow(
      "forbidden function",
    );
  });
  test("rejects pg_logdir_files", () => {
    expect(() =>
      assertReadOnlyStatement("SELECT count(*) FROM pg_logdir_files()"),
    ).toThrow("forbidden function");
  });
  test("rejects pg_walfile_name", () => {
    expect(() =>
      assertReadOnlyStatement("SELECT pg_walfile_name('0/0')"),
    ).toThrow("forbidden function");
  });
  test("rejects schema-qualified blocked function", () => {
    expect(() =>
      assertReadOnlyStatement(
        "SELECT pg_catalog.set_config('default_transaction_read_only','off',false)",
      ),
    ).toThrow("forbidden function");
  });
  test("rejects pg_authid catalog disclosure", () => {
    expect(() =>
      assertReadOnlyStatement("SELECT rolname, rolpassword FROM pg_authid"),
    ).toThrow("forbidden function: pg_authid");
  });
  test("rejects pg_reload_conf", () => {
    expect(() => assertReadOnlyStatement("SELECT pg_reload_conf()")).toThrow(
      "forbidden function",
    );
  });
  test("rejects COPY as a leading statement", () => {
    expect(() =>
      assertReadOnlyStatement("COPY app.users TO PROGRAM 'rm -rf /tmp/x'"),
    ).toThrow("forbidden keyword: COPY");
  });
});
