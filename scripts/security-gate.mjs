#!/usr/bin/env node
// Critical security gate for the HiAI read-only PostgreSQL MCP.
import { spawn } from 'node:child_process';

const URL = process.env.DATABASE_URL;
const serverCmd = ['bun', 'run', 'src/index.ts'];

const cases = [
  ['select_ok', 'SELECT count(*) FROM app.users'],
  ['insert', "INSERT INTO app.users (email) VALUES ('hax@x.y')"],
  ['update', "UPDATE app.users SET name='hax' WHERE id=1"],
  ['delete', 'DELETE FROM app.users WHERE id=1'],
  ['truncate', 'TRUNCATE app.users'],
  ['create_table', 'CREATE TABLE hacked (id int)'],
  ['alter_table', 'ALTER TABLE app.users ADD COLUMN x int'],
  ['drop_table', 'DROP TABLE app.orders'],
  ['create_extension', 'CREATE EXTENSION hstore'],
  ['create_role', 'CREATE ROLE hacker'],
  ['grant', 'GRANT ALL ON app.users TO public'],
  ['revoke', 'REVOKE SELECT ON app.users FROM public'],
  ['copy_program', "COPY app.users TO PROGRAM 'rm -rf /tmp/x'"],
  ['multi_stmt', 'SELECT 1; DELETE FROM app.users'],
  ['begin', 'BEGIN'],
  ['set_readonly_off', "SET default_transaction_read_only = off"],
  ['set_timeout_off', "SET statement_timeout = 0"],
  ['select_into', 'SELECT * INTO hacked FROM app.users'],
  ['analyze_table', 'ANALYZE app.users'],
];

function probe(sql) {
  return new Promise((resolve) => {
    const child = spawn(serverCmd[0], serverCmd.slice(1), {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, DATABASE_URL: URL },
    });
    let buf = '';
    let id = 0;
    let result = null;
    const pending = new Map();
    const call = (m, p) => { id++; pending.set(id, (r) => { if (r.id === id) resolveId(r, m); }); child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method: m, params: p }) + '\n'); };
    function resolveId(msg, m) {
      if (m === 'tools/call') { result = msg; child.kill(); }
    }
    child.stdout.on('data', (d) => {
      buf += d.toString();
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line) continue;
        let msg; try { msg = JSON.parse(line); } catch { continue; }
        const res = pending.get(msg.id);
        if (res) { pending.delete(msg.id); res(msg); }
      }
    });
    child.on('exit', () => resolve(result));
    // initialize
    id++; pending.set(id, (msg) => {
      child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1000, method: 'notifications/initialized', params: {} }) + '\n');
      // tools/call query
      id++; pending.set(id, (r2) => { result = r2; child.kill(); });
      child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method: 'tools/call', params: { name: 'query', arguments: { sql } } }) + '\n');
    });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'pg-gate', version: '1.0' } } }) + '\n');
  });
}

for (const [name, sql] of cases) {
  const r = await probe(sql);
  const txt = r?.error ? JSON.stringify(r.error) : JSON.stringify(r.result || {}).slice(0, 180);
  const isError = r?.error || r?.result?.isError;
  const safeOk = /select_ok/.test(name);
  const expectedFail = !safeOk;
  const outcome = (expectedFail && isError) ? 'REJECTED-OK' : (safeOk && !isError) ? 'ALLOWED-OK' : '!! UNEXPECTED !!';
  console.log(`${name.padEnd(18)} -> ${outcome.padEnd(14)} ${txt.replace(/\n/g, ' ').slice(0, 140)}`);
}
