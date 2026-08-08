import { describe, expect, test } from "bun:test";
import { assertReadOnlyStatement, assertSingleStatement } from "../src/query-safety";

describe("assertSingleStatement", () => {
  test("accepts a single SELECT", () => {
    expect(assertSingleStatement("SELECT 1")).toBe("SELECT 1");
  });
  test("accepts trailing semicolon", () => {
    expect(assertSingleStatement("SELECT 1;")).toBe("SELECT 1");
  });
  test("rejects multiple statements", () => {
    expect(() => assertSingleStatement("SELECT 1; SELECT 2")).toThrow(/Multiple statements|Semicolon/);
  });
  test("rejects dollar-quoted bodies", () => {
    expect(() => assertSingleStatement("SELECT $$x$$")).toThrow("Dollar-quoted");
  });
});

describe("assertReadOnlyStatement", () => {
  test("rejects INSERT", () => {
    expect(() => assertReadOnlyStatement("INSERT INTO t VALUES (1)")).toThrow("forbidden keyword");
  });
  test("rejects UPDATE", () => {
    expect(() => assertReadOnlyStatement("UPDATE t SET a=1")).toThrow("forbidden keyword");
  });
  test("rejects DELETE", () => {
    expect(() => assertReadOnlyStatement("DELETE FROM t")).toThrow("forbidden keyword");
  });
  test("rejects DDL", () => {
    expect(() => assertReadOnlyStatement("CREATE TABLE x (a int)")).toThrow("forbidden keyword");
    expect(() => assertReadOnlyStatement("DROP TABLE x")).toThrow("forbidden keyword");
  });
  test("rejects SELECT INTO", () => {
    expect(() => assertReadOnlyStatement("SELECT * INTO y FROM t")).toThrow("forbidden keyword");
  });
  test("rejects SET", () => {
    expect(() => assertReadOnlyStatement("SET default_transaction_read_only = off")).toThrow("forbidden keyword");
  });
  test("accepts SELECT with IN in WHERE", () => {
    expect(assertReadOnlyStatement("SELECT * FROM t WHERE a IN (1,2)")).toBe("SELECT * FROM t WHERE a IN (1,2)");
  });
});
