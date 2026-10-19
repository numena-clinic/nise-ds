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

/** "#rgb"/"#rgba"/"#rrggbb"/"#rrggbbaa" → { r, g, b, a }. */
export function hexToRgba(hex) {
  const h = hex.replace("#", "");
  const n =
    h.length === 3 || h.length === 4
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
    a: n.length === 8 ? parseInt(n.slice(6, 8), 16) / 255 : 1,
  };
}

/** "#rrggbb" or "#rgb" → { r, g, b }. */
export function hexToRgb(hex) {
  return hexToRgba(hex);
}

/**
 * Any CSS colour → { r, g, b, a } (a defaults to 1), else null.
 * Handles "#hex" (3/4/6/8 digits), "transparent", and rgb()/rgba() with either
 * legacy commas or modern space/slash syntax and percentage channels.
 */
export function parseColor(raw) {
  const v = String(raw).trim().toLowerCase();
  if (v === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  if (v.startsWith("#")) return hexToRgba(v);
  const m = v.match(
    /^rgba?\(\s*([\d.]+%?)[\s,]+([\d.]+%?)[\s,]+([\d.]+%?)\s*(?:[,/]\s*([\d.]+%?))?\s*\)/,
  );
  if (!m) return null;
  const ch = (s) => (s.endsWith("%") ? (parseFloat(s) / 100) * 255 : parseFloat(s));
  const a =
    m[4] === undefined
      ? 1
      : m[4].endsWith("%")
        ? parseFloat(m[4]) / 100
        : parseFloat(m[4]);
  return { r: ch(m[1]), g: ch(m[2]), b: ch(m[3]), a };
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

/**
 * Premultiplied-alpha mix of two {r,g,b,a} at fraction `p` of `a`, per CSS
 * Color 5 §3.5. Returned channels are unrounded (0–255 float), so callers can
 * either round to 8-bit (the CSS serialisation) or keep full precision.
 */
export function mixRgb(a, b, p) {
  const alpha = a.a * p + b.a * (1 - p);
  const ch = (x, y) => (alpha === 0 ? 0 : (x * a.a * p + y * b.a * (1 - p)) / alpha);
  return { r: ch(a.r, b.r), g: ch(a.g, b.g), b: ch(a.b, b.b), a: alpha };
}

/**
 * Evaluate any `color-mix(in srgb, A p%, B)` left after var substitution,
 * following CSS Color 5 §3.5: channels are interpolated *premultiplied* by
 * alpha, then un-premultiplied, so mixing with `transparent` preserves hue
 * while lowering alpha. An opaque result stays "#rrggbb" (byte-identical to
 * the previous naive lerp); a translucent result becomes "rgba(r, g, b, a)".
 */
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
      const { r, g, b: bl, a: alpha } = mixRgb(a, b, +pct / 100);
      const rgb = [Math.round(r), Math.round(g), Math.round(bl)];
      if (alpha >= 1) {
        return `#${rgb.map((n) => n.toString(16).padStart(2, "0")).join("")}`;
      }
      return `rgba(${rgb.join(", ")}, ${Math.round(alpha * 1000) / 1000})`;
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
