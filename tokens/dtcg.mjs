// ─────────────────────────────────────────────────────────────────────────────
// DTCG 2025.10 export — an interchange artifact, generated from tokens/*.mjs.
//
// This module reads the SAME canonical source as the CSS build and the
// validator (tokens/index.mjs) and renders a Design Tokens Community Group
// (DTCG) 2025.10 document: `tokens/dist/nise.tokens.json`.
//
//   · It does NOT replace the proprietary `tokens/dist/tokens.json`; that
//     artifact and every CSS/component/explorer behaviour are untouched.
//   · `$value`/`$type` follow the Format Module 2025.10 (a stable Final
//     Community Group Report). Colors follow the Color Module 2025.10
//     `color` object ({ colorSpace, components, alpha?, hex }).
//   · Aliases become `{group.token}` references and inherit `$type` from the
//     token they point at, per §5.2.2.
//   · A `color-mix(...)` value has no DTCG equivalent, so it is precomputed to
//     a literal color here (via tokens/color.mjs) and its derivation recipe is
//     kept under the `com.numena.nise` extension.
//   · Values the standard cannot express faithfully (em/ch dimensions) are
//     NOT faked or silently dropped: they are listed, with their original
//     value, under the `com.numena.nise` root extension `cssOnlyTokens`.
//
// Deterministic: same source → same bytes.
// ─────────────────────────────────────────────────────────────────────────────

import { layers, allTokens } from "./index.mjs";
import { colorMeta } from "./palette.mjs";
import { expand, parseColor, mixRgb, substituteVars } from "./color.mjs";

/** Vendor namespace for extensions (reverse-DNS, brand-owned). */
const NS = "com.numena.nise";

// ── value grammars ───────────────────────────────────────────────────────────
const ALIAS = /^var\(\s*(--[a-zA-Z0-9_-]+)\s*\)$/;
const MIX = /^color-mix\(/;
const HEX = /^#[0-9a-fA-F]{3,8}$/;
const BEZIER = /^cubic-bezier\(/;
const DIM = /^(-?\d*\.?\d+)(px|rem)$/;
const OTHER_DIM = /^(-?\d*\.?\d+)(em|ex|ch|rem|vw|vh|vmin|vmax|%|pt|pc|cm|mm|in)$/;
const DURATION = /^(-?\d*\.?\d+)(ms|s)$/;
const NUMBER = /^-?\d*\.?\d+$/;
const FONT_FAMILY = new Set(["--font-sans", "--font-serif"]);

/** Classify a token into a DTCG type (or the two non-type outcomes). */
function typeOf(name, raw) {
  if (ALIAS.test(raw)) return "alias";
  if (MIX.test(raw) || HEX.test(raw)) return "color";
  if (BEZIER.test(raw)) return "cubicBezier";
  if (name.startsWith("--shadow-")) return "shadow";
  if (name.startsWith("--font-weight-")) return "fontWeight";
  if (FONT_FAMILY.has(name)) return "fontFamily";
  if (DIM.test(raw)) return "dimension";
  if (OTHER_DIM.test(raw)) return "unsupported";
  if (DURATION.test(raw)) return "duration";
  if (NUMBER.test(raw)) return "number";
  return "unsupported";
}

// ── value builders ───────────────────────────────────────────────────────────
function rgbHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((n) => Math.round(n).toString(16).padStart(2, "0"))
    .join("")}`;
}

function colorValueFromRgba(c) {
  const ch = (n) => Number((n / 255).toFixed(6));
  const value = {
    colorSpace: "srgb",
    components: [ch(c.r), ch(c.g), ch(c.b)],
  };
  if (c.a < 1) value.alpha = Number(c.a.toFixed(6));
  value.hex = rgbHex(c);
  return value;
}

function colorValue(resolved) {
  const c = parseColor(resolved);
  if (!c) throw new Error(`dtcg: cannot parse color "${resolved}"`);
  return colorValueFromRgba(c);
}

/**
 * Resolve a `color-mix(in srgb, …)` to full-precision sRGB channels (no 8-bit
 * rounding), so the exported components equal the browser's computed value
 * rather than a byte-quantised approximation.
 */
function preciseMixRgba(name, raw) {
  const substituted = substituteVars(raw, allTokens, [name], (m) => {
    throw new Error(`dtcg: ${m}`);
  });
  const m = substituted.match(
    /color-mix\(\s*in srgb,\s*(.+?)\s+([\d.]+)%\s*,\s*(.+?)\s*\)/,
  );
  if (!m) throw new Error(`dtcg: cannot read color-mix "${raw}"`);
  const a = parseColor(m[1]);
  const b = parseColor(m[3]);
  if (!a || !b) throw new Error(`dtcg: cannot parse color-mix operands in "${raw}"`);
  return mixRgb(a, b, Number(m[2]) / 100);
}

function dimension(raw) {
  const m = raw.match(DIM);
  return { value: Number(m[1]), unit: m[2] };
}

function duration(raw) {
  const m = raw.match(DURATION);
  return { value: Number(m[1]), unit: m[2] };
}

function bezier(raw) {
  return raw
    .slice("cubic-bezier(".length, -1)
    .split(",")
    .map((s) => Number(s.trim()));
}

function shadow(resolved) {
  const m = resolved.match(/^(.*?)\s+(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8})$/);
  if (!m) throw new Error(`dtcg: cannot parse shadow "${resolved}"`);
  const len = (s) => {
    const mm = s.match(/^(-?\d*\.?\d+)(px|rem)?$/);
    if (!mm) throw new Error(`dtcg: bad shadow length "${s}"`);
    return { value: Number(mm[1]), unit: mm[2] ?? "px" };
  };
  const [offsetX, offsetY, blur, spread = "0"] = m[1].trim().split(/\s+/);
  return {
    color: colorValue(m[2]),
    offsetX: len(offsetX),
    offsetY: len(offsetY),
    blur: len(blur),
    spread: len(spread),
  };
}

/** The `$value` (and any type-appropriate shape) for a non-alias token. */
function literalValue(kind, resolved) {
  switch (kind) {
    case "color":
      return colorValue(resolved);
    case "dimension":
      return dimension(resolved);
    case "duration":
      return duration(resolved);
    case "number":
      return Number(resolved);
    case "fontWeight":
      return Number(resolved);
    case "fontFamily":
      return resolved.split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
    case "cubicBezier":
      return bezier(resolved);
    case "shadow":
      return shadow(resolved);
    default:
      throw new Error(`dtcg: no builder for kind "${kind}"`);
  }
}

/** The derivation recipe of a `color-mix(...)`, for the extension metadata. */
function mixMeta(raw) {
  const m = raw.match(
    /^color-mix\(\s*in srgb,\s*(.+?)\s+([\d.]+)%\s*,\s*(.+?)\s*\)$/,
  );
  if (!m) return null;
  const name = (s) => {
    const r = s.match(ALIAS);
    return r ? r[1] : s.trim();
  };
  return { from: [name(m[1]), name(m[3])], percent: Number(m[2]) };
}

// ── structure ────────────────────────────────────────────────────────────────
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const key = (name) => name.replace(/^--/, "");

/** Ordered map of every token name → its dotted path in the document. */
function buildPaths() {
  const path = {};
  for (const layer of layers) {
    for (const group of layer.groups) {
      const base = `${layer.id}.${slug(group.label)}`;
      for (const name of Object.keys(group.tokens)) {
        path[name] = `${base}.${key(name)}`;
      }
    }
  }
  return path;
}

const UNSUPPORTED_REASON =
  "DTCG dimension values support only px and rem; em/ch cannot be represented faithfully.";

/**
 * Render the whole document as pretty-printed JSON.
 * @returns {string}
 */
export function renderDtcg() {
  const pathOf = buildPaths();

  // Representability, resolving aliases to their target.
  const kindOf = {};
  for (const [name, raw] of Object.entries(allTokens)) {
    kindOf[name] = typeOf(name, raw);
  }
  const representable = {};
  const ok = (name) => {
    if (name in representable) return representable[name];
    const kind = kindOf[name];
    let result = kind !== "unsupported";
    if (result && kind === "alias") {
      const target = allTokens[name].match(ALIAS)[1];
      result = ok(target);
    }
    return (representable[name] = result);
  };

  const cssOnly = [];
  const doc = { $description: "Nise Design System — DTCG 2025.10 export." };

  for (const layer of layers) {
    const layerNode = { $description: layer.title };
    for (const group of layer.groups) {
      const groupNode = {};
      if (group.note) groupNode.$description = group.note;
      for (const [name, raw] of Object.entries(group.tokens)) {
        if (!ok(name)) {
          cssOnly.push({ cssVar: name, ...unsupportedRecord(raw) });
          continue;
        }
        const kind = kindOf[name];
        const meta = { cssVar: name };
        let node;
        if (kind === "alias") {
          const target = raw.match(ALIAS)[1];
          node = { $value: `{${pathOf[target]}}` };
        } else if (MIX.test(raw)) {
          node = {
            $type: "color",
            $value: colorValueFromRgba(preciseMixRgba(name, raw)),
          };
          const recipe = mixMeta(raw);
          if (recipe) meta.mix = recipe;
        } else {
          const resolved = expand(name, allTokens);
          node = { $type: kind, $value: literalValue(kind, resolved) };
        }
        // OKLCH is the canonical authoring space (tokens/palette.mjs); the
        // emitted $value is sRGB, so record the OKLCH alongside it where known.
        const authored = colorMeta[name];
        if (authored) meta.oklch = authored.oklch;
        node.$extensions = { [NS]: meta };
        groupNode[key(name)] = node;
      }
      layerNode[slug(group.label)] = groupNode;
    }
    doc[layer.id] = layerNode;
  }

  doc.$extensions = {
    [NS]: {
      version: 1,
      source: "tokens/*.mjs",
      cssOnlyTokens: cssOnly.sort((a, b) => a.cssVar.localeCompare(b.cssVar)),
    },
  };

  return `${JSON.stringify(doc, null, 2)}\n`;
}

/** Original value + unit + why, for a token the standard cannot express. */
function unsupportedRecord(raw) {
  const m = raw.match(OTHER_DIM);
  return {
    value: raw,
    ...(m ? { unit: m[2] } : {}),
    reason: UNSUPPORTED_REASON,
  };
}
