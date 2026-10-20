// ─────────────────────────────────────────────────────────────────────────────
// token source: THEME mappings.
//
// A theme is not a second token set: it is the SAME semantic role names (the
// light contract in tokens/semantic.mjs) mapped onto another ground. Nothing
// here introduces a new role, and every value references a primitive — so a
// component reads one name (`--color-surface`) in every theme.
//
// Dark is deliberate, not an inversion of light: surfaces step down the neutral
// ramp, text steps up, the action brightens (so a near-black text reads on it
// rather than white), and the focus ring lightens to stay visible on the dark
// ground. `npm run tokens:build` renders this into a `[data-theme="dark"]` block
// with a `prefers-color-scheme` fallback; `npm run tokens:validate` resolves the
// same contrast promises under both mappings.
//
// Provenance: numena-brand docs/visual-identity/color.md. See docs/theme.md.
// ─────────────────────────────────────────────────────────────────────────────

import { ref, mix } from "./semantic.mjs";

/** Surfaces and text (dark).
 *
 * The page IS the dark ground (--dark-ground, L .194), and the ladder above it
 * is tight at first and then steps the neutral ramp: the tinted surface is the
 * brand's own ink-plum, so the chrome carries the identity the way the light
 * theme's base-300 carries pale lavender. That makes the two ladders the same
 * ladder in both themes —
 *
 *   surface        base-100   the ground
 *   surface-subtle base-200   the brand ink / neutral-50
 *   base-300                 the strong panel (dark-panel / pale-lavender)
 *   surface-hover             the first wide chrome step
 *
 * — and it keeps every step perceptible: .194 → .235, then the wide chrome
 * steps (.43 → .51) that make a hover or a press unmistakable. Those two are
 * STATES, not structural layers, so they keep the values they had. */
export const textDark = {
  "--color-surface": ref("--dark-ground"),
  "--color-surface-subtle": ref("--ink-plum"),
  "--color-surface-hover": ref("--neutral-800"),
  "--color-surface-active": ref("--neutral-700"),
  "--color-text": ref("--neutral-50"),
  "--color-text-muted": ref("--neutral-400"),
  "--color-text-inverted": ref("--neutral-950"),
  "--color-scrim": mix(ref("--neutral-950"), 60, "transparent"),
};

/** Borders (dark). The error boundary is chromatic here too (P4) — the pink
 * family's vivid step, which clears 6.44:1 on the dark ground. */
export const bordersDark = {
  "--color-border": ref("--neutral-800"),
  "--color-border-strong": ref("--neutral-600"),
  "--color-border-hover": ref("--neutral-500"),
  "--color-border-error": ref("--pink-500"),
};

/** The base ladder (dark): the three published ground values, with the brand
 * ink-plum as the raised step. Same shape as light — ground, brand, strong
 * panel — and the same reason for the tight steps: at L .275 the strong panel
 * still lets a saturated accent clear 4.5:1, which neutral-800 does not. */
export const baseDark = {
  "--color-base-100": ref("--dark-ground"),
  "--color-base-200": ref("--ink-plum"),
  "--color-base-300": ref("--dark-panel"),
  "--color-base-content": ref("--neutral-50"),
};

/** Secondary and neutral fills (dark). The secondary is the brand's own cyan
 * anchor — the dark theme is where that identity is strongest — with the brand
 * ink as its content, at 10.83:1. */
export const fillsDark = {
  "--color-secondary": ref("--vibrant-cyan"),
  "--color-secondary-content": ref("--ink-plum"),
  "--color-neutral": ref("--neutral-800"),
  "--color-neutral-content": ref("--neutral-50"),
};

/** The primary interactive role (dark): a brighter purple with a near-black text. */
export const actionDark = {
  "--color-action": ref("--purple-500"),
  "--color-action-hover": ref("--purple-400"),
  "--color-action-active": ref("--purple-300"),
  "--color-action-text": ref("--neutral-950"),
  "--color-link": ref("--purple-300"),
  "--color-link-hover": ref("--purple-200"),
};

/** Focus (dark): lightens to stay ≥3:1 on the dark ground. */
export const focusDark = {
  "--color-focus-ring": ref("--purple-300"),
};

/** Selected / active (dark). */
export const selectedDark = {
  "--color-selected-surface": ref("--neutral-800"),
  "--color-selected-text": ref("--purple-200"),
};

/** Categorical accents (dark): accent surfaces brighten to carry a dark text. */
export const accentsDark = {
  "--color-accent-purple-surface": ref("--purple-300"),
  "--color-accent-purple-text": ref("--neutral-950"),
  "--color-accent-cyan-surface": ref("--cyan-300"),
  "--color-accent-cyan-text": ref("--neutral-950"),
  "--color-accent-tangerine-surface": ref("--tangerine-300"),
  "--color-accent-tangerine-text": ref("--neutral-950"),
  "--color-tint-purple": ref("--purple-900"),
  "--color-tint-cyan": ref("--cyan-900"),
  "--color-tint-tangerine": ref("--tangerine-900"),
  "--color-tint-text": ref("--neutral-50"),
};

/** Operational roles (dark), restricted to operational states — P4.
 *
 * Same three role names as the light mapping, and this is where the families'
 * published BRIGHT accents finally get their dark ground: mint-500 on the page
 * is 13.01:1, citron-500 13.31:1, teal-500 12.48:1. The panel is the family's
 * near-black step and the content on a fill is that same step, so a badge reads
 * as the family colour rather than as a pale wash. Dark is not an inversion of
 * light: the accent steps are chosen per theme against that theme's ground. */
export const functionalDark = {
  "--color-success-surface": ref("--mint-950"),
  "--color-success": ref("--mint-500"),
  "--color-success-content": ref("--mint-950"),
  "--color-warning-surface": ref("--citron-950"),
  "--color-warning": ref("--citron-500"),
  "--color-warning-content": ref("--citron-950"),
  "--color-error-surface": ref("--pink-950"),
  "--color-error": ref("--pink-500"),
  "--color-error-content": ref("--pink-950"),
  "--color-info-surface": ref("--teal-950"),
  "--color-info": ref("--teal-500"),
  "--color-info-content": ref("--teal-950"),
};

/** Elevation (dark): a near-black shadow; the light ink-plum shadow is invisible
 * against a dark ground, so the theme overrides it rather than inheriting it. */
export const shadowDark = {
  "--shadow-sm": "0 2px 4px rgb(0 0 0 / 0.4)",
  "--shadow-md": "0 8px 24px rgb(0 0 0 / 0.55)",
};

/** @type {import("./primitives.mjs").Group[]} */
export const darkGroups = [
  { label: "surface & text", tokens: textDark },
  { label: "base", tokens: baseDark },
  { label: "border", tokens: bordersDark },
  { label: "action", tokens: actionDark },
  { label: "fill", tokens: fillsDark },
  { label: "focus", tokens: focusDark },
  { label: "selected", tokens: selectedDark },
  { label: "categorical accents", tokens: accentsDark },
  { label: "operational roles", note: "Provisional (P4).", tokens: functionalDark },
  { label: "elevation", tokens: shadowDark },
];

export const semanticDark = Object.assign({}, ...darkGroups.map((g) => g.tokens));

/** Theme overrides, keyed by theme id → `name → value`. The light theme is the
 * base `:root` (already rendered from the layers), so it needs no overrides. */
export const themeOverrides = { dark: semanticDark };
