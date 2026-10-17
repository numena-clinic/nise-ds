// ─────────────────────────────────────────────────────────────────────────────
// token source: the COMPONENT layer, as data.
//
// COMPONENT = a value a specific component reads (a control height, a padding).
// It references a primitive, a semantic token, or a shared `--control-*` slot in
// this same layer — never anything above component. The dependency only ever
// points down, toward the primitives. `ref()` checks the name across every
// layer defined so far.
//
// Radii are deliberately absent. As in the existing house system, a component
// declares its own radius at the point of use with a fallback, e.g.
// `border-radius: var(--button-radius, var(--radius-md))`, so one component can
// be re-rounded without adding a token. See docs/tokens.md.
// ─────────────────────────────────────────────────────────────────────────────

import { primitives } from "./primitives.mjs";
import { semantic } from "./semantic.mjs";

const known = { ...primitives, ...semantic };

/** Reference a token from a lower layer, or an earlier group in this layer;
 * throws on an unknown name. */
function ref(name) {
  if (!(name in known)) {
    throw new Error(`component token references unknown token: ${name}`);
  }
  return `var(${name})`;
}

/** Declare a group of component tokens and make them referenceable by later
 * groups (e.g. `button` reuses `--control-height-md`). */
function register(tokens) {
  Object.assign(known, tokens);
  return tokens;
}

/** Shared layout for a labelled control (label, control, hint, error). */
export const field = register({
  "--field-gap": ref("--space-2"),
  "--field-label-gap": ref("--space-1"),
  "--field-message-font-size": ref("--font-size-sm"),
});

/** Size slots shared by every control. `md` is the default and 40px, the
 * desktop hit-area floor (iconography.md §3 — 40px desktop, 44px touch). */
export const control = register({
  "--control-height-sm": "32px",
  "--control-height-md": "40px",
  "--control-height-lg": "48px",
  "--control-padding-x": ref("--space-3"),
  "--control-font-size": ref("--font-size-md"),
  "--control-gap": ref("--space-2"),
  "--control-label-gap": "2px",
});

export const button = register({
  "--button-height-sm": ref("--control-height-sm"),
  "--button-height-md": ref("--control-height-md"),
  "--button-height-lg": ref("--control-height-lg"),
  "--button-padding-x-sm": ref("--space-3"),
  "--button-padding-x-md": ref("--space-4"),
  "--button-padding-x-lg": ref("--space-5"),
  "--button-font-size-sm": ref("--font-size-sm"),
  "--button-font-size-md": ref("--font-size-md"),
  "--button-font-size-lg": ref("--font-size-lg"),
  "--button-gap": ref("--space-2"),
});

export const input = register({
  "--input-height": ref("--control-height-md"),
  "--input-padding-x": ref("--control-padding-x"),
  "--input-font-size": ref("--control-font-size"),
});

export const select = register({
  "--select-height": ref("--control-height-md"),
  "--select-padding-x": ref("--control-padding-x"),
  "--select-font-size": ref("--control-font-size"),
  "--select-item-height": ref("--control-height-sm"),
});

export const badge = register({
  "--badge-height-sm": "20px",
  "--badge-height-md": "24px",
  "--badge-padding-x-sm": ref("--space-2"),
  "--badge-padding-x-md": ref("--space-3"),
  "--badge-font-size-sm": ref("--font-size-xs"),
  "--badge-font-size-md": ref("--font-size-sm"),
  "--badge-gap": ref("--space-1"),
  "--badge-radius": ref("--radius-full"),
});

export const card = register({
  "--card-padding": ref("--space-6"),
  "--card-gap": ref("--space-4"),
  "--card-border-width": ref("--border-width"),
});

/** Checkbox and radio share one box. The hit area is padded out to the 40px
 * control floor in CSS; `--choice-size` is the drawn box itself. */
export const choice = register({
  "--choice-size": "18px",
  "--choice-gap": ref("--space-2"),
  "--choice-group-gap": ref("--space-3"),
});

/** A switch is a fixed proportion: the track is twice the knob plus a 3px inset
 * on each side, so the knob always lands on the token grid. */
export const toggle = register({
  "--switch-width": "42px",
  "--switch-height": "24px",
  "--switch-knob": "18px",
  "--switch-inset": "3px",
});

export const slider = register({
  "--slider-track-height": "6px",
  "--slider-thumb-size": "18px",
  "--slider-gap": ref("--space-4"),
});

export const tabs = register({
  "--tabs-gap": ref("--space-1"),
  "--tab-padding-x": ref("--space-4"),
  "--tab-height": ref("--control-height-md"),
});

export const tooltip = register({
  "--tooltip-padding-x": ref("--space-3"),
  "--tooltip-padding-y": ref("--space-2"),
  "--tooltip-font-size": ref("--font-size-xs"),
  "--tooltip-gap": ref("--space-1"),
});

export const dialog = register({
  "--dialog-padding": ref("--space-6"),
  "--dialog-gap": ref("--space-5"),
  "--dialog-width": "480px",
});

export const table = register({
  "--table-cell-padding-x": ref("--space-4"),
  "--table-cell-padding-y": ref("--space-3"),
  "--table-font-size": ref("--font-size-sm"),
  "--table-header-font-size": ref("--font-size-xs"),
  "--table-row-gap": ref("--space-1"),
});

/** Disabled controls keep their role but drop opacity (iconography.md §4). */
export const state = {
  "--opacity-disabled": "0.55",
};

/** @type {import("./primitives.mjs").Group[]} */
export const componentGroups = [
  { label: "field", note: "Shared labelled-control layout.", tokens: field },
  { label: "control", note: "Shared size slots. `md` is the 40px desktop floor.", tokens: control },
  { label: "button", tokens: button },
  { label: "input", tokens: input },
  { label: "select", tokens: select },
  { label: "badge", tokens: badge },
  { label: "card", tokens: card },
  { label: "choice", note: "Checkbox and radio box.", tokens: choice },
  { label: "switch", tokens: toggle },
  { label: "slider", tokens: slider },
  { label: "tabs", tokens: tabs },
  { label: "tooltip", tokens: tooltip },
  { label: "dialog", tokens: dialog },
  { label: "table", tokens: table },
  { label: "state", tokens: state },
];

export const component = Object.assign({}, ...componentGroups.map((g) => g.tokens));
