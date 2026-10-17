// Validates the token system. `npm run tokens:validate` — exits non-zero on any
// failure. Four things are proven:
//
//   1. every var(--x) reference resolves to a defined token
//   2. references only point DOWN the layers (primitive < semantic < component)
//   3. the promised colour pairs meet their WCAG 2.2 contrast minimum
//   4. src/tokens/tokens.css is exactly what the source regenerates (reproducible)

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { layers, allTokens, layerOf } from "./index.mjs";
import { contrastChecks } from "./semantic.mjs";
import { renderCss } from "./emit.mjs";
import { expand, parseColor, contrast } from "./color.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const cssPath = resolve(root, "src/tokens/tokens.css");

const errors = [];
const fail = (msg) => errors.push(msg);

// ── value resolution ─────────────────────────────────────────────────────────
// The colour maths lives in tokens/color.mjs so the Theme Explorer resolves and
// checks contrast exactly the way this validator does. Here we bind the shared
// helpers to `fail`, and to the canonical token map.

/** Fully resolve a canonical token, reporting problems through `fail`. */
const expandToken = (name) => expand(name, allTokens, [name], fail);

// ── 1 & 2: references resolve and only point down ────────────────────────────

const seenNames = new Map();
for (const layer of layers) {
  for (const group of layer.groups) {
    for (const [name, value] of Object.entries(group.tokens)) {
      if (seenNames.has(name)) {
        fail(`duplicate token ${name} (in ${seenNames.get(name)} and ${layer.id})`);
      }
      seenNames.set(name, layer.id);

      const refs = [...value.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)\s*\)/g)].map((m) => m[1]);

      if (layer.allow.length === 0) {
        if (refs.length > 0 || value.includes("color-mix(")) {
          fail(`${name}: a primitive must be a raw value, not a reference or derivation`);
        }
        continue;
      }
      for (const refName of refs) {
        const target = layerOf[refName];
        if (!target) {
          fail(`${name}: references undefined token ${refName}`);
        } else if (!layer.allow.includes(target)) {
          fail(`${name} (${layer.id}) references ${refName} (${target}); only ${layer.allow.join(", ")} allowed`);
        }
      }
    }
  }
}

// ── 3: contrast ──────────────────────────────────────────────────────────────

const contrastRows = [];
for (const { fg, bg, min, why } of contrastChecks) {
  const fgColor = parseColor(expandToken(fg));
  const bgColor = parseColor(expandToken(bg));
  if (!fgColor || !bgColor) {
    fail(`contrast: could not resolve ${fg} on ${bg}`);
    continue;
  }
  const ratio = contrast(fgColor, bgColor);
  const ok = ratio + 1e-9 >= min;
  contrastRows.push({ fg, bg, ratio, min, ok, why });
  if (!ok) {
    fail(`contrast: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min}:1 (${why})`);
  }
}

// ── 4: reproducibility ───────────────────────────────────────────────────────

let committed = null;
try {
  committed = readFileSync(cssPath, "utf8");
} catch {
  fail("src/tokens/tokens.css is missing — run `npm run tokens:build`");
}
if (committed !== null && committed !== renderCss()) {
  fail("src/tokens/tokens.css is stale — run `npm run tokens:build` and commit it");
}

// ── report ───────────────────────────────────────────────────────────────────

const tokenCount = Object.keys(allTokens).length;
console.log(`tokens:validate — ${tokenCount} tokens across ${layers.length} layers\n`);
console.log("contrast promises:");
for (const r of contrastRows) {
  const mark = r.ok ? "ok " : "FAIL";
  console.log(
    `  [${mark}] ${r.ratio.toFixed(2).padStart(6)}:1 (min ${r.min})  ${r.fg} on ${r.bg} — ${r.why}`,
  );
}

if (errors.length > 0) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log("\nall checks passed");
