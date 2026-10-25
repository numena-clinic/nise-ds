// ─────────────────────────────────────────────────────────────────────────────
// token source: the COLOR ARCHITECTURE, authored in OKLCH.
//
// This is the canonical model for every color value in Nise. It has two parts:
//
//   1. The ten brand anchors from numena-brand color.md §2. Their published hex
//      is preserved verbatim and their provenance is kept alongside the OKLCH we
//      derive FROM that hex — the brand stays the authority on identity, and we
//      never round its values through our own maths. The analysis and the reason
//      no anchor value is changed here are in docs/tokens.md and the verbatim
//      assertions in tests/color.test.ts.
//
//   2. Scales, two kinds. Four families are GENERATED from a lightness curve
//      plus a family-specific chroma curve (one neutral ramp, and purple/cyan/
//      tangerine as the identity and supporting accents). Four more are
//      AUTHORED: mint, citron, pink and blue are the operational families
//      (success / warning / error / info), and their published candidate values
//      are pinned as anchors with the steps between them interpolated in OKLCH —
//      never a naive interpolation between two hexes, and never a re-generation
//      that would move an anchor off its published value. Both kinds are
//      gamut-mapped to sRGB by tokens/color.mjs.
//
// Nothing downstream stores OKLCH as the runtime value: `colorTokens` resolves
// every color to a deterministic sRGB hex, which is what `tokens.css` ships.
// The OKLCH source travels with each token in `colorMeta` and is preserved in
// the DTCG export. See docs/tokens.md and docs/decisions.md.
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
// the strongest panel — pink-500 is 5.26:1 on --dark-panel and only 2.86:1 on
// neutral-800, which is why this is authored rather than reusing the ramp.
//
// `--color-base-100` in the dark theme IS --dark-ground, so the page and
// base-100 are one value in both themes (see tokens/themes.mjs).
//
// @type {{ name: string, hex: string, role: string, provenance: string }[]}
export const groundAnchors = [
  { name: "--dark-ground", hex: "#17121D", role: "foundation", provenance: "dark ground candidate" },
  { name: "--dark-panel", hex: "#2D2238", role: "foundation", provenance: "dark panel candidate" },
];

export const accentAnchors = [
  { name: "--accent-violet", hex: "#AB62ED", role: "accent", provenance: "design image accent" },
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
 * Hues follow the brand anchors, measured from their published hex:
 * purple 299° (deep-purple 300.0°, vibrant-purple 298.4°), cyan 205°
 * (vibrant-cyan 206.5°), tangerine 45° (vibrant-tangerine 42.9° — with the
 * +10° warm shift this puts the 400–500 steps on the anchor's own hue; a 52°
 * base had them 7–9° toward golden-amber, a hue the brand does not contain).
 */
export const families = {
  purple: { hue: 299, maxChroma: 0.226, hueShift: -6 },
  cyan: { hue: 205, maxChroma: 0.132, hueShift: 4 },
  tangerine: { hue: 45, maxChroma: 0.176, hueShift: 10 },
};

/** The neutral family: based directly on the pale-lavender (#EEE9F3) and ink-plum
 * (#221A2A) axis.
 *
 * Hue is 307° (the shared hue of pale-lavender at 308.3° and ink-plum at 306.9°).
 * Chroma and lightness smoothly bridge the pale-lavender surface ladder at the
 * light end down to ink-plum at the dark end (neutral-950 = #221a2a). */
export const neutral = { hue: 307, maxChroma: 0.0321 };

/**
 * Generate one scale: an OKLCH color per step, gamut-mapped to sRGB hex.
 * Pure and deterministic.
 *
 * @param {string[]} steps
 * @param {(l: number) => number} chromaAt
 * @param {(l: number) => number} hueAt
 * @returns {Record<string, { oklch: { l: number, c: number, h: number }, hex: string }>}
 */
export function generateScale(steps, chromaAt, hueAt, customLightness = {}) {
  const out = {};
  for (const step of steps) {
    const l = customLightness[step] ?? lightnessSteps[step];
    const lc = Math.min(1, Math.max(0, l));
    const oklch = { l: lc, c: chromaAt(lc), h: hueAt(lc) };
    out[step] = { oklch, hex: toHex(oklchToRgb(oklch)) };
  }
  return out;
}

// ── authored ramps ───────────────────────────────────────────────────────────
//
// The operational families (mint = success, citron = warning, pink = error,
// blue = info) are NOT generated from the shared lightness curve. Their
// published candidates are deliberately uneven — a bright neon accent at one
// end and a near-black surface at the other, with a different lightness per
// hue — so the curve would move them. Instead each family PINS its candidates
// as anchors and interpolates the steps between them in OKLCH (hue is
// interpolated on the short arc, so a ramp never swings the long way round).
//
// A pinned step keeps its published hex verbatim: `authoredScale` returns the
// literal, not a round-trip through OKLCH, so an anchor can never drift by a
// rounding unit. See docs/tokens.md.

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
  /** success — cool mint green from design image (#20B098 / #C9FFF5). */
  mint: {
    50: "#C9FFF5",
    200: "#BEFFF4",
    500: "#20B098",
    700: "#147061",
    900: "#10483E",
    950: "#0A2823",
  },
  /** warning — orange from design image (#DF6E39 / #FDE4DA). */
  citron: {
    50: "#FFF5F0",
    200: "#FDE4DA",
    500: "#DF6E39",
    700: "#9C4217",
    800: "#873612",
    900: "#542008",
    950: "#331204",
  },
  /** error — magenta/pink from design image (#D10057 / #FFC2DB). */
  pink: {
    50: "#FFF0F6",
    200: "#FFC2DB",
    500: "#FF5CA8",
    700: "#D10057",
    900: "#5B2043",
    950: "#351629",
  },
  /** info — blue from design image (#1F6492 / #BADBFF). */
  blue: {
    50: "#F0F8FF",
    200: "#BADBFF",
    500: "#4FA5E8",
    700: "#1F6492",
    900: "#143B69",
    950: "#0C2345",
  },
};

/** Families built by `authoredScale` rather than the generated curve. */
export const authoredFamilies = new Set(Object.keys(functionalFamilies));


// ── the scales ───────────────────────────────────────────────────────────────
//
// A ramp is generated over the shared lightness curve, but only the steps the
// semantic layer reads are SURFACED as primitives. This is the point of the
// small palette: a consumer does not browse a 12-step scale, it reads a role
// that points at one step. `scaleSteps` is the authoritative list, and it is
// exactly what tokens/semantic.mjs and tokens/themes.mjs reference. Add a step
// here only when a role needs it.

function familyScale({ hue, maxChroma, hueShift }, steps) {
  return generateScale(
    steps,
    (l) => maxChroma * chromaEnvelope(l),
    (l) => hue + hueShift * (0.5 - l),
  );
}

/** Steps surfaced per family (the steps the semantic layer reads).
 *
 * A step is surfaced ONLY when a role reads it, and a role may only point at a
 * surfaced step — so this list is the palette's surface area, not a wishlist.
 * Three steps left the list with the semantic re-pointing (D22): neutral-0
 * (the page is the brand `--white`, so the ramp no longer needs its own
 * white), cyan-700 and tangerine-700 (the secondary and accent roles now sit
 * on the brand anchors `--vibrant-purple` and `--vibrant-tangerine`). */
export const scaleSteps = {
  neutral: ["50", "100", "200", "400", "500", "600", "700", "800", "950"],
  purple: ["100", "200", "300", "400", "500", "600", "700", "800", "900", "950"],
  cyan: ["100", "900"],
  tangerine: ["100", "900"],
  mint: ["500", "700", "950"],
  citron: ["500", "800", "950"],
  pink: ["500", "700", "950"],
  blue: ["500", "700", "950"],
};

export const scales = {
  neutral: generateScale(
    scaleSteps.neutral,
    (l) => {
      if (l >= 0.96) return 0.010;
      if (l >= 0.92) return 0.017;
      if (l >= 0.88) return 0.023;
      const t = Math.min(1, Math.max(0, (0.892 - l) / (0.892 - 0.235)));
      return 0.023 + t * (neutral.maxChroma - 0.023);
    },
    () => neutral.hue,
    { 50: 0.962, 100: 0.929, 200: 0.892, 950: 0.235 },
  ),
  purple: familyScale(families.purple, scaleSteps.purple),
  cyan: familyScale(families.cyan, scaleSteps.cyan),
  tangerine: familyScale(families.tangerine, scaleSteps.tangerine),
  mint: authoredScale(functionalFamilies.mint, scaleSteps.mint),
  citron: authoredScale(functionalFamilies.citron, scaleSteps.citron),
  pink: authoredScale(functionalFamilies.pink, scaleSteps.pink),
  blue: authoredScale(functionalFamilies.blue, scaleSteps.blue),
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

for (const anchor of [...brandAnchors, ...groundAnchors, ...accentAnchors]) {
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
