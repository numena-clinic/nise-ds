// ─────────────────────────────────────────────────────────────────────────────
// Colour maths shared by the token validator (Node, `npm run tokens:validate`)
// and the Theme Explorer (browser). Keeping one implementation means the
// contrast the validator proves is the contrast the explorer reports.
//
// Everything here is pure and operates on a plain `tokenMap` of
// `name → rawValue` (i.e. the shape of `allTokens` in tokens/index.mjs), so the
// explorer can pass an experimental map and get the same resolution.
//
// `onError(message)` is called for problems (a missing reference, a circular
// reference, an unevaluable color-mix). Callers decide whether that is fatal.
// ─────────────────────────────────────────────────────────────────────────────

/** @typedef {Record<string, string>} TokenMap */

/** "#rrggbb" or "#rgb" → { r, g, b }. */
export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.slice(0, 6);
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

/** "#rrggbb" or "rgb(a)(...)" → { r, g, b }, else null. */
export function parseColor(raw) {
  const v = String(raw).trim();
  if (v.startsWith("#")) return hexToRgb(v);
  const m = v.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  return null;
}

/** WCAG 2.x relative luminance of { r, g, b }. */
export function luminance({ r, g, b }) {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** WCAG contrast ratio of two { r, g, b }. */
export function contrast(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Evaluate any `color-mix(in srgb, A p%, B)` left after var substitution. */
export function evalMix(value, onError = () => {}) {
  return value.replace(
    /color-mix\(\s*in\s+srgb\s*,\s*([^,]+?)\s+([\d.]+)%\s*,\s*([^,)]+?)\s*\)/g,
    (_m, aRaw, pct, bRaw) => {
      const a = parseColor(aRaw);
      const b = parseColor(bRaw);
      if (!a || !b) {
        onError(`could not evaluate color-mix: ${_m}`);
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

/** Replace every var(--x) with x's fully-expanded value. */
export function substituteVars(value, tokenMap, path = [], onError = () => {}) {
  return value.replace(/var\(\s*(--[a-zA-Z0-9_-]+)\s*\)/g, (_m, name) => {
    if (!(name in tokenMap)) {
      onError(`${path.at(-1) ?? "?"}: references undefined token ${name}`);
      return "0";
    }
    if (path.includes(name)) {
      onError(`circular reference: ${[...path, name].join(" → ")}`);
      return "0";
    }
    return expand(name, tokenMap, [...path, name], onError);
  });
}

/** Fully resolve a token to a plain value (hex for colours, e.g. "12px" else). */
export function expand(name, tokenMap, path = [name], onError = () => {}) {
  const raw = tokenMap[name];
  if (raw === undefined) {
    onError(`unknown token ${name}`);
    return "";
  }
  return evalMix(substituteVars(raw, tokenMap, path, onError), onError);
}
