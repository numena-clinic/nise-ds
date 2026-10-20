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
 * Parse a CSS `oklch(l c h [/ a])` string → sRGB { r, g, b, a }, else null.
 * Follows the Color 4 grammar: L is 0–1 (or 0–100%), C is 0–0.4 (or 0–100%),
 * H is a bare number in degrees, alpha is 0–1 (or a percentage). `none` channels
 * and relative `from` colours are not supported and return null.
 */
export function parseOklch(raw) {
  const m = String(raw)
    .trim()
    .toLowerCase()
    .match(
      /^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+(-?[\d.]+)(?:deg)?\s*(?:[/,]\s*([\d.]+%?))?\s*\)$/,
    );
  if (!m) return null;
  const pct = (s, scale) => (s.endsWith("%") ? (parseFloat(s) / 100) * scale : parseFloat(s));
  const l = pct(m[1], 1);
  const c = pct(m[2], 0.4);
  const h = parseFloat(m[3]);
  const a = m[4] === undefined ? 1 : pct(m[4], 1);
  return { ...oklchToRgb({ l, c, h }), a };
}

/**
 * Any CSS colour → { r, g, b, a } (a defaults to 1), else null.
 * Handles "#hex" (3/4/6/8 digits), "transparent", "oklch(...)", and rgb()/rgba()
 * with either legacy commas or modern space/slash syntax and percentage channels.
 */
export function parseColor(raw) {
  const v = String(raw).trim().toLowerCase();
  if (v === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  if (v.startsWith("#")) return hexToRgba(v);
  if (v.startsWith("oklch(")) return parseOklch(v);
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

// ── OKLCH (CSS Color 4) ──────────────────────────────────────────────────────
//
// OKLCH is the canonical *authoring* model for the palette (tokens/palette.mjs
// generates scales here). Nothing downstream needs OKLCH to *be* the runtime
// value: `parseColor` accepts an `oklch(...)` and resolves it to sRGB through the
// exact path the browser uses, so contrast and the DTCG export are computed from
// the final rendered colour (WCAG is defined on sRGB luminance, not OKLCH L).
//
// All matrices are Björn Ottosson's OKLab reference transforms; the gamut map is
// the CSS Color 4 §13 strategy (reduce OKLCH chroma, keep L and H) implemented as
// a deterministic binary search. Pure functions, no dependencies.

/** sRGB gamma channel (0..1) → linear-light (0..1). */
export function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** linear-light channel (0..1) → sRGB gamma (0..1). */
export function linearToSrgb(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
}

/** Linear-light sRGB (0..1) → OKLab { L, a, b }. */
export function linearSrgbToOklab({ r, g, b }) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

/** OKLab { L, a, b } → linear-light sRGB (0..1, may fall out of gamut). */
export function oklabToLinearSrgb({ L, a, b }) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

/** OKLCH { l, c, h } → OKLab { L, a, b }. `h` in degrees. */
export function oklchToOklab({ l, c, h }) {
  const rad = (h * Math.PI) / 180;
  return { L: l, a: c * Math.cos(rad), b: c * Math.sin(rad) };
}

/** OKLab { L, a, b } → OKLCH { l, c, h } (h in degrees, 0..360). */
export function oklabToOklch({ L, a, b }) {
  const c = Math.hypot(a, b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h };
}

/** sRGB { r, g, b } (0..255) → OKLCH { l (0..1), c, h }. */
export function rgbToOklch({ r, g, b }) {
  const lin = {
    r: srgbToLinear(r / 255),
    g: srgbToLinear(g / 255),
    b: srgbToLinear(b / 255),
  };
  return oklabToOklch(linearSrgbToOklab(lin));
}

/** Round a channel to the 8-bit grid a browser serializes, clamped to [0,255]. */
function clamp8(v) {
  return Math.min(255, Math.max(0, Math.round(v)));
}

/**
 * Is a linear-light sRGB triple inside the displayable sRGB cube (with a small
 * tolerance for rounding)? Used by the gamut map's binary search.
 */
function inSrgbGamut({ r, g, b }, eps = 1e-4) {
  return (
    r >= -eps && r <= 1 + eps && g >= -eps && g <= 1 + eps && b >= -eps && b <= 1 + eps
  );
}

/**
 * OKLCH → sRGB { r, g, b, a } (0..255), gamut-mapped if necessary.
 *
 * CSS Color 4 §13: when the colour is out of gamut, reduce chroma (holding L and
 * H) until it fits — the browser's `gamut mapping` for oklch(). Deterministic:
 * a fixed-iteration binary search on C, so the same input always yields the same
 * 8-bit sRGB. `l` is expected 0..1, `h` in degrees.
 */
export function oklchToRgb({ l, c, h }) {
  const L = Math.min(1, Math.max(0, l));
  const C = Math.max(0, c);
  const linearAt = (chroma) => oklabToLinearSrgb(oklchToOklab({ l: L, c: chroma, h }));

  let linear = linearAt(C);
  if (!inSrgbGamut(linear)) {
    // Reduce chroma (holding L and H) until the colour fits the sRGB cube.
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 24; i += 1) {
      const mid = (lo + hi) / 2;
      if (inSrgbGamut(linearAt(mid))) lo = mid;
      else hi = mid;
    }
    linear = linearAt(lo);
  }

  const channel = (v) =>
    clamp8(linearToSrgb(Math.min(1, Math.max(0, v))) * 255);
  return { r: channel(linear.r), g: channel(linear.g), b: channel(linear.b), a: 1 };
}

/** Serialize { r, g, b, a } to `#rrggbb` (or `#rrggbbaa` when not opaque). */
export function toHex({ r, g, b, a = 1 }) {
  const h = [r, g, b].map((n) => clamp8(n).toString(16).padStart(2, "0")).join("");
  return a >= 1 ? `#${h}` : `#${h}${clamp8(a * 255).toString(16).padStart(2, "0")}`;
}

/** An OKLCH colour as a CSS string, e.g. `oklch(0.55 0.19 288.6)`. */
export function formatOklch({ l, c, h }, round = 4) {
  const r = (n) => Number(n.toFixed(round));
  return `oklch(${r(l)} ${r(c)} ${r(h)})`;
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
