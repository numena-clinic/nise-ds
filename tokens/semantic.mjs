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
// establishes no colours for system statuses, so there are no success/warning/
// danger roles. Errors are text + an icon + a heavier boundary; accents are
// categorical, never a verdict. See docs/decisions.md D5.
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
 * carries a control boundary and clears the 3:1 non-text minimum. */
export const borders = {
  "--color-border": ref("--neutral-200"),
  "--color-border-strong": ref("--neutral-600"),
  "--color-border-hover": ref("--neutral-700"),
  "--color-border-error": ref("--neutral-950"),
};

/** The primary interactive role (light). Purple is the brand's defining colour;
 * the action is a deep purple, white reads on it, and hover/active deepen. */
export const action = {
  "--color-action": ref("--purple-800"),
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

/** @type {import("./primitives.mjs").Group[]} */
export const semanticGroups = [
  { label: "surface & text", note: "Roles, not values. Components consume this layer.", tokens: text },
  { label: "border", tokens: borders },
  { label: "action", note: "The primary interactive role.", tokens: action },
  { label: "focus", tokens: focus },
  { label: "selected", tokens: selected },
  { label: "categorical accents", note: "Emphasis only, never a verdict.", tokens: accents },
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
  { fg: "--color-border-hover", bg: "--color-surface", min: 3, why: "control boundary on hover (non-text)" },
  { fg: "--color-border-error", bg: "--color-surface", min: 3, why: "error boundary (non-text)" },
  { fg: "--color-focus-ring", bg: "--color-surface", min: 3, why: "focus ring on the surface (non-text)" },
  { fg: "--color-focus-ring", bg: "--color-surface-subtle", min: 3, why: "focus ring on a tinted surface (non-text)" },
];
