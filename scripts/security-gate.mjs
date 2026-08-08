#!/usr/bin/env node
// Critical security gate for the HiAI read-only PostgreSQL MCP.
import { spawn } from "node:child_process";

const URL = process.env.DATABASE_URL;
const serverCmd = ["bun", "run", "src/index.ts"];

const cases = [
  ["select_ok", "SELECT count(*) FROM app.users"],
  ["select_ok_g", "SELECT g FROM generate_series(1,1000) AS x(g)"],
  ["select_ok_o", "SELECT o.total FROM app.orders o WHERE o.id = 1"],
  ["select_ok_copy_alias", "SELECT 1 AS copy"],
  ["select_ok_role_alias", "SELECT 1 AS role"],
  ["insert", "INSERT INTO app.users (email) VALUES ('hax@x.y')"],
  ["update", "UPDATE app.users SET name='hax' WHERE id=1"],
  ["delete", "DELETE FROM app.users WHERE id=1"],
  ["truncate", "TRUNCATE app.users"],
  ["create_table", "CREATE TABLE hacked (id int)"],
  ["alter_table", "ALTER TABLE app.users ADD COLUMN x int"],
  ["drop_table", "DROP TABLE app.orders"],
  ["create_extension", "CREATE EXTENSION hstore"],
  ["create_role", "CREATE ROLE hacker"],
  ["grant", "GRANT ALL ON app.users TO public"],
  ["revoke", "REVOKE SELECT ON app.users FROM public"],
  ["copy_program", "COPY app.users TO PROGRAM 'rm -rf /tmp/x'"],
  ["multi_stmt", "SELECT 1; DELETE FROM app.users"],
  ["begin", "BEGIN"],
  ["set_readonly_off", "SET default_transaction_read_only = off"],
  ["set_timeout_off", "SET statement_timeout = 0"],
  [
    "set_config_readonly_off",
    "SELECT set_config('default_transaction_read_only','off',false)",
  ],
  ["pg_read_file", "SELECT pg_read_file('/etc/passwd')"],
  ["pg_read_binary_file", "SELECT pg_read_binary_file('PG_VERSION')"],
  ["pg_ls_dir", "SELECT count(*) FROM pg_ls_dir('/')"],
  ["pg_stat_file", "SELECT pg_stat_file('PG_VERSION')"],
  ["pg_authid", "SELECT rolname, rolpassword FROM pg_authid"],
  ["pg_reload_conf", "SELECT pg_reload_conf()"],
  ["select_into", "SELECT * INTO hacked FROM app.users"],
  ["analyze_table", "ANALYZE app.users"],
];

function probe(sql) {
  return new Promise((resolve) => {
    const child = spawn(serverCmd[0], serverCmd.slice(1), {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, DATABASE_URL: URL },
    });
    let buf = "";
    let id = 0;
    let result = null;
    const pending = new Map();
    child.stdout.on("data", (d) => {
      buf += d.toString();
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line) continue;
        let msg;
        try {
          msg = JSON.parse(line);
        } catch {
          continue;
        }
        const res = pending.get(msg.id);
        if (res) {
          pending.delete(msg.id);
          res(msg);
        }
      }
    });
    child.on("exit", () => resolve(result));
    // initialize
    id++;
    pending.set(id, () => {
      child.stdin.write(
        JSON.stringify({
          jsonrpc: "2.0",
          id: 1000,
          method: "notifications/initialized",
          params: {},
        }) + "\n",
      );
      // tools/call query
      id++;
      pending.set(id, (r2) => {
        result = r2;
        child.kill();
      });
      child.stdin.write(
        JSON.stringify({
          jsonrpc: "2.0",
          id,
          method: "tools/call",
          params: { name: "query", arguments: { sql } },
        }) + "\n",
      );
    });
    child.stdin.write(
      JSON.stringify({
        jsonrpc: "2.0",
        id,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "pg-gate", version: "1.0" },
        },
      }) + "\n",
    );
  });
}

let unexpected = 0;
for (const [name, sql] of cases) {
  const r = await probe(sql);
  const txt = r?.error
    ? JSON.stringify(r.error)
    : JSON.stringify(r.result || {}).slice(0, 180);
  const isError = r?.error || r?.result?.isError;
  const safeOk = /select_ok/.test(name);
  const expectedFail = !safeOk;
  const outcome =
    expectedFail && isError
      ? "REJECTED-OK"
      : safeOk && !isError
        ? "ALLOWED-OK"
        : "!! UNEXPECTED !!";
  if (outcome === "!! UNEXPECTED !!") unexpected++;
  console.log(
    `${name.padEnd(22)} -> ${outcome.padEnd(14)} ${txt.replace(/\n/g, " ").slice(0, 140)}`,
  );
}
console.log(`\nGATE: ${cases.length} cases, ${unexpected} unexpected`);
process.exit(unexpected === 0 ? 0 : 1);
