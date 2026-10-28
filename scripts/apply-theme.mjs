#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Promotion: turn a Theme Explorer candidate into real edits to the token source.
//
//     npm run theme:apply theme-candidate.json           # dry-run: show the diff
//     npm run theme:apply theme-candidate.json --write   # apply, rebuild, validate
//
// Design intent
// ────────────
// A browser tab cannot (and must not) write source files. The explorer therefore
// only ever produces a CANDIDATE — a small, versioned list of token edits. This
// script is the local, explicit, reviewable step that applies it.
//
// · Dry-run is the default. Nothing is written until `--write`.
// · Each token is replaced on its own source line; nothing else is reformatted.
// · After a write it runs `tokens:build` and `tokens:validate`. If either fails,
//   the token source is restored and the command exits non-zero — a bad candidate
//   can never leave the repo in a broken state.
// · It never commits or pushes. Git stays the user's decision.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { planPromotion, TOKEN_FILES } from "./lib/promote.mjs";

const SCHEMA = "nise.theme-candidate";
const VERSION = 1;

function usage() {
  console.log(`usage: npm run theme:apply -- <candidate.json> [--write]

  <candidate.json>   candidate exported from the Theme Explorer
  --write            apply the edits, then rebuild + validate (default: dry-run)

  The leading -- lets npm pass the flags through to the script.`);
}

function fail(msg) {
  console.error(`theme:apply — ${msg}`);
  process.exit(1);
}

function readCandidate(file) {
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    fail(`${file}: not valid JSON — ${e.message}`);
  }
  if (data?.schema !== SCHEMA) fail(`expected "schema": "${SCHEMA}"`);
  if (data?.version !== VERSION) fail(`unsupported version: ${String(data?.version)}`);
  if (!Array.isArray(data.tokens)) fail('"tokens" must be an array');
  return data;
}

function npm(script) {
  execFileSync("npm", ["run", script], { stdio: "inherit" });
}

const argv = process.argv.slice(2);
const write = argv.includes("--write");
const args = argv.filter((a) => a !== "--write");
if (args.includes("--help") || args.includes("-h") || args.length === 0) {
  usage();
  process.exit(args.length === 0 ? 1 : 0);
}

const root = process.cwd();
const candidatePath = resolve(root, args[0]);
const candidate = readCandidate(candidatePath);

const plan = planPromotion(root, candidate);

if (plan.errors.length) {
  console.error("theme:apply — refusing to write, candidate failed validation:");
  for (const e of plan.errors) console.error(`  · ${e}`);
  process.exit(1);
}

if (plan.edits.length === 0) {
  console.log("theme:apply — candidate makes no changes to the token source.");
  process.exit(0);
}

console.log(`theme:apply — ${plan.edits.length} change${plan.edits.length === 1 ? "" : "s"} from ${args[0]}\n`);
for (const e of plan.edits) {
  console.log(`  ${e.name}`);
  console.log(`    ${e.file}:${e.line}`);
  console.log(`    - ${e.from}`);
  console.log(`    + ${e.to}\n`);
}

if (!write) {
  console.log("Dry run — no files written. Re-run with `npm run theme:apply -- <file> --write` to apply.");
  process.exit(0);
}

import { existsSync, unlinkSync } from "node:fs";

const GENERATED_ARTIFACTS = [
  "src/tokens/tokens.css",
  "tokens/dist/tokens.json",
  "tokens/dist/nise.tokens.json",
];

// ── apply, with rollback on a failed rebuild or validation ───────────────────
const backups = new Map();
for (const rel of [...Object.values(TOKEN_FILES), ...GENERATED_ARTIFACTS]) {
  const abs = resolve(root, rel);
  if (existsSync(abs)) {
    backups.set(rel, readFileSync(abs, "utf8"));
  } else {
    backups.set(rel, null);
  }
}

const restore = () => {
  for (const [rel, text] of backups) {
    const abs = resolve(root, rel);
    if (text === null) {
      if (existsSync(abs)) unlinkSync(abs);
    } else {
      writeFileSync(abs, text);
    }
  }
};

for (const [rel, text] of Object.entries(plan.files)) {
  writeFileSync(resolve(root, rel), text);
  console.log(`wrote ${rel}`);
}

try {
  npm("tokens:build");
  npm("tokens:validate");
} catch (e) {
  restore();
  console.error(`\ntheme:apply — rebuild or validation failed, source and artifacts restored.\n${e.message}`);
  process.exit(1);
}

console.log(`\ntheme:apply — applied ${plan.edits.length} change(s).`);
console.log("Run `npm run verify` before committing. Nothing was committed or pushed.");
