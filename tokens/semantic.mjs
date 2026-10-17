// ─────────────────────────────────────────────────────────────────────────────
// token source: the SEMANTIC layer, as data.
//
// SEMANTIC = what a value means in an interface (surface, text, action, focus,
// border). A semantic token must reference a primitive — it never restates a
// literal. `ref()` enforces that at author time: an unknown primitive name
// throws here, so a typo cannot reach the generated CSS.
//
// Provenance: roles are grounded in numena-brand color.md (§4 usage rules, §5
// accessibility) and iconography.md (§4 colour and states). The brand does NOT
// define status/verdict colours ("The palette does not establish fixed colours
// for … system statuses"), so none exist here — see docs/tokens.md.
// ─────────────────────────────────────────────────────────────────────────────

import { primitives } from "./primitives.mjs";

/** Reference a primitive, failing loudly if the name does not exist. */
function ref(name) {
  if (!(name in primitives)) {
    throw new Error(`semantic token references unknown primitive: ${name}`);
  }
  return `var(${name})`;
}

/** A derived colour: `color-mix` the primitive with another primitive. */
function mix(a, percent, b) {
  return `color-mix(in srgb, ${a} ${percent}%, ${b})`;
}

const white = ref("--white");
const inkPlum = ref("--ink-plum");
const paleLavender = ref("--pale-lavender");

/** Surfaces and text. */
export const text = {
  "--color-surface": white,
  "--color-surface-subtle": paleLavender,
  "--color-surface-hover": paleLavender,
  "--color-text": inkPlum,
  "--color-text-muted": mix(inkPlum, 68, white),
  "--color-text-inverted": white,
  "--color-scrim": mix(inkPlum, 40, "transparent"),
};

/** Borders. `--color-border` is decorative only; `--color-border-strong`
 * carries a control boundary, so it clears the 3:1 non-text minimum. */
export const borders = {
  "--color-border": mix(inkPlum, 16, white),
  "--color-border-strong": mix(inkPlum, 50, white),
};

/** The primary interactive role. Deep Purple, the brand's defining colour
 * (color.md §3 "keep the identity violet-led"): white on it clears AA, and it
 * is the one affirmative action. */
export const action = {
  "--color-action": ref("--deep-purple"),
  "--color-action-hover": mix(ref("--deep-purple"), 88, inkPlum),
  "--color-action-active": mix(ref("--deep-purple"), 78, inkPlum),
  "--color-action-text": white,
  "--color-link": ref("--deep-purple"),
  "--color-link-hover": ref("--vibrant-purple"),
};

/** One focus role for every focusable component. Vibrant Purple clears the 3:1
 * non-text minimum on both White and Pale Lavender (iconography.md §4). */
export const focus = {
  "--color-focus-ring": ref("--vibrant-purple"),
  "--focus-ring-width": ref("--border-width-strong"),
  "--focus-ring-offset": ref("--space-1"),
};

/** Selected / active: a Pale Lavender tile with a Deep Purple foreground, so
 * selection is not carried by colour alone (iconography.md §4). */
export const selected = {
  "--color-selected-surface": paleLavender,
  "--color-selected-text": ref("--deep-purple"),
};

/** Categorical accents — emphasis for categories (a stage, a source type),
 * NEVER a verdict. Each text/surface pair is a brand-approved combination
 * (color.md §5). "No check marks … on clinical content" (iconography.md §5). */
export const accents = {
  "--color-accent-purple-surface": ref("--vibrant-purple"),
  "--color-accent-purple-text": white,
  "--color-accent-cyan-surface": ref("--vibrant-cyan"),
  "--color-accent-cyan-text": inkPlum,
  "--color-accent-tangerine-surface": ref("--vibrant-tangerine"),
  "--color-accent-tangerine-text": inkPlum,
  "--color-tint-purple": ref("--soft-purple"),
  "--color-tint-cyan": ref("--soft-cyan"),
  "--color-tint-tangerine": ref("--soft-tangerine"),
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

/**
 * Colour pairs the system promises to be legible, checked by tokens/validate.mjs.
 * `min` is the WCAG 2.2 ratio: 4.5 for normal text, 3 for non-text boundaries.
 * @type {{ fg: string, bg: string, min: number, why: string }[]}
 */
export const contrastChecks = [
  { fg: "--color-text", bg: "--color-surface", min: 4.5, why: "body text on the page" },
  { fg: "--color-text", bg: "--color-surface-subtle", min: 4.5, why: "text on a tinted surface" },
  { fg: "--color-text-muted", bg: "--color-surface", min: 4.5, why: "secondary text" },
  { fg: "--color-action-text", bg: "--color-action", min: 4.5, why: "primary button label" },
  { fg: "--color-selected-text", bg: "--color-selected-surface", min: 4.5, why: "selected tile label" },
  { fg: "--color-accent-cyan-text", bg: "--color-accent-cyan-surface", min: 4.5, why: "cyan accent label" },
  { fg: "--color-accent-tangerine-text", bg: "--color-accent-tangerine-surface", min: 4.5, why: "tangerine accent label" },
  { fg: "--color-accent-purple-text", bg: "--color-accent-purple-surface", min: 4.5, why: "purple accent label" },
  { fg: "--color-tint-text", bg: "--color-tint-purple", min: 4.5, why: "tint label (purple)" },
  { fg: "--color-tint-text", bg: "--color-tint-cyan", min: 4.5, why: "tint label (cyan)" },
  { fg: "--color-tint-text", bg: "--color-tint-tangerine", min: 4.5, why: "tint label (tangerine)" },
  { fg: "--color-border-strong", bg: "--color-surface", min: 3, why: "control boundary (non-text)" },
  { fg: "--color-focus-ring", bg: "--color-surface", min: 3, why: "focus ring on white (non-text)" },
  { fg: "--color-focus-ring", bg: "--color-surface-subtle", min: 3, why: "focus ring on a tinted surface (non-text)" },
];
