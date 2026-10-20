// ─────────────────────────────────────────────────────────────────────────────
// token source: the COLOUR ARCHITECTURE, authored in OKLCH.
//
// This is the canonical model for every colour value in Nise. It has two parts:
//
//   1. The ten brand anchors from numena-brand color.md §2. Their published hex
//      is preserved verbatim and their provenance is kept alongside the OKLCH we
//      derive FROM that hex — the brand stays the authority on identity, and we
//      never round its values through our own maths. (Analysis of these anchors
//      is in docs/palette.md; it is why no anchor value is changed here.)
//
//   2. Generated scales: one neutral ramp and three chromatic families (purple
//      as the primary identity, cyan and tangerine as the supporting accents the
//      interface actually uses). A ramp is a lightness curve plus a
//      family-specific chroma curve, evaluated in OKLCH and gamut-mapped to sRGB
//      by tokens/color.mjs — never a naive interpolation between two hexes.
//
// Nothing downstream stores OKLCH as the runtime value: `colorTokens` resolves
// every colour to a deterministic sRGB hex, which is what `tokens.css` ships.
// The OKLCH source travels with each token in `colorMeta` and is preserved in
// the DTCG export. See docs/tokens.md and docs/color-architecture.md.
//
// Deterministic: same source → same bytes. No dependencies.
// ─────────────────────────────────────────────────────────────────────────────

import { rgbToOklch, oklchToRgb, toHex, formatOklch, parseColor } from "./color.mjs";

// ── the brand anchors ────────────────────────────────────────────────────────
//
// Provenance: numena-brand docs/visual-identity/color.md §2. `hex` is the
// published value and is the source of truth for the anchor; `oklch` is derived
// from it (rounded for readability) so the palette can be reasoned about
// perceptually and placed against the generated scales.
//
// @type {{ name: string, hex: string, role: string, provenance: string }[]}
export const brandAnchors = [
  { name: "--white", hex: "#FFFFFF", role: "foundation", provenance: "brand color.md §2" },
  { name: "--ink-plum", hex: "#221A2A", role: "foundation", provenance: "brand color.md §2" },
  { name: "--deep-purple", hex: "#4C207F", role: "primary", provenance: "brand color.md §2" },
  { name: "--vibrant-purple", hex: "#8E36F4", role: "primary", provenance: "brand color.md §2" },
  { name: "--pale-lavender", hex: "#EEE9F3", role: "supporting", provenance: "brand color.md §2" },
  { name: "--vibrant-cyan", hex: "#25E4F8", role: "supporting", provenance: "brand color.md §2" },
  { name: "--vibrant-tangerine", hex: "#F57A44", role: "supporting", provenance: "brand color.md §2" },
  { name: "--soft-purple", hex: "#E8D7FD", role: "supporting", provenance: "brand color.md §2" },
  { name: "--soft-cyan", hex: "#D3FAFE", role: "supporting", provenance: "brand color.md §2" },
  { name: "--soft-tangerine", hex: "#FDE4DA", role: "supporting", provenance: "brand color.md §2" },
];

/** OKLCH of a published hex — the observation used to place the scales. */
export function oklchOf(hex) {
  const c = parseColor(hex);
  return rgbToOklch({ r: c.r, g: c.g, b: c.b });
}

// ── scale configuration ──────────────────────────────────────────────────────
//
// A scale is a list of steps (light → dark) plus, per family, an OKLCH hue and a
// chroma profile. The lightness steps are shared across families so any two
// ramps can be compared step for step (neutral-200 ≈ purple-200 in tone).
//
// Lightness curve: a deliberately non-linear ramp — the light end is compressed
// (tints cluster) and the mid-to-dark end is spread, which is what interface
// surfaces and text need. Values are OKLCH L (0–1), one per step.

/** Lightness (OKLCH L) per ramp step, shared by every family. */
export const lightnessSteps = {
  0: 1.0,
  50: 0.982,
  100: 0.957,
  200: 0.905,
  300: 0.845,
  400: 0.77,
  500: 0.685,
  600: 0.6,
  700: 0.515,
  800: 0.43,
  900: 0.33,
  950: 0.24,
};

export const chromaticSteps = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
export const neutralSteps = ["0", ...chromaticSteps];

/**
 * A chroma envelope: 0 at the L extremes, peaking near mid-lightness. This is
 * why a scale is not a straight interpolation — a raw L-only ramp would keep the
 * light tints over-saturated and the dark steps muddy.
 *
 * @param {number} l  OKLCH lightness 0..1
 * @returns {number}  multiplier 0..1
 */
function chromaEnvelope(l) {
  const t = Math.abs(2 * l - 1); // 1 at the ends, 0 at mid-lightness
  return (1 - t) ** 0.7;
}

/**
 * The chromatic families. `hue` is the family hue in degrees; `hueShift` bends
 * it slightly with lightness (a deliberate perceptual correction — very light
 * and very dark steps of one hue read better with a small shift, and warm hues
 * need a touch more). `maxChroma` is the envelope peak.
 *
 * Hues follow the brand anchors: purple ~299° (deep-purple 300, vibrant-purple
 * 293), cyan ~205° (vibrant-cyan), tangerine ~52° (vibrant-tangerine).
 */
export const families = {
  purple: { hue: 299, maxChroma: 0.226, hueShift: -6 },
  cyan: { hue: 205, maxChroma: 0.132, hueShift: 4 },
  tangerine: { hue: 52, maxChroma: 0.176, hueShift: 10 },
};

/** The neutral family: a faint brand-plum tint, chroma rising toward the dark end. */
export const neutral = { hue: 305, maxChroma: 0.016 };

/**
 * Generate one scale: an OKLCH colour per step, gamut-mapped to sRGB hex.
 * Pure and deterministic.
 *
 * @param {string[]} steps
 * @param {(l: number) => number} chromaAt
 * @param {(l: number) => number} hueAt
 * @returns {Record<string, { oklch: { l: number, c: number, h: number }, hex: string }>}
 */
export function generateScale(steps, chromaAt, hueAt) {
  const out = {};
  for (const step of steps) {
    const l = lightnessSteps[step];
    const lc = Math.min(1, Math.max(0, l));
    const oklch = { l: lc, c: chromaAt(lc), h: hueAt(lc) };
    out[step] = { oklch, hex: toHex(oklchToRgb(oklch)) };
  }
  return out;
}

// ── the scales ───────────────────────────────────────────────────────────────

function familyScale({ hue, maxChroma, hueShift }) {
  return generateScale(
    chromaticSteps,
    (l) => maxChroma * chromaEnvelope(l),
    (l) => hue + hueShift * (0.5 - l),
  );
}

export const scales = {
  neutral: generateScale(
    neutralSteps,
    (l) => neutral.maxChroma * (0.35 + 0.65 * (1 - l)),
    () => neutral.hue,
  ),
  purple: familyScale(families.purple),
  cyan: familyScale(families.cyan),
  tangerine: familyScale(families.tangerine),
};

// ── the token map the build consumes ─────────────────────────────────────────
//
// Order is deliberate and stable: the brand anchors first (their identity is the
// reference point), then the generated scales.
//
// `colorTokens`  name → hex literal (what tokens/primitives.mjs exposes)
// `colorMeta`    name → { oklch, hex, source, family?, step?, provenance? }

/** @type {Record<string, string>} */
export const colorTokens = {};
/** @type {Record<string, { oklch: { l: number, c: number, h: number }, hex: string, source: string, family?: string, step?: string, provenance?: string }>} */
export const colorMeta = {};

for (const anchor of brandAnchors) {
  colorTokens[anchor.name] = anchor.hex;
  colorMeta[anchor.name] = {
    oklch: {
      l: Number(oklchOf(anchor.hex).l.toFixed(4)),
      c: Number(oklchOf(anchor.hex).c.toFixed(4)),
      h: Number(oklchOf(anchor.hex).h.toFixed(1)),
    },
    hex: anchor.hex,
    source: "brand-anchor",
    provenance: anchor.provenance,
  };
}

for (const [family, scale] of Object.entries(scales)) {
  for (const [step, { oklch, hex }] of Object.entries(scale)) {
    const name = `--${family}-${step}`;
    colorTokens[name] = hex;
    colorMeta[name] = {
      oklch: {
        l: Number(oklch.l.toFixed(4)),
        c: Number(oklch.c.toFixed(4)),
        h: Number(oklch.h.toFixed(1)),
      },
      hex,
      source: "generated",
      family,
      step,
    };
  }
}

/** A compact, human-readable dump used by the validator report and the docs. */
export function paletteReport() {
  for (const anchor of brandAnchors) {
    console.log(
      `  anchor ${anchor.name.padEnd(20)} ${anchor.hex}  →  ${formatOklch(colorMeta[anchor.name].oklch)}`,
    );
  }
  for (const [family, scale] of Object.entries(scales)) {
    const row = Object.entries(scale)
      .map(([step, { hex }]) => `${step}:${hex}`)
      .join(" ");
    console.log(`  ${family.padEnd(9)} ${row}`);
  }
}
