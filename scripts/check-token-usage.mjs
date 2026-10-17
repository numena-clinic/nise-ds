// Enforces the token boundary across the source tree. `npm run check:usage`.
//
// This is the mechanical half of "tokens are the only source of visual truth".
// It fails the build when component code:
//   1. references a token that does not exist (a typo, or a token never built)
//   2. writes a raw colour literal instead of a semantic token
//   3. writes an off-token px value for a spacing / radius / type property
//
// Two kinds of `var()` are treated as intentional and left alone:
//   · a var with a fallback — var(--button-radius, var(--radius-md)) — is a
//     documented override hook and need not be defined
//   · a var in the --radix- namespace is supplied at runtime by Radix

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { allTokens } from "../tokens/index.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const srcDir = resolve(root, "src");

const GENERATED = ["src/tokens/tokens.css"];

const COLOR_LITERAL =
  /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|\b(?:rgb|rgba|hsl|hsla)\(/;

const NAMED_COLORS = new Set([
  "black", "white", "red", "green", "blue", "yellow", "orange", "purple",
  "pink", "brown", "gray", "grey", "silver", "maroon", "navy", "teal",
  "olive", "lime", "aqua", "fuchsia", "cyan", "magenta", "gold", "crimson",
  "salmon", "tomato", "khaki", "indigo", "violet",
]);

// px is only allowed on these when it comes through a token.
const PX_PROPERTY =
  /^(?:margin|padding|gap|row-gap|column-gap|inset|font-size|line-height|letter-spacing|border-width|outline-offset|outline-width|outline|border)(?:-(?:top|right|bottom|left|inline|block|start|end))*(?:-(?:width|radius|size))*$/;
const PX_PROPERTY_RADIUS = /(?:^|-)(?:border-)?radius(?:$|-)/;

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
const report = (file, line, message) => {
  problems.push(`${relative(root, file)}:${line}  ${message}`);
};

const def = (name) => name in allTokens || name.startsWith("--radix-") || name.startsWith("--nise-");

// ── 1: var() references ──────────────────────────────────────────────────────

function checkVars(file, line, text) {
  for (const m of text.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)\s*(,|\))/g)) {
    const [, name, closer] = m;
    // `)` means no fallback → the token must exist.
    if (closer === ")" && !def(name)) {
      report(file, line, `unknown token ${name}`);
    }
  }
}

// ── 2: raw colour literals ───────────────────────────────────────────────────

function checkColor(file, line, text) {
  if (COLOR_LITERAL.test(text)) {
    report(file, line, `raw colour literal — use a semantic token: ${text.trim()}`);
    return;
  }
  for (const m of text.matchAll(/:\s*([a-zA-Z]+)\s*;/g)) {
    const word = m[1].toLowerCase();
    if (NAMED_COLORS.has(word)) {
      report(file, line, `named colour "${word}" — use a semantic token`);
    }
  }
}

// ── 3: off-token px on spacing / radius / type ───────────────────────────────

function checkPx(file, line, prop, value) {
  if (!PX_PROPERTY.test(prop) && !PX_PROPERTY_RADIUS.test(prop)) return;
  const decl = prop.startsWith("border") || prop.includes("radius") || prop.includes("outline")
    ? value
    : value.replace(/var\([^)]*\)|calc\([^)]*\)|[a-z-]+\([^)]*\)/gi, "");
  for (const m of decl.matchAll(/(-?\d*\.?\d+)px/g)) {
    if (parseFloat(m[1]) === 0) continue;
    report(file, line, `off-token px on \`${prop}\` — use a token (--space-*, --radius-*, …)`);
    return;
  }
}

// ── walk ─────────────────────────────────────────────────────────────────────

for (const file of walk(srcDir)) {
  const rel = relative(root, file);
  if (GENERATED.includes(rel)) continue;

  const lines = readFileSync(file, "utf8").split("\n");
  const isCss = file.endsWith(".css");

  lines.forEach((raw, i) => {
    const line = i + 1;
    const text = raw.replace(/\/\*.*?\*\//g, "").trim();
    if (!text || text.startsWith("//")) return;

    checkVars(file, line, raw);
    checkColor(file, line, text);

    if (isCss || text.includes(":")) {
      const decl = text.match(/^([a-z-]+)\s*:\s*(.+?);?\s*$/);
      if (decl) checkPx(file, line, decl[1], decl[2]);
    }
  });
}

if (problems.length > 0) {
  console.error(`check:usage — ${problems.length} problem(s):\n`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}
console.log(`check:usage — token usage is clean across ${relative(root, srcDir)}`);
