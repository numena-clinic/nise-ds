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

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const cssPath = resolve(root, "src/tokens/tokens.css");

const errors = [];
const fail = (msg) => errors.push(msg);

// ── value resolution ─────────────────────────────────────────────────────────

const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  const n =
    h.length === 3
      ? h.split("").map((c) => c + c).join("")
      : h.slice(0, 6);
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
};

const parseColor = (raw) => {
  const v = raw.trim();
  if (v.startsWith("#")) return hexToRgb(v);
  const m = v.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  return null;
};

/** Replace every var(--x) with x's fully-expanded value. */
function substituteVars(value, path = []) {
  return value.replace(/var\(\s*(--[a-zA-Z0-9_-]+)\s*\)/g, (_m, name) => {
    if (!(name in allTokens)) {
      fail(`${path.at(-1) ?? "?"}: references undefined token ${name}`);
      return "0";
    }
    if (path.includes(name)) {
      fail(`circular reference: ${[...path, name].join(" → ")}`);
      return "0";
    }
    return expand(name, [...path, name]);
  });
}

/** Evaluate any color-mix(in srgb, A p%, B) left after var substitution. */
function evalMix(value) {
  return value.replace(
    /color-mix\(\s*in\s+srgb\s*,\s*([^,]+?)\s+([\d.]+)%\s*,\s*([^,)]+?)\s*\)/g,
    (_m, aRaw, pct, bRaw) => {
      const a = parseColor(aRaw);
      const b = parseColor(bRaw);
      if (!a || !b) {
        fail(`could not evaluate color-mix: ${_m}`);
        return "#000000";
      }
      const p = +pct / 100;
      const ch = (x, y) => Math.round(x * p + y * (1 - p));
      return `#${[ch(a.r, b.r), ch(a.g, b.g), ch(a.b, b.b)]
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("")}`;
    },
  );
}

/** Fully resolve a token to a plain value (hex for colours, e.g. "12px" else). */
function expand(name, path = [name]) {
  const raw = allTokens[name];
  if (raw === undefined) {
    fail(`unknown token ${name}`);
    return "";
  }
  return evalMix(substituteVars(raw, path));
}

const luminance = ({ r, g, b }) => {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

const contrast = (fg, bg) => {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

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
  const fgColor = parseColor(expand(fg));
  const bgColor = parseColor(expand(bg));
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
