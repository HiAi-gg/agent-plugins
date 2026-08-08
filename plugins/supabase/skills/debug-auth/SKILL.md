---
name: debug-auth
description: "Debug Supabase authentication issues: signup, sign-in, session handling, and RLS access problems from the client perspective. Use when a user cannot sign in, sessions drop, or authenticated requests return 401/403 or empty results."
---

# Debug Supabase Authentication

Use this skill when an agent must diagnose why Supabase auth is failing for a
user or why authenticated data access misbehaves.

## Workflow

### 1. Classify the symptom

- **Sign-in failure**: wrong credentials, disabled user, email
  verification pending, provider (OAuth) misconfigured, rate-limited.
- **Session drops**: token expiry (JWT lifetime), refresh token failure,
  storage/URL config on the client.
- **Authenticated requests fail**: 401 (no/invalid JWT), 403 (RLS denies),
  or 200 with empty rows (RLS filters everything).

### 2. Reproduce and observe

- Replay the failing request via `postgrestRequest`:
  - with no key → anon role (what RLS allows anonymously),
  - with the user's session token (client-level) → authenticated role.
- Compare the two: identical results suggest RLS misconfiguration; a 401/403
  difference points at token handling.

### 3. Check the common causes

- **403 / empty rows**: RLS policies don't match the user's `auth.uid()` —
  see `review-rls`.
- **401**: the anon key/JWT is missing or malformed on the request; check the
  client config.
- **Sign-up flow**: confirm the app uses `signUp` correctly, email
  confirmation is enabled/expected, and the user was actually created.

### 4. Report

State: the symptom, the request/role observations (anon vs authenticated), the
most likely cause, and the narrowest fix (client config, RLS policy, auth
settings). Do not print tokens or session data.

## Guardrails

- Never print JWTs, anon/service-role keys, or session storage.
- Read-only replay of requests; do not modify auth settings without explicit
  user intent.

