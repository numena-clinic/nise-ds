// ─────────────────────────────────────────────────────────────────────────────
// token source: the SEMANTIC layer, as data — LIGHT and DARK.
//
// SEMANTIC = a role: what a colour means (surface, text, border, action, focus).
// A semantic token references a primitive and never restates a value. There is
// ONE contract (one set of role names); light and dark are two deliberate
// mappings of it onto the OKLCH scales, not inversions of each other.
//
// `npm run tokens:build` renders the light mapping into the base `:root` and the
// dark mapping into a `[data-theme="dark"]` block (with a `prefers-color-scheme`
// fallback) — see tokens/emit.mjs. `npm run tokens:validate` re-checks every
// contrast promise in BOTH mappings.
//
// Provenance: numena-brand docs/visual-identity/color.md §4 — the palette
// establishes no colours for system statuses. Errors are text + an icon + a
// heavier boundary; accents are categorical, never a verdict. See docs/decisions.md
// D5.
//
// The operational roles below (success / warning / error / info) are a
// USER-DIRECTED, PROVISIONAL override of that rule, recorded in
// docs/decisions.md P4. Two constraints keep them subordinate to it: they are
// restricted to operational states (saved, failed, caution, unsaved) and never
// carry clinical or epistemic meaning, and they are a separate family from the
// brand accents — tangerine is not warning, cyan is not info. If P4 is vetoed,
// these roles are the only thing that needs to be removed.
// ─────────────────────────────────────────────────────────────────────────────

import { primitives } from "./primitives.mjs";

/** Reference a primitive; throws at author time on a misspelled name. Shared
 * with the dark mapping in tokens/themes.mjs. */
export function ref(name) {
  if (!(name in primitives)) {
    throw new Error(`semantic token references unknown token: ${name}`);
  }
  return `var(${name})`;
}

/** `color-mix(in srgb, a p%, b)` — a derivation with a visible dependency.
 * Shared with the dark mapping in tokens/themes.mjs. */
export function mix(a, percent, b) {
  return `color-mix(in srgb, ${a} ${percent}%, ${b})`;
}

// ── LIGHT mapping ────────────────────────────────────────────────────────────

const white = ref("--white");
const inkPlum = ref("--ink-plum");

/** Surfaces and text (light). */
export const text = {
  "--color-surface": ref("--neutral-0"),
  "--color-surface-subtle": ref("--neutral-50"),
  "--color-surface-hover": ref("--neutral-100"),
  "--color-surface-active": ref("--neutral-200"),
  "--color-text": ref("--neutral-950"),
  "--color-text-muted": ref("--neutral-700"),
  "--color-text-inverted": ref("--neutral-0"),
  "--color-scrim": mix(ref("--neutral-950"), 40, "transparent"),
};

/** Borders (light). `--color-border` is decorative; `--color-border-strong`
 * carries a control boundary and clears the 3:1 non-text minimum. The error
 * boundary is chromatic (P4) — the pink family, not a neutral — so an invalid
 * field is distinguishable without relying on the heavier stroke alone. */
export const borders = {
  "--color-border": ref("--neutral-200"),
  "--color-border-strong": ref("--neutral-600"),
  "--color-border-hover": ref("--neutral-700"),
  "--color-border-error": ref("--pink-700"),
};

/** The primary interactive role (light). Deep purple is the brand's defining
 * colour, so the action IS the brand anchor rather than a step near it; white
 * reads on it and hover/active step down the purple ramp. */
export const action = {
  "--color-action": ref("--deep-purple"),
  "--color-action-hover": ref("--purple-900"),
  "--color-action-active": ref("--purple-950"),
  "--color-action-text": white,
  "--color-link": ref("--purple-700"),
  "--color-link-hover": ref("--purple-900"),
};

/** One focus role for every focusable component (light): purple, ≥3:1 on both
 * the base and the tinted surface. */
export const focus = {
  "--color-focus-ring": ref("--purple-600"),
  "--focus-ring-width": ref("--border-width-strong"),
  "--focus-ring-offset": ref("--space-1"),
};

/** Selected / active (light): a neutral tile with a deep purple foreground, so
 * selection is not carried by colour alone. */
export const selected = {
  "--color-selected-surface": ref("--neutral-100"),
  "--color-selected-text": ref("--purple-800"),
};

/** Categorical accents (light) — emphasis for a category, NEVER a verdict. Each
 * surface/text pair is contrast-checked. */
export const accents = {
  "--color-accent-purple-surface": ref("--purple-700"),
  "--color-accent-purple-text": white,
  "--color-accent-cyan-surface": ref("--cyan-400"),
  "--color-accent-cyan-text": inkPlum,
  "--color-accent-tangerine-surface": ref("--tangerine-400"),
  "--color-accent-tangerine-text": inkPlum,
  "--color-tint-purple": ref("--purple-100"),
  "--color-tint-cyan": ref("--cyan-100"),
  "--color-tint-tangerine": ref("--tangerine-100"),
  "--color-tint-text": inkPlum,
};

/** The base ladder (light): what a container is made of, DaisyUI-shaped.
 *
 * Distinct from the `surface` ladder on purpose. `--color-surface` is the page
 * and the chrome (neutral, and it is what components already consume);
 * `--color-base-*` is the branded panel ladder a card or panel is built from,
 * and its top step is the brand's pale lavender — so containers carry the
 * identity the page deliberately does not. `base-content` is the foreground
 * that reads on all three.
 *
 * role ↔ value: base-100 = page, base-200 = a raised surface, base-300 = a
 * stronger panel. Never use these for text colours or accents. */
export const base = {
  "--color-base-100": ref("--neutral-0"),
  "--color-base-200": ref("--neutral-50"),
  "--color-base-300": ref("--pale-lavender"),
  "--color-base-content": ref("--neutral-950"),
};

/** Secondary and neutral fills (light). These are BUTTON fills, not decoration:
 * a secondary action is cyan, a neutral action is the brand ink. Each pairs with
 * a content colour that clears 4.5:1 on the fill. */
export const fills = {
  "--color-secondary": ref("--cyan-700"),
  "--color-secondary-content": white,
  "--color-neutral": inkPlum,
  "--color-neutral-content": white,
};

/** Operational roles (light), restricted to operational states — P4.
 *
 * Three roles per family, and they are all a component can need:
 *   -surface  the tinted panel
 *   -<family> the accent: text and icon ON that panel, the boundary of a
 *             control, and the fill of a badge or banner
 *   -content  the foreground ON the accent fill
 *
 * The light theme sources the accent from the DEEP end of each ramp. A vivid
 * neon is not legible as text on a pale panel (the mint accent is 1.4:1 on
 * white), so the brightness lives in the dark theme where it has a dark ground
 * to read against — see tokens/themes.mjs. This is the same reasoning as
 * `--color-text-accent-tangerine`, and it is why no family's brightest step
 * appears in this mapping.
 *
 * The step is not the same for every family, and it is not supposed to be:
 * mint, citron and pink clear 4.5:1 on the branded panel at 700, but citron
 * misses it by 0.11 (4.39:1) so warning drops to 800, and teal needs 800 to
 * clear its own panel at all (teal-700 is 4.34:1 on teal-50). Per-hue, measured
 * — never one step applied to all four. */
export const functional = {
  "--color-success-surface": ref("--mint-50"),
  "--color-success": ref("--mint-700"),
  "--color-success-content": white,
  "--color-warning-surface": ref("--citron-50"),
  "--color-warning": ref("--citron-800"),
  "--color-warning-content": white,
  "--color-error-surface": ref("--pink-50"),
  "--color-error": ref("--pink-700"),
  "--color-error-content": white,
  "--color-info-surface": ref("--teal-50"),
  "--color-info": ref("--teal-800"),
  "--color-info-content": white,
};

/** @type {import("./primitives.mjs").Group[]} */
export const semanticGroups = [
  { label: "surface & text", note: "Roles, not values. Components consume this layer.", tokens: text },
  { label: "base", note: "The branded panel ladder (DaisyUI-shaped).", tokens: base },
  { label: "border", tokens: borders },
  { label: "action", note: "The primary interactive role.", tokens: action },
  { label: "fill", note: "Secondary and neutral button fills.", tokens: fills },
  { label: "focus", tokens: focus },
  { label: "selected", tokens: selected },
  { label: "categorical accents", note: "Emphasis only, never a verdict.", tokens: accents },
  {
    label: "operational roles",
    note: "Provisional (P4): operational states only, never clinical meaning.",
    tokens: functional,
  },
];

export const semantic = Object.assign({}, ...semanticGroups.map((g) => g.tokens));

// The DARK mapping of these same role names lives in tokens/themes.mjs.

/**
 * Colour pairs the system promises to be legible. The SAME pairs are resolved
 * under both mappings by tokens/validate.mjs. `min` is the WCAG 2.2 ratio:
 * 4.5 for normal text, 3 for non-text boundaries.
 * @type {{ fg: string, bg: string, min: number, why: string }[]}
 */
export const contrastChecks = [
  { fg: "--color-text", bg: "--color-surface", min: 4.5, why: "body text on the page" },
  { fg: "--color-text", bg: "--color-surface-subtle", min: 4.5, why: "text on a tinted surface" },
  { fg: "--color-text-muted", bg: "--color-surface", min: 4.5, why: "muted text on the page" },
  { fg: "--color-text", bg: "--color-surface-hover", min: 4.5, why: "text on a hovered surface" },
  { fg: "--color-text", bg: "--color-surface-active", min: 4.5, why: "text on an active/pressed surface" },
  { fg: "--color-action-text", bg: "--color-action", min: 4.5, why: "text on the primary action" },
  { fg: "--color-action-text", bg: "--color-action-hover", min: 4.5, why: "text on a hovered action" },
  { fg: "--color-action-text", bg: "--color-action-active", min: 4.5, why: "text on a pressed action" },
  { fg: "--color-link", bg: "--color-surface", min: 4.5, why: "link text on the page" },
  { fg: "--color-link-hover", bg: "--color-surface", min: 4.5, why: "hovered link on the page" },
  { fg: "--color-selected-text", bg: "--color-selected-surface", min: 4.5, why: "selected tile text" },
  { fg: "--color-accent-purple-text", bg: "--color-accent-purple-surface", min: 4.5, why: "purple accent text" },
  { fg: "--color-accent-cyan-text", bg: "--color-accent-cyan-surface", min: 4.5, why: "cyan accent text" },
  { fg: "--color-accent-tangerine-text", bg: "--color-accent-tangerine-surface", min: 4.5, why: "tangerine accent text" },
  { fg: "--color-tint-text", bg: "--color-tint-purple", min: 4.5, why: "tint text (purple)" },
  { fg: "--color-tint-text", bg: "--color-tint-cyan", min: 4.5, why: "tint text (cyan)" },
  { fg: "--color-tint-text", bg: "--color-tint-tangerine", min: 4.5, why: "tint text (tangerine)" },
  { fg: "--color-border-strong", bg: "--color-surface", min: 3, why: "control boundary (non-text)" },
  { fg: "--color-border-strong", bg: "--color-base-300", min: 3, why: "control boundary on a strong panel (non-text)" },
  { fg: "--color-border-hover", bg: "--color-surface", min: 3, why: "control boundary on hover (non-text)" },
  { fg: "--color-border-error", bg: "--color-surface", min: 3, why: "error boundary (non-text)" },
  { fg: "--color-border-error", bg: "--color-base-300", min: 3, why: "error boundary on a strong panel (non-text)" },
  { fg: "--color-focus-ring", bg: "--color-surface", min: 3, why: "focus ring on the surface (non-text)" },
  { fg: "--color-focus-ring", bg: "--color-surface-subtle", min: 3, why: "focus ring on a tinted surface (non-text)" },

  // ── the base ladder ──────────────────────────────────────────────────────
  { fg: "--color-base-content", bg: "--color-base-100", min: 4.5, why: "panel text on the base" },
  { fg: "--color-base-content", bg: "--color-base-200", min: 4.5, why: "panel text on a raised surface" },
  { fg: "--color-base-content", bg: "--color-base-300", min: 4.5, why: "panel text on a strong panel" },
  { fg: "--color-text", bg: "--color-base-300", min: 4.5, why: "body text on a strong panel" },

  // ── secondary and neutral fills ──────────────────────────────────────────
  { fg: "--color-secondary-content", bg: "--color-secondary", min: 4.5, why: "text on a secondary action" },
  { fg: "--color-secondary", bg: "--color-surface", min: 4.5, why: "secondary text on the page" },
  { fg: "--color-neutral-content", bg: "--color-neutral", min: 4.5, why: "text on a neutral action" },

  // ── operational roles (P4): panel text, content on the fill, and the
  //    accent used as both text on the page and a control boundary ──────────
  ...["success", "warning", "error", "info"].flatMap((role) => [
    { fg: `--color-${role}`, bg: `--color-${role}-surface`, min: 4.5, why: `${role} text on its own panel` },
    { fg: `--color-${role}-content`, bg: `--color-${role}`, min: 4.5, why: `text on a ${role} fill` },
    { fg: `--color-${role}`, bg: "--color-surface", min: 4.5, why: `${role} text on the page` },
    { fg: `--color-${role}`, bg: "--color-base-300", min: 4.5, why: `${role} text on a strong panel` },
  ]),
];
