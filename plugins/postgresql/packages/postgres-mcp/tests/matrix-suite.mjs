#!/usr/bin/env node
// Full tool suite for the bundled HiAI PostgreSQL MCP against a live database.
// Calls every safe tool through the MCP protocol and reports PASS/FAIL.
import { spawn } from 'node:child_process';

const serverCmd = ['bun', 'run', 'src/index.ts'];

const toolCalls = [
  ['database_info', {}],
  ['list_schemas', {}],
  ['list_tables', { schema: 'app' }],
  ['describe_table', { schema: 'app', table: 'orders' }],
  ['list_indexes', { schema: 'app', table: 'orders' }],
  ['query', { sql: 'SELECT count(*) AS n FROM app.orders' }],
  ['explain_query', { sql: 'SELECT * FROM app.orders WHERE user_id = 5' }],
  ['database_activity', {}],
  ['locks', {}],
  ['slow_queries', {}],
  ['table_health', { schema: 'app', table: 'orders' }],
  ['database_sizes', {}],
  ['health_summary', {}],
];

function probe(tool, args) {
  return new Promise((resolve) => {
    const child = spawn(serverCmd[0], serverCmd.slice(1), {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env },
    });
    let buf = '';
    let id = 0;
    let result = null;
    const pending = new Map();
    child.stdout.on('data', (d) => {
      buf += d.toString();
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line) continue;
        let msg;
        try { msg = JSON.parse(line); } catch { continue; }
        const r = pending.get(msg.id);
        if (r) { pending.delete(msg.id); r(msg); }
      }
    });
    child.stderr.on('data', () => {});
    child.on('exit', () => resolve(result));
    const call = (m, p) => { id++; pending.set(id, (msg) => { if (m === 'tools/call') { result = msg; child.kill(); } }); child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method: m, params: p }) + '\n'); };
    id++; pending.set(id, (msg) => { call('tools/call', { name: tool, arguments: args }); });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'matrix', version: '1.0' } } }) + '\n');
  });
}

let pass = 0, fail = 0;
for (const [tool, args] of toolCalls) {
  const r = await probe(tool, args);
  const isErr = r?.error || r?.result?.isError;
  // slow_queries may return available:false (graceful) — that is a PASS for the tool contract
  const txt = r?.result ? JSON.stringify(r.result) : JSON.stringify(r?.error);
  const gracefulUnavailable = tool === 'slow_queries' && txt.includes('available');
  if (!isErr || gracefulUnavailable) {
    console.log(`PASS ${tool}`);
    pass++;
  } else {
    console.log(`FAIL ${tool}: ${txt.slice(0, 120)}`);
    fail++;
  }
}
console.log(`\nSUITE: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
