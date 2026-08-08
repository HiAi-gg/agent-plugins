#!/usr/bin/env bash
# PostgreSQL version matrix test for the bundled HiAI PostgreSQL MCP.
# Usage: ./scripts/pg-matrix.sh [version ...]
# Runs for each version: fixture, full tool suite, and the 19-case security gate.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MCP_DIR="$HERE/../plugins/postgresql/packages/postgres-mcp"
BASE_PORT=15500

versions=("$@")
if [ ${#versions[@]} -eq 0 ]; then
  versions=(14 15 16 17 18 19beta2-alpine)
fi

for v in "${versions[@]}"; do
  echo "=============================================="
  echo "PostgreSQL ${v}"
  echo "=============================================="
  tag="$v"
  if [ "$v" = "19beta2-alpine" ]; then tag="19beta2-alpine"; fi
  port=$BASE_PORT
  BASE_PORT=$((BASE_PORT + 1))

  name="pg-matrix-${v}"
  docker rm -f "$name" >/dev/null 2>&1 || true
  docker run -d --rm --name "$name" -e POSTGRES_PASSWORD=testpw -e POSTGRES_DB=testdb \
    -p "$port:5432" "postgres:$tag" >/dev/null

  ready=0
  for _ in $(seq 1 30); do
    if docker exec "$name" pg_isready -U postgres -d testdb >/dev/null 2>&1; then ready=1; break; fi
    sleep 2
  done
  if [ "$ready" != "1" ]; then echo "FAIL: container not ready"; docker logs "$name" 2>&1 | tail -5; continue; fi

  # fixture (via docker cp — heredoc through docker exec does not reliably feed stdin)
  cat > /tmp/pg-fixture-$v.sql <<'SQL'
CREATE SCHEMA IF NOT EXISTS app;
CREATE TABLE IF NOT EXISTS app.users (id serial primary key, email text unique, name text);
CREATE TABLE IF NOT EXISTS app.orders (id serial primary key, user_id int references app.users(id), amount numeric);
INSERT INTO app.users (email,name) SELECT 'u'||g||'@x.com','U'||g FROM generate_series(1,20) g ON CONFLICT DO NOTHING;
INSERT INTO app.orders (user_id, amount) SELECT (g%20)+1, g*1.5 FROM generate_series(1,50) g ON CONFLICT DO NOTHING;
SQL
  docker cp /tmp/pg-fixture-$v.sql "$name:/tmp/fixture.sql"
  docker exec "$name" psql -U postgres -d testdb -q -f /tmp/fixture.sql >/dev/null 2>&1 || true

  export DATABASE_URL="postgresql://postgres:testpw@127.0.0.1:$port/testdb"
  echo "--- tool suite ---"
  ( cd "$MCP_DIR" && bun run tests/matrix-suite.mjs ) 2>&1 | tail -20
  echo "--- security gate ---"
  ( cd "$MCP_DIR" && node tests/security-gate.mjs ) 2>&1 | awk '{print $1, $2, $3}' | sort | uniq -c | sort -rn | head -8

  docker rm -f "$name" >/dev/null 2>&1 || true
done
