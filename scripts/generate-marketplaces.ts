#!/usr/bin/env bun
/**
 * Deterministic marketplace index generator for the HiAI Agent Plugins
 * collection.
 *
 * Reads the canonical `plugins/<name>/plugin.json` files (exactly the 13
 * active plugins) and derives name / version / description / homepage /
 * repository / license / keywords for every plugin. It then writes three
 * client-specific marketplace manifests:
 *
 *   .agents/plugins/marketplace.json   OpenAI Codex  (git-subdir sources)
 *   .cursor-plugin/marketplace.json    Cursor       (relative path sources)
 *   .github/plugin/marketplace.json    GitHub Copilot CLI + VS Code (relative
 *                                      path sources; VS Code reads the Copilot
 *                                      convention too)
 *
 * The generator fails hard when the active plugin count or names drift from
 * the canonical 13. It never reads or rewrites `plugins/<name>/plugin.json`;
 * the generated manifests are the only output.
 * generated manifests are the only output.
 *
 * Usage:
 *   bun run scripts/generate-marketplaces.ts           # write the manifests
 *   bun run scripts/generate-marketplaces.ts --check   # exit 1 on drift
 *
 * The manifests are generated artifacts: do not edit them by hand. Regenerate
 * instead (see docs/DEVELOPMENT.md).
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

/** The canonical active plugin set, in display order (matches README + CI). */
export const CANONICAL_PLUGINS = [
  "github",
  "agent-browser",
  "context7",
  "firecrawl",
  "redis",
  "sentry",
  "supabase",
  "figma",
  "cloudflare",
  "notion",
  "docker",
  "kubernetes",
  "postgresql",
] as const;

/** Marketplace identity — bump COLLECTION_VERSION on each collection release. */
export const MARKETPLACE_NAME = "hiai-agent-plugins";
export const DISPLAY_NAME = "HiAI Agent Plugins";
export const OWNER_NAME = "HiAI";
export const OWNER_URL = "https://github.com/HiAi-gg";
export const COLLECTION_VERSION = "0.0.2";
export const MARKETPLACE_DESCRIPTION =
  "HiAI's curated collection of 13 validated portable Agent Plugins: trusted MCP and CLI integrations paired with focused Agent Skills and safe defaults.";

export const REPO_URL = "https://github.com/HiAi-gg/agent-plugins";
export const REPO_GIT_URL = "https://github.com/HiAi-gg/agent-plugins.git";
export const GIT_REF = "main";

/** Client manifest paths, relative to the repository root. */
export const MANIFEST_PATHS = {
  codex: ".agents/plugins/marketplace.json",
  cursor: ".cursor-plugin/marketplace.json",
  copilot: ".github/plugin/marketplace.json",
} as const;

/** Plugins that ship no mcp.json (skills-only). */
const SKILLS_ONLY = new Set(["docker", "agent-browser"]);

export interface PluginInfo {
  name: string;
  version: string;
  description: string;
  authorName: string;
  authorUrl: string;
  homepage: string;
  repository: string;
  license: string;
  keywords: string[];
  /** Canonical plugin directory relative to the repo root, e.g. plugins/github */
  path: string;
}

function fail(message: string): never {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

/**
 * Load and validate the canonical plugin set from `plugins/<name>/plugin.json`.
 * Fails on count/name drift, unreadable manifests, or missing fields.
 */
export function loadPlugins(root: string = ROOT): PluginInfo[] {
  const pluginsDir = join(root, "plugins");
  const entries = readdirSync(pluginsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  if (entries.length !== CANONICAL_PLUGINS.length) {
    fail(
      `expected ${CANONICAL_PLUGINS.length} active plugin directories, found ${entries.length}: ${entries.join(", ")}`,
    );
  }
  const canonical = [...CANONICAL_PLUGINS].sort();
  for (let i = 0; i < canonical.length; i++) {
    if (entries[i] !== canonical[i]) {
      fail(
        `active plugin set drifted (rename/add/remove?): got ${entries[i]}, expected ${canonical[i]}`,
      );
    }
  }

  const plugins: PluginInfo[] = [];
  for (const name of CANONICAL_PLUGINS) {
    const pluginJsonPath = join(pluginsDir, name, "plugin.json");
    let raw: string;
    try {
      raw = readFileSync(pluginJsonPath, "utf8");
    } catch {
      fail(`cannot read ${pluginJsonPath}`);
    }
    let doc: Record<string, unknown>;
    try {
      doc = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      fail(`plugins/${name}/plugin.json is not valid JSON`);
    }
    const required = [
      "name",
      "version",
      "description",
      "homepage",
      "repository",
      "license",
      "keywords",
    ] as const;
    for (const field of required) {
      if (typeof doc[field] !== "string" && field !== "keywords") {
        fail(`plugins/${name}/plugin.json missing string field "${field}"`);
      }
    }
    if (!Array.isArray(doc.keywords) || doc.keywords.length === 0) {
      fail(`plugins/${name}/plugin.json missing non-empty keywords array`);
    }
    const author = doc.author as { name?: string; url?: string } | undefined;
    if (!author || typeof author.name !== "string") {
      fail(`plugins/${name}/plugin.json missing author.name`);
    }
    if (doc.name !== name) {
      fail(
        `plugins/${name}/plugin.json declares name "${doc.name}" but the directory is "${name}"`,
      );
    }
    if (
      typeof doc.version !== "string" ||
      typeof doc.description !== "string"
    ) {
      fail(`plugins/${name}/plugin.json has invalid version/description`);
    }
    if (
      typeof doc.homepage !== "string" ||
      typeof doc.repository !== "string"
    ) {
      fail(`plugins/${name}/plugin.json has invalid homepage/repository`);
    }
    if (typeof doc.license !== "string") {
      fail(`plugins/${name}/plugin.json has invalid license`);
    }

    // Path verification: every plugin.json path referenced by the manifests
    // must exist, and the mcp.json contract must hold (all plugins ship an
    // mcp.json except the skills-only docker and agent-browser).
    const mcpJsonPath = join(pluginsDir, name, "mcp.json");
    const mcpExists = readdirSync(join(pluginsDir, name)).includes("mcp.json");
    if (SKILLS_ONLY.has(name) && mcpExists) {
      fail(`plugins/${name} is skills-only but ships an unexpected mcp.json`);
    }
    if (!SKILLS_ONLY.has(name) && !mcpExists) {
      fail(`plugins/${name} is missing its expected mcp.json (${mcpJsonPath})`);
    }

    plugins.push({
      name: doc.name as string,
      version: doc.version as string,
      description: doc.description as string,
      authorName: author.name,
      authorUrl: typeof author.url === "string" ? author.url : "",
      homepage: doc.homepage as string,
      repository: doc.repository as string,
      license: doc.license as string,
      keywords: (doc.keywords as string[]).map(String),
      path: `plugins/${name}`,
    });
  }
  return plugins;
}

function codexSource(p: PluginInfo) {
  return {
    source: "git-subdir",
    url: REPO_GIT_URL,
    path: `./${p.path}`,
    ref: GIT_REF,
  };
}

function relativeSource(p: PluginInfo) {
  return `./${p.path}`;
}

function sharedEntryFields(p: PluginInfo) {
  return {
    description: p.description,
    version: p.version,
    author: { name: p.authorName, url: p.authorUrl },
    homepage: p.homepage,
    repository: p.repository,
    license: p.license,
    keywords: p.keywords,
  };
}

function codexManifest(plugins: PluginInfo[]) {
  return {
    name: MARKETPLACE_NAME,
    interface: { displayName: DISPLAY_NAME },
    owner: { name: OWNER_NAME, url: OWNER_URL },
    metadata: {
      description: MARKETPLACE_DESCRIPTION,
      version: COLLECTION_VERSION,
    },
    plugins: plugins.map((p) => ({
      name: p.name,
      source: codexSource(p),
      policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
      ...sharedEntryFields(p),
    })),
  };
}

function cursorManifest(plugins: PluginInfo[]) {
  return {
    name: MARKETPLACE_NAME,
    owner: { name: OWNER_NAME },
    metadata: {
      description: MARKETPLACE_DESCRIPTION,
      version: COLLECTION_VERSION,
    },
    plugins: plugins.map((p) => ({
      name: p.name,
      source: relativeSource(p),
      ...sharedEntryFields(p),
    })),
  };
}

function copilotManifest(plugins: PluginInfo[]) {
  // GitHub Copilot CLI and VS Code both consume this convention; the entry
  // shape is identical to Cursor's relative-source form.
  return cursorManifest(plugins);
}

export type ManifestKind = keyof typeof MANIFEST_PATHS;

/**
 * Build all three marketplace manifests as `{ relativePath: contents }`.
 * Deterministic: fixed key ordering + canonical plugin ordering.
 */
export function buildMarketplaces(root: string = ROOT): Record<string, string> {
  const plugins = loadPlugins(root);
  const manifests: Record<ManifestKind, unknown> = {
    codex: codexManifest(plugins),
    cursor: cursorManifest(plugins),
    copilot: copilotManifest(plugins),
  };
  const out: Record<string, string> = {};
  for (const kind of Object.keys(manifests) as ManifestKind[]) {
    out[MANIFEST_PATHS[kind]] = JSON.stringify(manifests[kind], null, 2) + "\n";
  }
  return out;
}

function writeAll(root: string, manifests: Record<string, string>): void {
  for (const [rel, contents] of Object.entries(manifests)) {
    const target = join(root, rel);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, contents, "utf8");
    console.log(`wrote ${rel}`);
  }
}

function checkAll(root: string, manifests: Record<string, string>): boolean {
  let ok = true;
  for (const [rel, expected] of Object.entries(manifests)) {
    const target = join(root, rel);
    let actual: string;
    try {
      actual = readFileSync(target, "utf8");
    } catch {
      console.error(
        `DRIFT ${rel}: file is missing (expected generated manifest)`,
      );
      ok = false;
      continue;
    }
    if (actual !== expected) {
      console.error(
        `DRIFT ${rel}: committed manifest differs from generated output`,
      );
      const a = actual.split("\n");
      const e = expected.split("\n");
      const n = Math.max(a.length, e.length);
      for (let i = 0; i < n; i++) {
        if (a[i] !== e[i]) {
          console.error(`  line ${i + 1}: expected ${JSON.stringify(e[i])}`);
          console.error(`  line ${i + 1}: actual   ${JSON.stringify(a[i])}`);
          break;
        }
      }
      ok = false;
    }
  }
  return ok;
}

function main(): void {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  const manifests = buildMarketplaces(ROOT);
  if (check) {
    if (!checkAll(ROOT, manifests)) {
      console.error(
        "marketplace drift detected; run `bun run scripts/generate-marketplaces.ts`",
      );
      process.exit(1);
    }
    console.log(
      "marketplaces: deterministic, committed files match generated output",
    );
  } else {
    writeAll(ROOT, manifests);
    console.log("marketplaces: wrote 3 client manifests (13 plugins)");
  }
}

if (import.meta.main) {
  main();
}
