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
//   2. Scales, two kinds. Four families are GENERATED from a lightness curve
//      plus a family-specific chroma curve (one neutral ramp, and purple/cyan/
//      tangerine as the identity and supporting accents). Four more are
//      AUTHORED: mint, citron, pink and teal are the operational families
//      (success / warning / error / info), and their published candidate values
//      are pinned as anchors with the steps between them interpolated in OKLCH —
//      never a naive interpolation between two hexes, and never a re-generation
//      that would move an anchor off its published value. Both kinds are
//      gamut-mapped to sRGB by tokens/color.mjs.
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

// ── the dark ground ──────────────────────────────────────────────────────────
//
// Two more published values, for the same reason as the brand anchors: they are
// proposed as given and are not on any curve. They bound the dark base ladder
// with the brand's ink-plum between them —
//
//   --dark-ground  #17121D   L .194   the deep ground (dark base-100 / page)
//   --ink-plum     #221A2A   L .235   the brand, as the raised panel (base-200)
//   --dark-panel   #2D2238   L .275   the strong panel (dark base-300)
//
// The steps are deliberately TIGHT (0.04 L apart) rather than the neutral
// ramp's 0.09: a container ladder has to stay near its ground or a card reads
// as a hole, and the tight steps are what let a saturated accent clear 4.5:1 on
// the strongest panel — pink-500 is 5.45:1 on --dark-panel and only 2.86:1 on
// neutral-800, which is why this is authored rather than reusing the ramp.
//
// `--color-surface` in the dark theme IS --dark-ground, so the page and
// base-100 are one value in both themes (see tokens/themes.mjs).
//
// @type {{ name: string, hex: string, role: string, provenance: string }[]}
export const groundAnchors = [
  { name: "--dark-ground", hex: "#17121D", role: "foundation", provenance: "dark ground candidate" },
  { name: "--dark-panel", hex: "#2D2238", role: "foundation", provenance: "dark panel candidate" },
];

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

// ── authored ramps ───────────────────────────────────────────────────────────
//
// The operational families (mint = success, citron = warning, pink = error,
// teal = info) are NOT generated from the shared lightness curve. Their
// published candidates are deliberately uneven — a bright neon accent at one
// end and a near-black surface at the other, with a different lightness per
// hue — so the curve would move them. Instead each family PINS its candidates
// as anchors and interpolates the steps between them in OKLCH (hue is
// interpolated on the short arc, so a ramp never swings the long way round).
//
// A pinned step keeps its published hex verbatim: `authoredScale` returns the
// literal, not a round-trip through OKLCH, so an anchor can never drift by a
// rounding unit. See docs/color-architecture.md.

const lerp = (a, b, t) => a + (b - a) * t;
/** Hue on the short arc: always the <=180° path. */
const lerpHue = (a, b, t) => {
  const delta = ((b - a + 540) % 360) - 180;
  return (((a + delta * t) % 360) + 360) % 360;
};

/**
 * Author a ramp from pinned OKLCH anchors.
 *
 * @param {Record<string, string>} pins  step → published hex
 * @param {string[]} steps               the steps to fill, light → dark
 * @returns {Record<string, { oklch: { l: number, c: number, h: number }, hex: string }>}
 */
export function authoredScale(pins, steps) {
  const pinSteps = Object.keys(pins).map(Number).sort((a, b) => a - b);
  const pinOklch = new Map(pinSteps.map((step) => [step, oklchOf(pins[String(step)])]));
  const out = {};
  for (const step of steps) {
    const n = Number(step);
    const pinned = pinOklch.get(n);
    if (pinned) {
      // Verbatim: the published value is the value, to the unit.
      out[step] = { oklch: pinned, hex: pins[step] };
      continue;
    }
    let lo = pinSteps[0];
    let hi = pinSteps[pinSteps.length - 1];
    for (let i = 0; i < pinSteps.length - 1; i += 1) {
      if (n > pinSteps[i] && n < pinSteps[i + 1]) {
        lo = pinSteps[i];
        hi = pinSteps[i + 1];
        break;
      }
    }
    const t = (n - lo) / (hi - lo);
    const a = pinOklch.get(lo);
    const b = pinOklch.get(hi);
    const oklch = {
      l: lerp(a.l, b.l, t),
      c: lerp(a.c, b.c, t),
      h: lerpHue(a.h, b.h, t),
    };
    out[step] = { oklch, hex: toHex(oklchToRgb(oklch)) };
  }
  return out;
}

/**
 * The operational families, pinned. Each entry is the published candidate set:
 * a pale surface for a tinted panel, a vivid accent, a deep step that carries
 * text in the light theme, and the near-black surfaces the dark theme needs.
 * The steps below are not on the shared curve, which is why they are authored.
 *
 * Semantics live in tokens/semantic.mjs (light) and tokens/themes.mjs (dark);
 * this file only owns the values.
 *
 * @type {Record<string, Record<string, string>>}  family → step → published hex
 */
export const functionalFamilies = {
  /** success — a cool green that reads as confirmation without a verdict hue. */
  mint: {
    50: "#E8FFF2",
    200: "#9CFFD0",
    500: "#42F5A5",
    600: "#1E8F63",
    900: "#174B3A",
    950: "#142D27",
  },
  /** warning — amber, not ochre: brighter and sharper than a muted gold. */
  citron: {
    50: "#FFF8DE",
    200: "#FFF0A6",
    500: "#FFD84D",
    600: "#A27D14",
    900: "#514017",
    950: "#302817",
  },
  /** error — a saturated pink, not a fire-engine red. */
  pink: {
    50: "#FFF0F6",
    200: "#FFB4D8",
    500: "#FF5CA8",
    700: "#A52D70",
    900: "#5B2043",
    950: "#351629",
  },
  /** info — cyan pushed a few degrees bluer so it never collides with the
   * brand's vibrant-cyan. Related to it by design; never a replacement. */
  teal: {
    50: "#E5FBFF",
    200: "#B1F7FF",
    500: "#45E8FF",
    700: "#087F99",
    900: "#164653",
    950: "#142831",
  },
};

/** Families built by `authoredScale` rather than the generated curve. */
export const authoredFamilies = new Set(Object.keys(functionalFamilies));


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
  mint: authoredScale(functionalFamilies.mint, chromaticSteps),
  citron: authoredScale(functionalFamilies.citron, chromaticSteps),
  pink: authoredScale(functionalFamilies.pink, chromaticSteps),
  teal: authoredScale(functionalFamilies.teal, chromaticSteps),
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

for (const anchor of [...brandAnchors, ...groundAnchors]) {
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
  const authored = authoredFamilies.has(family);
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
      // "authored-ramp" marks a family pinned to published candidate anchors;
      // "generated" is a step on the shared lightness curve.
      source: authored ? "authored-ramp" : "generated",
      family,
      step,
    };
  }
}

/** A compact, human-readable dump used by the validator report and the docs. */
export function paletteReport() {
  for (const anchor of [...brandAnchors, ...groundAnchors]) {
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
