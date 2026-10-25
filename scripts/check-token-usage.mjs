// Enforces the token boundary across the source tree. `npm run check:usage`.
//
// This CLI walks the code that consumes tokens — src/ and .storybook/ — and
// delegates every decision to the pure scanner in
// scripts/lib/token-usage.mjs (unit-tested in tests/usage.test.ts), which fails
// when component code:
//   1. references a token that does not exist (a typo, or a token never built)
//   2. writes a raw color literal instead of a semantic token
//   3. references a PRIMITIVE token directly instead of a semantic role
//   4. writes an off-token px value for a spacing / radius / type property
//
// `NISE_ALLOW_PRIMITIVE_REF=1` relaxes rule 3 for a one-off investigation; the
// generated token layer and the Theme Explorer are inherently primitive and are
// exempted below rather than by the env var.
//
// Two kinds of `var()` are treated as intentional and left alone:
//   · a var with a fallback — var(--button-radius, var(--radius-md)) — is a
//     documented override hook and need not be defined
//   · a var in the --radix- namespace is supplied at runtime by Radix

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { allTokens } from "../tokens/index.mjs";
import { GENERATED, scanSource } from "./lib/token-usage.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const srcDir = resolve(root, "src");
// The Storybook preview paints the theme onto the docs canvas, so it consumes
// the same roles as src/ and is held to the same boundary. Leaving it out is
// how a renamed role survived here while every other consumer was migrated.
const scanRoots = [srcDir, resolve(root, ".storybook")];

// The Theme Explorer renders the PRIMITIVE and semantic layers themselves (it is
// the token editor), and the generated layer is a primitive artifact — both
// legitimately name primitives. Everything else consumes semantic roles.
const PRIMITIVE_EXEMPT = [/^src[/\\]tokens[/\\]tokens\.css$/, /^src[/\\]explorer[/\\]/];

const isKnownToken = (name) =>
  name in allTokens || name.startsWith("--radix-") || name.startsWith("--nise-");

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else if (/\.(?:css|tsx?)$/.test(entry)) out.push(full);
  }
  return out;
}

const problems = [];
for (const file of scanRoots.flatMap((dir) => walk(dir))) {
  const rel = relative(root, file);
  if (GENERATED.includes(rel)) continue;

  const text = readFileSync(file, "utf8");
  const found = scanSource(text, { isCss: file.endsWith(".css"), isKnownToken });
  const allowPrimitive = PRIMITIVE_EXEMPT.some((re) => re.test(rel));
  for (const { line, message } of found) {
    if (allowPrimitive && message.includes("primitive `")) continue;
    problems.push(`${rel}:${line}  ${message}`);
  }
}

if (problems.length > 0) {
  console.error(`check:usage — ${problems.length} problem(s):\n`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}
console.log(
  `check:usage — token usage is clean across ${scanRoots
    .map((dir) => relative(root, dir))
    .join(", ")}`,
);
