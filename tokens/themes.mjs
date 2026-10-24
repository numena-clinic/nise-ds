// ─────────────────────────────────────────────────────────────────────────────
// token source: THEME mappings.
//
// A theme is not a second token set: it is the SAME semantic role names (the
// light contract in tokens/semantic.mjs) mapped onto another ground. Nothing
// here introduces a new role, and every value references a primitive — so a
// component reads one name (`--color-base-100`) in every theme.
//
// Dark is deliberate, not an inversion of light: the ladder steps down the
// neutral ramp, text steps up, the primary fill brightens (so a near-black text
// reads on it rather than white), and the focus ring lightens to stay visible on
// the dark ground. `npm run tokens:build` renders this into a `[data-theme="dark"]`
// block with a `prefers-color-scheme` fallback; `npm run tokens:validate`
// resolves the same contrast promises under both mappings.
//
// Provenance: numena-brand docs/visual-identity/color.md. See docs/theme.md.
// ─────────────────────────────────────────────────────────────────────────────

import { ref, mix } from "./semantic.mjs";

/** The surface ladder (dark). The page IS the published dark ground, and the
 * ladder above it is tight at first and then steps the neutral ramp: the raised
 * surface is the brand's own ink-plum, so the chrome carries the identity the
 * way the light theme's base-300 carries pale lavender.
 *
 *   base-100   the ground          (--dark-ground)
 *   base-200   the brand ink       (--ink-plum)
 *   base-300   the strong panel    (--dark-panel)
 *
 * The steps are deliberately tight: a container ladder has to stay near its
 * ground or a card reads as a hole, and the tight steps are what let a saturated
 * accent clear 4.5:1 on the strongest panel. The hover/active steps are STATES,
 * not structural layers, so they walk the wider chrome steps to stay
 * unmistakable. */
export const baseDark = {
  "--color-base-100": ref("--dark-ground"),
  "--color-base-200": ref("--ink-plum"),
  "--color-base-300": ref("--dark-panel"),
  "--color-base-content": ref("--neutral-50"),
  "--color-base-hover": ref("--neutral-800"),
  "--color-base-active": ref("--neutral-700"),
};

/** Supporting text, borders and focus (dark). The error boundary is chromatic
 * here too (P4) — the pink family's vivid step, which clears 6.44:1 on the dark
 * ground. `border-strong` is a step LIGHTER than the panel, so a control
 * boundary stays visible on the dark ladder. */
export const supportingDark = {
  "--color-text-muted": ref("--neutral-400"),
  "--color-border": ref("--neutral-800"),
  "--color-border-strong": ref("--neutral-400"),
  "--color-border-hover": ref("--neutral-500"),
  "--color-border-error": ref("--pink-500"),
  "--color-focus-ring": ref("--purple-300"),
  "--color-scrim": mix(ref("--neutral-950"), 60, "transparent"),
  "--color-selected-surface": ref("--neutral-800"),
  "--color-selected-text": ref("--purple-200"),
  "--color-link": ref("--purple-300"),
  "--color-link-hover": ref("--purple-200"),
};

/** The emphasis fills (dark): a brighter primary with a near-black content, and
 *  the secondary two steps lighter again on the same purple ramp — the dark
 *  theme's version of the light theme's pair (deep purple → vibrant purple).
 *  The ramp step, not the brand's `--vibrant-purple`, because a vivid purple
 *  on the dark ground is 3.49:1 — legible as a fill with a white content, but
 *  not as the SECONDARY TEXT the light theme's secondary is allowed to be. The
 *  accent is the brand's own vivid tangerine, with the brand ink as its
 *  content, at 6.20:1. */
export const emphasisDark = {
  "--color-primary": ref("--purple-500"),
  "--color-primary-hover": ref("--purple-400"),
  "--color-primary-active": ref("--purple-300"),
  "--color-primary-edge": mix(ref("--purple-500"), 85, ref("--ink-plum")),
  "--color-primary-content": ref("--neutral-950"),
  "--color-secondary": ref("--purple-300"),
  "--color-secondary-content": ref("--neutral-950"),
  "--color-accent": ref("--vibrant-tangerine"),
  "--color-accent-content": ref("--ink-plum"),
  "--color-neutral": ref("--neutral-800"),
  "--color-neutral-content": ref("--neutral-50"),
};

/** Operational roles (dark) — provisional (P4). Same two role names as the
 * light mapping, and this is where the families' published BRIGHT accents get
 * their dark ground: mint-500 on the page is 13.01:1, citron-500 13.31:1,
 * blue-500 9.95:1. The content on a fill is the family's near-black step, so a
 * badge reads as the family colour rather than as a pale wash. Dark is not an
 * inversion of light: the accent steps are chosen per theme against that theme's
 * ground. */
export const statusDark = {
  "--color-success": ref("--mint-500"),
  "--color-success-content": ref("--mint-950"),
  "--color-warning": ref("--citron-500"),
  "--color-warning-content": ref("--citron-950"),
  "--color-error": ref("--pink-500"),
  "--color-error-content": ref("--pink-950"),
  "--color-info": ref("--blue-500"),
  "--color-info-content": ref("--blue-950"),
};

/** Categorical tints (dark). */
export const tintsDark = {
  "--color-tint-purple": ref("--purple-900"),
  "--color-tint-cyan": ref("--cyan-900"),
  "--color-tint-tangerine": ref("--tangerine-900"),
};

/** Elevation (dark): a near-black shadow; the light ink-plum shadow is invisible
 * against a dark ground, so the theme overrides it rather than inheriting it. */
export const shadowDark = {
  "--shadow-sm": "0 2px 4px rgb(0 0 0 / 0.4)",
  "--shadow-md": "0 8px 24px rgb(0 0 0 / 0.55)",
};

/** @type {import("./primitives.mjs").Group[]} */
export const darkGroups = [
  { label: "base", tokens: baseDark },
  { label: "emphasis", tokens: emphasisDark },
  { label: "status", tokens: statusDark },
  { label: "supporting", tokens: supportingDark },
  { label: "tints", tokens: tintsDark },
  { label: "elevation", tokens: shadowDark },
];

export const semanticDark = Object.assign({}, ...darkGroups.map((g) => g.tokens));

/** Theme overrides, keyed by theme id → `name → value`. The light theme is the
 * base `:root` (already rendered from the layers), so it needs no overrides. */
export const themeOverrides = { dark: semanticDark };
