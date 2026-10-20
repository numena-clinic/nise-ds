// Validates the token system. `npm run tokens:validate` — exits non-zero on any
// failure. Five things are proven:
//
//   1. every var(--x) reference resolves to a defined token
//   2. references only point DOWN the layers (primitive < semantic < component)
//   3. the reference graph is acyclic (no token depends on itself, directly or
//      transitively — a cycle would make `expand()` recurse without end)
//   4. the promised colour pairs meet their WCAG 2.2 contrast minimum, in the
//      light mapping AND every theme override (dark)
//   5. src/tokens/tokens.css is exactly what the source regenerates (reproducible)
//
// Each theme override must map the SAME role names as the light base (one
// contract), reference only primitives, and pass the same contrast promises.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { layers, allTokens, layerOf, themes, primitives } from "./index.mjs";
import { contrastChecks } from "./semantic.mjs";
import { renderCss } from "./emit.mjs";
import { expand, parseColor, contrast } from "./color.mjs";
import { refsOf, findCycles } from "./graph.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const cssPath = resolve(root, "src/tokens/tokens.css");

const errors = [];
const fail = (msg) => errors.push(msg);

// ── value resolution ─────────────────────────────────────────────────────────
// The colour maths lives in tokens/color.mjs so the Theme Explorer resolves and
// checks contrast exactly the way this validator does: `expand(name, map, path,
// fail)` resolves a token within a given theme map, reporting through `fail`.

// ── 1 & 2: references resolve and only point down ────────────────────────────

const seenNames = new Map();
for (const layer of layers) {
  for (const group of layer.groups) {
    for (const [name, value] of Object.entries(group.tokens)) {
      if (seenNames.has(name)) {
        fail(`duplicate token ${name} (in ${seenNames.get(name)} and ${layer.id})`);
      }
      seenNames.set(name, layer.id);

      const refs = refsOf(value);

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

// ── 3: the reference graph is acyclic ────────────────────────────────────────

for (const cycle of findCycles(allTokens)) {
  fail(`circular reference: ${cycle.join(" → ")}`);
}

// ── theme overrides: same contract, references resolve and point down ─────────
//
// Each theme maps the SAME role names (so a component reads one name in every
// theme), references only primitives (dark is a mapping, not a new value set),
// and is itself acyclic.

/** theme id → the token map used to resolve that theme (primitives + overrides). */
const themeTokens = { light: allTokens };
for (const theme of themes) {
  const overrides = Object.fromEntries(
    theme.groups.flatMap((group) => Object.entries(group.tokens)),
  );
  const seen = new Set();
  for (const [name, value] of Object.entries(overrides)) {
    if (seen.has(name)) fail(`theme "${theme.id}": duplicate override ${name}`);
    seen.add(name);

    if (!(name in allTokens)) {
      fail(`theme "${theme.id}": overrides unknown role ${name} (not in the light contract)`);
    }
    for (const refName of refsOf(value)) {
      const target = layerOf[refName];
      if (!target) {
        fail(`theme "${theme.id}": ${name} references undefined token ${refName}`);
      } else if (target !== "primitive") {
        fail(`theme "${theme.id}": ${name} references ${refName} (${target}); only primitive allowed`);
      }
    }
  }

  const map = { ...primitives, ...overrides };
  for (const cycle of findCycles(map)) {
    fail(`theme "${theme.id}": circular reference: ${cycle.join(" → ")}`);
  }
  themeTokens[theme.id] = map;
}

// ── 4: contrast, in every theme ──────────────────────────────────────────────

const contrastRows = [];
for (const [themeId, map] of Object.entries(themeTokens)) {
  for (const { fg, bg, min, why } of contrastChecks) {
    const fgColor = parseColor(expand(fg, map, [fg], fail));
    const bgColor = parseColor(expand(bg, map, [bg], fail));
    if (!fgColor || !bgColor) {
      fail(`contrast (${themeId}): could not resolve ${fg} on ${bg}`);
      continue;
    }
    const ratio = contrast(fgColor, bgColor);
    const ok = ratio + 1e-9 >= min;
    contrastRows.push({ themeId, fg, bg, ratio, min, ok, why });
    if (!ok) {
      fail(
        `contrast (${themeId}): ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min}:1 (${why})`,
      );
    }
  }
}

// ── 5: reproducibility ───────────────────────────────────────────────────────

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
console.log(
  `tokens:validate — ${tokenCount} tokens across ${layers.length} layers, ${themes.length} theme(s)\n`,
);
for (const themeId of Object.keys(themeTokens)) {
  console.log(`contrast promises — ${themeId}:`);
  for (const row of contrastRows.filter((x) => x.themeId === themeId)) {
    const mark = row.ok ? "ok " : "FAIL";
    console.log(
      `  [${mark}] ${row.ratio.toFixed(2).padStart(6)}:1 (min ${row.min})  ${row.fg} on ${row.bg} — ${row.why}`,
    );
  }
}

if (errors.length > 0) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log("\nall checks passed");
