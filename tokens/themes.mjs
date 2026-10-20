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

/** Surfaces and text (dark). */
export const textDark = {
  "--color-surface": ref("--neutral-950"),
  "--color-surface-subtle": ref("--neutral-900"),
  "--color-surface-hover": ref("--neutral-800"),
  "--color-surface-active": ref("--neutral-700"),
  "--color-text": ref("--neutral-50"),
  "--color-text-muted": ref("--neutral-400"),
  "--color-text-inverted": ref("--neutral-950"),
  "--color-scrim": mix(ref("--neutral-950"), 60, "transparent"),
};

/** Borders (dark). */
export const bordersDark = {
  "--color-border": ref("--neutral-800"),
  "--color-border-strong": ref("--neutral-600"),
  "--color-border-hover": ref("--neutral-500"),
  "--color-border-error": ref("--neutral-400"),
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

/** Elevation (dark): a near-black shadow; the light ink-plum shadow is invisible
 * against a dark ground, so the theme overrides it rather than inheriting it. */
export const shadowDark = {
  "--shadow-sm": "0 2px 4px rgb(0 0 0 / 0.4)",
  "--shadow-md": "0 8px 24px rgb(0 0 0 / 0.55)",
};

/** @type {import("./primitives.mjs").Group[]} */
export const darkGroups = [
  { label: "surface & text", tokens: textDark },
  { label: "border", tokens: bordersDark },
  { label: "action", tokens: actionDark },
  { label: "focus", tokens: focusDark },
  { label: "selected", tokens: selectedDark },
  { label: "categorical accents", tokens: accentsDark },
  { label: "elevation", tokens: shadowDark },
];

export const semanticDark = Object.assign({}, ...darkGroups.map((g) => g.tokens));

/** Theme overrides, keyed by theme id → `name → value`. The light theme is the
 * base `:root` (already rendered from the layers), so it needs no overrides. */
export const themeOverrides = { dark: semanticDark };
