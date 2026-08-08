---
name: inspect-database
description: Understand an unfamiliar PostgreSQL database: identity, schemas, important tables, relationships, indexes, and sizes. Use when onboarding to a database, mapping its structure, or before writing queries against it.
license: MIT
compatibility: Requires the postgresql MCP server bundled with this plugin (bun run ${PLUGIN_ROOT}/packages/postgres-mcp) and a DATABASE_URL at the client level.
metadata:
  plugin: postgresql
  kind: database-mapping
---

# Inspect a PostgreSQL Database

Use this skill when an agent needs a structured map of an unfamiliar database
without touching user data.

## Workflow

Follow this order:

### 1. Identity

Call `database_info` first:

- PostgreSQL version, database name, current user,
- read-only status and timeouts (`transaction_read_only`, `statement_timeout`,
  `lock_timeout`),
- installed extensions,
- the (redacted) connection string.

Confirm the connection is read-only before anything else.

### 2. Schemas

Call `list_schemas`. Note the application schemas (skip `pg_*` and
`information_schema` which the tool already filters).

### 3. Important tables

For each application schema, call `list_tables` (bounded). Identify the core
tables by size and naming. Do **not** fetch user data rows.

### 4. Relationships

For the important tables, call `describe_table`:

- columns, types, nullability, defaults,
- primary key,
- foreign keys (relationships),
- constraints and indexes.

Build the relationship map: which tables reference which.

### 5. Indexes

Call `list_indexes` for the important tables. Note which FK/query columns are
indexed.

### 6. Sizes

Call `database_sizes` for the database size and the largest tables/indexes.

### 7. Report

Give a concise database map:

- identity + read-only confirmation,
- schema list,
- table inventory with sizes,
- key relationships (table → FK → referenced),
- index notes,
- any anomalies (unindexed FKs, oversized tables).

## Guardrails

- Read-only: never query user data rows unless asked.
- Bound everything; do not dump whole tables.
