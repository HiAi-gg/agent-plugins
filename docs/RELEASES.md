# Releases

## Version policy

Product plugins follow the 0.0.x-first convention:

```
0.0.1 → 0.0.2 → … → 0.0.9 → 0.1.0 → 0.1.1 → …
```

- Initial plugin release: 0.0.1.
- Do not normalize to 0.1.0.
- Bump versions for releases, not ordinary commits.

Agent Plugins Builder and Agent Plugins Doctor are independent projects with
their own release versions (Builder 0.1.0 at the time of writing).

## Collection versioning

The collection itself is independently versioned (root `CHANGELOG.md`, e.g.
0.0.1). Individual plugins keep their own versions.

## Release process

1. Regenerate and validate all 13 plugins (see `docs/DEVELOPMENT.md`).
2. Run the collection audit (exactly 13 active plugins, no debris, no
   secrets, no stale artifacts).
3. Update the plugin's `CHANGELOG.md`, `plugin.json` version, and — when
   releasing — the Git tag.
4. Update the root `CHANGELOG.md` for collection-level changes.
5. Confirm the PostgreSQL matrix (14–18 tested, 19 beta) is current.
6. Create the GitHub Release with evidence (validation status, runtime
   status).

## PostgreSQL GA follow-up

When PostgreSQL 19 reaches GA:

- update the test image,
- rerun the complete runtime matrix and security matrix,
- review PG19 release notes,
- update compatibility documentation,
- remove the beta/experimental qualifier if all gates pass,
- release a PostgreSQL plugin patch version.

Beta compatibility does not imply GA verification.
