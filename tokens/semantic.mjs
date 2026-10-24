// ─────────────────────────────────────────────────────────────────────────────
// token source: the SEMANTIC layer, as data — LIGHT and DARK.
//
// SEMANTIC = a role: what a colour means. A semantic token references a
// primitive and never restates a value. There is ONE contract (one set of role
// names); light and dark are two deliberate mappings of it onto the ranges in
// tokens/palette.mjs, not inversions of each other.
//
// The vocabulary is small and daisyUI-shaped. A component asks one question and
// gets one name:
//
//   base-100 / 200 / 300   the surface ladder: page, raised, panel
//   base-content           the text that reads on the ladder
//   base-hover / -active   the interaction states of base-100
//   primary                the primary action (the brand's deep purple)
//   secondary              the secondary action (the brand's vibrant purple)
//   accent                 the accent (the brand's vivid tangerine)
//   neutral                the neutral action (brand ink)
//   success / warning / error / info   operational states
//
// Every fill has a `-content` role: the foreground that reads on it. Primary
// additionally carries `-hover`/`-active`, because the action has three states.
//
// A handful of supporting roles are not a surface or a fill and have no daisyUI
// equivalent: text-muted, border (three strengths), focus-ring, scrim, selected,
// link, and the three categorical tints.
//
// `npm run tokens:build` renders the light mapping into the base `:root` and the
// dark mapping into a `[data-theme="dark"]` block (with a `prefers-color-scheme`
// fallback) — see tokens/emit.mjs. `npm run tokens:validate` re-checks every
// contrast promise in BOTH mappings.
//
// Provenance: numena-brand docs/visual-identity/color.md. The operational status
// roles are a USER-DIRECTED, PROVISIONAL decision recorded in docs/decisions.md
// P4. They are restricted to operational states (saved, failed, caution,
// unsaved) and never carry clinical or epistemic meaning, and tangerine is not
// warning and cyan is not info.
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

/** The surface ladder (light): page → raised → panel, plus the text and the
 *  interaction states of the page. A card is built from these; the page is
 *  base-100. `base-300` is the brand's pale lavender, so a panel carries the
 *  identity the page deliberately does not.
 *
 *  The page is the brand's `--white` and the text is the brand's `--ink-plum`
 *  — the two published foundations, not ramp approximations of them. The
 *  ramp's own white (neutral-0) and its deepest step (neutral-950) are no
 *  longer read here, so the palette has no second source for either value
 *  (D22). */
export const base = {
  "--color-base-100": ref("--white"),
  "--color-base-200": ref("--neutral-50"),
  "--color-base-300": ref("--pale-lavender"),
  "--color-base-content": ref("--ink-plum"),
  "--color-base-hover": ref("--neutral-100"),
  "--color-base-active": ref("--neutral-200"),
};

/** Supporting text, borders and focus — none of these is a surface or a fill, so
 * they sit beside the ladder. `border` is decorative; `border-strong` carries a
 * control boundary and clears 3:1. `border-error` is chromatic (P4) — the pink
 * family, not a neutral — so an invalid control is distinguishable without the
 * heavier stroke alone. */
export const supporting = {
  "--color-text-muted": ref("--neutral-700"),
  "--color-border": ref("--neutral-200"),
  "--color-border-strong": ref("--neutral-600"),
  "--color-border-hover": ref("--neutral-700"),
  "--color-border-error": ref("--pink-700"),
  "--color-focus-ring": ref("--purple-600"),
  "--focus-ring-width": ref("--border-width-strong"),
  "--focus-ring-offset": ref("--space-1"),
  "--color-scrim": mix(ref("--neutral-950"), 40, "transparent"),
  "--color-selected-surface": ref("--neutral-100"),
  "--color-selected-text": ref("--purple-800"),
  "--color-link": ref("--purple-700"),
  "--color-link-hover": ref("--purple-900"),
};

/** The emphasis fills (light) — the primary action IS the brand's deep purple,
 *  so the action is the anchor rather than a step near it. The secondary is the
 *  brand's other purple, the VIBRANT one: the same family, a good deal
 *  lighter, so the two fills read as a pair (ΔE2000 20.1, well clear of the
 *  just-noticeable floor) and are told apart by ROLE — primary is the action,
 *  secondary is the lesser emphasis. The accent is the brand's vivid tangerine,
 *  and it is a FILL role: its content is the brand ink, not white, because
 *  white on tangerine is 2.71:1. Neutral is the brand ink.
 *
 *  Each pairs with a content colour that clears 4.5:1 on the fill; the primary
 *  carries hover/active steps down the purple ramp. */
export const emphasis = {
  "--color-primary": ref("--deep-purple"),
  "--color-primary-hover": ref("--purple-900"),
  "--color-primary-active": ref("--purple-950"),
  "--color-primary-edge": mix(ref("--deep-purple"), 85, ref("--ink-plum")),
  "--color-primary-content": white,
  "--color-secondary": ref("--vibrant-purple"),
  "--color-secondary-content": white,
  "--color-accent": ref("--vibrant-tangerine"),
  "--color-accent-content": inkPlum,
  "--color-neutral": inkPlum,
  "--color-neutral-content": white,
};

/** Operational roles (light) — provisional (P4). Two roles per family, and that
 * is all a component needs: `-<family>` is the accent (text and icon on the
 * page, the boundary of a control, the fill of a badge) and `-content` is the
 * foreground on that fill. A tinted panel is `color-mix(<family>, base-100)`,
 * built at the point of use rather than kept as a fourth role.
 *
 * The light theme sources the accent from the DEEP end of each ramp: a vivid
 * neon is not legible as text on a pale panel, so the brightness lives in the
 * dark theme where it has a dark ground to read against — see tokens/themes.mjs.
 * The step is not the same per family: mint, pink and blue clear 4.5:1 at 700,
 * but citron needs 800 (measured per hue, never one step for all four). */
export const status = {
  "--color-success": ref("--mint-700"),
  "--color-success-content": white,
  "--color-warning": ref("--citron-800"),
  "--color-warning-content": white,
  "--color-error": ref("--pink-700"),
  "--color-error-content": white,
  "--color-info": ref("--blue-700"),
  "--color-info-content": white,
};

/** Categorical tints (light) — cheap emphasis for a category, NEVER a verdict.
 * Each pairs with `--color-base-content` (checked at 4.5:1). */
export const tints = {
  "--color-tint-purple": ref("--purple-100"),
  "--color-tint-cyan": ref("--cyan-100"),
  "--color-tint-tangerine": ref("--tangerine-100"),
};

/** @type {import("./primitives.mjs").Group[]} */
export const semanticGroups = [
  { label: "base", note: "The surface ladder, its text and its interaction states.", tokens: base },
  { label: "emphasis", note: "Primary, secondary, accent and neutral fills.", tokens: emphasis },
  {
    label: "status",
    note: "Operational states only (P4) — never clinical or epistemic meaning.",
    tokens: status,
  },
  { label: "supporting", note: "Text, borders, focus, scrim, selection and links.", tokens: supporting },
  { label: "tints", note: "Categorical emphasis, never a verdict.", tokens: tints },
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
  // ── the base ladder ──────────────────────────────────────────────────────
  { fg: "--color-base-content", bg: "--color-base-100", min: 4.5, why: "body text on the page" },
  { fg: "--color-base-content", bg: "--color-base-200", min: 4.5, why: "text on a raised surface" },
  { fg: "--color-base-content", bg: "--color-base-300", min: 4.5, why: "text on a panel" },
  { fg: "--color-base-content", bg: "--color-base-hover", min: 4.5, why: "text on a hovered surface" },
  { fg: "--color-base-content", bg: "--color-base-active", min: 4.5, why: "text on a pressed surface" },
  { fg: "--color-text-muted", bg: "--color-base-100", min: 4.5, why: "muted text on the page" },
  { fg: "--color-link", bg: "--color-base-100", min: 4.5, why: "link text on the page" },
  { fg: "--color-link-hover", bg: "--color-base-100", min: 4.5, why: "hovered link on the page" },
  { fg: "--color-selected-text", bg: "--color-selected-surface", min: 4.5, why: "selected tile text" },

  // ── the emphasis fills ───────────────────────────────────────────────────
  { fg: "--color-primary-content", bg: "--color-primary", min: 4.5, why: "text on the primary fill" },
  { fg: "--color-primary-content", bg: "--color-primary-hover", min: 4.5, why: "text on a hovered primary fill" },
  { fg: "--color-primary-content", bg: "--color-primary-active", min: 4.5, why: "text on a pressed primary fill" },
  { fg: "--color-secondary-content", bg: "--color-secondary", min: 4.5, why: "text on the secondary fill" },
  { fg: "--color-secondary", bg: "--color-base-100", min: 4.5, why: "secondary text on the page" },
  { fg: "--color-secondary", bg: "--color-base-200", min: 4.5, why: "secondary text on a raised surface" },
  { fg: "--color-accent-content", bg: "--color-accent", min: 4.5, why: "text on the accent fill" },
  { fg: "--color-neutral-content", bg: "--color-neutral", min: 4.5, why: "text on the neutral fill" },

  // ── operational roles (P4): the accent as panel text, and content on a fill ─
  ...["success", "warning", "error", "info"].flatMap((role) => [
    { fg: `--color-${role}-content`, bg: `--color-${role}`, min: 4.5, why: `text on a ${role} fill` },
    { fg: `--color-${role}`, bg: "--color-base-100", min: 4.5, why: `${role} text on the page` },
    { fg: `--color-${role}`, bg: "--color-base-200", min: 4.5, why: `${role} text on a raised surface` },
  ]),

  // ── the categorical tints ────────────────────────────────────────────────
  { fg: "--color-base-content", bg: "--color-tint-purple", min: 4.5, why: "tint text (purple)" },
  { fg: "--color-base-content", bg: "--color-tint-cyan", min: 4.5, why: "tint text (cyan)" },
  { fg: "--color-base-content", bg: "--color-tint-tangerine", min: 4.5, why: "tint text (tangerine)" },

  // ── boundaries and focus (non-text, 3:1) ─────────────────────────────────
  { fg: "--color-border-strong", bg: "--color-base-100", min: 3, why: "control boundary (non-text)" },
  { fg: "--color-border-strong", bg: "--color-base-200", min: 3, why: "control boundary on a raised surface (non-text)" },
  { fg: "--color-border-hover", bg: "--color-base-100", min: 3, why: "control boundary on hover (non-text)" },
  { fg: "--color-border-error", bg: "--color-base-100", min: 3, why: "error boundary (non-text)" },
  { fg: "--color-primary", bg: "--color-base-100", min: 3, why: "secondary button boundary (non-text)" },
  { fg: "--color-primary-hover", bg: "--color-base-hover", min: 3, why: "secondary button boundary on hover (non-text)" },
  { fg: "--color-primary-active", bg: "--color-base-active", min: 3, why: "secondary button boundary on press (non-text)" },
  { fg: "--color-focus-ring", bg: "--color-base-100", min: 3, why: "focus ring on the page (non-text)" },
  { fg: "--color-focus-ring", bg: "--color-base-200", min: 3, why: "focus ring on a raised surface (non-text)" },
];
