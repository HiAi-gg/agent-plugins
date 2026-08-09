#!/usr/bin/env bun
/**
 * Deterministic validation for the three client marketplace manifests.
 *
 * Reuses the generator's canonical loading and `--check` logic so there is no
 * duplicated drift logic: if the committed manifests match a fresh generation
 * AND every semantic constraint holds, validation passes.
 *
 * Checks performed:
 *   1. Every manifest parses as JSON.
 *   2. Exactly 13 plugins in every manifest, in canonical order (no
 *      add/remove/rename can slip through).
 *   3. Entry metadata (version, description, homepage, repository, license,
 *      keywords, author) matches the canonical `plugins/<name>/plugin.json`
 *      values.
 *   4. Source shapes: Codex entries are `git-subdir` with the canonical repo
 *      URL, `./plugins/<name>` path and `main` ref; Cursor and Copilot entries
 *      are relative `./plugins/<name>` paths.
 *   5. Every referenced plugin path exists on disk.
 *   6. No secret-like literals in any manifest.
 *
 * Usage:
 *   bun run scripts/validate-marketplaces.ts
 *
 * Exit code 0 = pass; any failure prints the exact problem and exits 1.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CANONICAL_PLUGINS,
  MARKETPLACE_NAME,
  OWNER_NAME,
  REPO_GIT_URL,
  GIT_REF,
  COLLECTION_VERSION,
  buildMarketplaces,
  loadPlugins,
  MANIFEST_PATHS,
} from "./generate-marketplaces.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

/** Mirrors the CI secret-scan heuristic: documented references are expected. */
const SECRET_RE = /(password|secret|token|api_key)\s*[:=]\s*['"][^'"]{8,}/i;
const DOCUMENTED = /env\.|EXAMPLE|placeholder/;

interface Entry {
  name: string;
  source: unknown;
  description?: string;
  version?: string;
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  author?: { name?: string; url?: string };
}

let failures = 0;

function check(condition: boolean, message: string): void {
  if (!condition) {
    failures++;
    console.error(`FAIL ${message}`);
  }
}

function expectString(value: unknown, label: string): string {
  check(
    typeof value === "string" && value.length > 0,
    `${label} must be a non-empty string`,
  );
  return typeof value === "string" ? value : "";
}

function main(): void {
  // 0. Drift: the committed manifests must be byte-identical to a fresh
  //    generation (determinism + no hand edits).
  const expected = buildMarketplaces(ROOT);
  for (const [rel, contents] of Object.entries(expected)) {
    const target = join(ROOT, rel);
    check(existsSync(target), `${rel} must exist`);
    if (!existsSync(target)) continue;
    const actual = readFileSync(target, "utf8");
    check(
      actual === contents,
      `${rel} must match generated output (run the generator)`,
    );
  }

  // 1-4. Per-manifest semantic validation.
  const plugins = loadPlugins(ROOT); // fails hard on count/name/field drift
  const byName = new Map(plugins.map((p) => [p.name, p]));

  for (const [kind, rel] of Object.entries(MANIFEST_PATHS)) {
    const target = join(ROOT, rel);
    let doc: {
      name?: unknown;
      owner?: { name?: unknown };
      metadata?: { version?: unknown };
      plugins?: unknown;
    };
    try {
      doc = JSON.parse(readFileSync(target, "utf8"));
    } catch (err) {
      check(false, `${rel} must be valid JSON (${(err as Error).message})`);
      continue;
    }

    check(
      doc.name === MARKETPLACE_NAME,
      `${rel} name must be ${MARKETPLACE_NAME}`,
    );
    check(
      typeof doc.owner === "object" &&
        doc.owner !== null &&
        doc.owner.name === OWNER_NAME,
      `${rel} owner.name must be ${OWNER_NAME}`,
    );
    check(
      typeof doc.metadata === "object" && doc.metadata !== null,
      `${rel} metadata object must be present`,
    );
    if (doc.metadata && doc.metadata.version !== COLLECTION_VERSION) {
      check(false, `${rel} metadata.version must be ${COLLECTION_VERSION}`);
    }

    const entries = doc.plugins;
    check(Array.isArray(entries), `${rel} plugins must be an array`);
    if (!Array.isArray(entries)) continue;
    check(
      entries.length === CANONICAL_PLUGINS.length,
      `${rel} must list exactly ${CANONICAL_PLUGINS.length} plugins, found ${entries.length}`,
    );

    const names = entries.map((e) => (e as { name?: unknown }).name);
    for (let i = 0; i < CANONICAL_PLUGINS.length && i < names.length; i++) {
      check(
        names[i] === CANONICAL_PLUGINS[i],
        `${rel} plugin[${i}] must be ${CANONICAL_PLUGINS[i]}, found ${String(names[i])}`,
      );
    }

    for (const raw of entries as Entry[]) {
      const label = `${rel} plugin "${raw.name}"`;
      const canonical = raw.name ? byName.get(raw.name) : undefined;
      check(
        canonical !== undefined,
        `${label} must be a canonical active plugin`,
      );
      if (!canonical) continue;

      check(
        raw.version === canonical.version,
        `${label} version must be ${canonical.version}`,
      );
      check(
        raw.description === canonical.description,
        `${label} description must match plugin.json`,
      );
      check(
        raw.homepage === canonical.homepage,
        `${label} homepage must be ${canonical.homepage}`,
      );
      check(
        raw.repository === canonical.repository,
        `${label} repository must be ${canonical.repository}`,
      );
      check(
        raw.license === canonical.license,
        `${label} license must be ${canonical.license}`,
      );
      check(
        Array.isArray(raw.keywords) &&
          raw.keywords.length > 0 &&
          raw.keywords.every((k) => typeof k === "string"),
        `${label} keywords must be a non-empty string array`,
      );
      check(
        typeof raw.author === "object" &&
          raw.author !== null &&
          raw.author.name === OWNER_NAME,
        `${label} author.name must be ${OWNER_NAME}`,
      );

      if (kind === "codex") {
        const s = raw.source as {
          source?: unknown;
          url?: unknown;
          path?: unknown;
          ref?: unknown;
        };
        check(
          typeof s === "object" && s !== null && s.source === "git-subdir",
          `${label} source must be a git-subdir object`,
        );
        check(
          s.url === REPO_GIT_URL,
          `${label} source.url must be ${REPO_GIT_URL}`,
        );
        check(
          s.path === `./${canonical.path}`,
          `${label} source.path must be ./${canonical.path}`,
        );
        check(s.ref === GIT_REF, `${label} source.ref must be ${GIT_REF}`);
      } else {
        check(
          raw.source === `./${canonical.path}`,
          `${label} source must be the relative path ./${canonical.path}`,
        );
      }
    }
  }

  // 5. Every referenced plugin path exists on disk (both manifest source forms).
  for (const name of CANONICAL_PLUGINS) {
    check(
      existsSync(join(ROOT, "plugins", name, "plugin.json")),
      `plugins/${name}/plugin.json must exist`,
    );
  }

  // 6. No secret-like literals anywhere in the manifests.
  for (const rel of Object.values(MANIFEST_PATHS)) {
    const text = readFileSync(join(ROOT, rel), "utf8");
    for (const line of text.split("\n")) {
      if (SECRET_RE.test(line) && !DOCUMENTED.test(line)) {
        check(false, `${rel} contains a secret-like literal: ${line.trim()}`);
      }
    }
  }

  if (failures === 0) {
    console.log(
      "marketplace validation: PASS (13 plugins x 3 manifests, sources, no secrets)",
    );
  } else {
    console.error(`marketplace validation: FAILED (${failures} problem(s))`);
    process.exit(1);
  }
}

main();
