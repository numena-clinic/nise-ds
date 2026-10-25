// ─────────────────────────────────────────────────────────────────────────────
// Token introspection for the Theme Explorer.
//
// The canonical token source (tokens/*.mjs) is plain data, so the explorer reads
// the SAME graph the generator and validator use — there is no second, hand-kept
// list of tokens here. Everything below is derived from `layers` / `allTokens` /
// `layerOf`, so a token added to the source appears in the explorer automatically.
//
// From each token's raw value we classify its FORM:
//   · "value"   a literal (primitives, and a few component sizes)
//   · "alias"   exactly `var(--other)` — a reference to another token
//   · "derived" a `color-mix(...)` derivation (e.g. --color-text-muted)
// Only "value" tokens and color "alias" roles are directly editable; derived
// tokens are shown read-only because they follow the values they are derived from.
// ─────────────────────────────────────────────────────────────────────────────

import { layers, allTokens, layerOf } from "../../../tokens/index.mjs";
import { brandAnchors } from "../../../tokens/palette.mjs";

export type LayerId = "primitive" | "semantic" | "component";
export type Section = "color" | "typography" | "space" | "shape" | "motion";
export type Form = "value" | "alias" | "derived";
export type Control = "color" | "length" | "number" | "time" | "fontFamily";

export interface TokenGroup {
  label: string;
  note?: string;
  tokens: Record<string, string>;
}
export interface Layer {
  id: LayerId;
  title: string;
  allow: string[];
  groups: TokenGroup[];
}

export const LAYERS = layers as Layer[];
export const ALL_TOKENS = allTokens as Record<string, string>;
export const LAYER_OF = layerOf as Record<string, LayerId>;

/** Every token, with its layer, group and classified form. */
export interface TokenInfo {
  name: string;
  layer: LayerId;
  group: string;
  section: Section;
  raw: string;
  form: Form;
  /** For an alias: the token it references. */
  ref?: string;
  /** Primitives are the only tokens whose value is authored directly. */
  primitive: boolean;
  /** A brand anchor (color.md §2): fixed, never editable, shown read-only. */
  immutable: boolean;
}

/** The ten brand anchors. numena-brand owns their values; the explorer shows
 * them but cannot change them (see docs/decisions.md, "identity"). */
export const IMMUTABLE_PRIMITIVES: ReadonlySet<string> = new Set(
  brandAnchors.map((a: { name: string }) => a.name),
);

const ALIAS_RE = /^var\(\s*(--[a-zA-Z0-9_-]+)\s*\)$/;

function groupSection(layer: LayerId, group: string, name: string): Section {
  const key = `${layer}:${group}`;
  const map: Record<string, Section> = {
    "primitive:color": "color",
    "primitive:typography": "typography",
    "primitive:spacing": "space",
    "primitive:layout": "space",
    "primitive:radius": "shape",
    "primitive:border": "shape",
    "primitive:elevation": "shape",
    "primitive:motion": "motion",
    "semantic:base": "color",
    "semantic:emphasis": "color",
    "semantic:status": "color",
    "semantic:supporting": "color",
    "semantic:tints": "color",
  };
  const hit = map[key];
  if (hit) return hit;
  // An unlisted group still lands in the right tab if its tokens are color
  // roles — every color role in the contract is named --color-*.
  if (name.startsWith("--color-")) return "color";
  return "shape";
}

export const TOKEN_INFOS: TokenInfo[] = LAYERS.flatMap((layer) =>
  layer.groups.flatMap((group) =>
    Object.entries(group.tokens).map(([name, raw]) => {
      const alias = raw.match(ALIAS_RE);
      const form: Form = alias ? "alias" : raw.includes("color-mix(") ? "derived" : "value";
      return {
        name,
        layer: layer.id,
        group: group.label,
        section: groupSection(layer.id, group.label, name),
        raw,
        form,
        ref: alias ? alias[1] : undefined,
        primitive: layer.id === "primitive",
        immutable: IMMUTABLE_PRIMITIVES.has(name),
      };
    }),
  ),
);

export const INFO_BY_NAME: Record<string, TokenInfo> = Object.fromEntries(
  TOKEN_INFOS.map((t) => [t.name, t]),
);

/** Color primitives (brand anchors + generated scales) — the targets a color
 * role may point at. */
export const COLOR_PRIMITIVES: string[] = TOKEN_INFOS.filter(
  (t) => t.layer === "primitive" && (t.group === "color" || t.group === "color"),
).map((t) => t.name);

const COLOR_PRIMITIVE_SET = new Set(COLOR_PRIMITIVES);

/** Families already referenced in the repo. The policy keeps us to these. */
export const FONT_FAMILIES = ["Albert Sans", "Tiempos Text", "Georgia", "system-ui"];

// ── direct + transitive dependents ───────────────────────────────────────────

const DIRECT_DEPENDENTS: Record<string, string[]> = {};
for (const [name, raw] of Object.entries(ALL_TOKENS)) {
  for (const m of raw.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)\s*\)/g)) {
    const ref = m[1]!;
    (DIRECT_DEPENDENTS[ref] ??= []).push(name);
  }
}

export function directDependents(name: string): string[] {
  return DIRECT_DEPENDENTS[name] ?? [];
}

/** All tokens that would change (directly or indirectly) if `name` changed. */
export function transitiveDependents(name: string): string[] {
  const seen = new Set<string>();
  const stack = [...directDependents(name)];
  while (stack.length) {
    const next = stack.pop()!;
    if (seen.has(next)) continue;
    seen.add(next);
    stack.push(...directDependents(next));
  }
  return [...seen];
}

/** The color roles that point at a primitive in the LIGHT base (D19 — the
 *  explorer edits the light base; dark is a view of it).
 *
 *  Since D22 several brand anchors are load-bearing: the page, the body text,
 *  the secondary fill and the accent fill all read an anchor, so an anchor is
 *  not an inert artwork swatch any more. Naming the roles an anchor drives is
 *  what makes the immutability legible — "the page cannot be re-colored here"
 *  is a different statement from "this hex is fixed". */
export function rolesPointingAt(primitive: string): string[] {
  return directDependents(primitive)
    .filter((name) => name.startsWith("--color-"))
    .sort();
}

export interface AnchorRoles {
  /** Surface and fill roles the anchor drives — the page, the ink, a fill. */
  drives: string[];
  /** `-content` roles that pair with a fill and read this anchor as text. */
  textOn: string[];
}

/** Split an anchor's readership: the fills and surfaces it paints, and the
 *  labels it paints on top of them. `--white` paints the page and the label
 *  on seven fills; saying so in one list would hide the first fact under the
 *  second.
 *
 *  `--color-base-content` is body text on the page, not a label on a fill, so
 *  it stays on the "drives" side even though it ends in `-content`. */
export function anchorRoles(primitive: string): AnchorRoles {
  const all = rolesPointingAt(primitive);
  const isLabelOnFill = (name: string) =>
    name.endsWith("-content") && name !== "--color-base-content";
  return {
    drives: all.filter((name) => !isLabelOnFill(name)),
    textOn: all.filter(isLabelOnFill).map((name) => name.replace(/^--color-/, "").replace(/-content$/, "")),
  };
}

/** The brand anchors, by name — the values the panel shows as immutable. */
export const ANCHOR_NAMES: Set<string> = new Set(
  TOKEN_INFOS.filter((t) => t.immutable).map((t) => t.name),
);

/** True when a role reads a brand anchor AND is a surface or a fill — the
 *  loads a role can carry. A `-content` role reading an anchor is expected
 *  (the label on a fill is the page's own white), so it is not called out.
 *  `--color-base-content` is body text, and is. */
export function isAnchorRole(name: string, ref: string | undefined): boolean {
  if (!ref || !ANCHOR_NAMES.has(ref)) return false;
  return !name.endsWith("-content") || name === "--color-base-content";
}

// ── editable descriptors ─────────────────────────────────────────────────────

export interface EditableToken {
  name: string;
  layer: LayerId;
  group: string;
  section: Section;
  /** "value" edits the literal; "alias" retargets which primitive it points at. */
  kind: "value" | "alias";
  control: Control;
  /** Unit a length/number/time value must carry ("" means unitless). */
  unit?: string;
  /** The canonical raw value the baseline holds. */
  canonical: string;
  /** For an alias: the primitive it currently points at. */
  canonicalRef?: string;
  /** Allowed targets when kind is "alias" (primitive names). */
  options?: string[];
  /** Allowed first families when control is "fontFamily". */
  families?: string[];
}

const UNIT_RE = /(-?\d*\.?\d+)(px|rem|em|ch|%|ms)?$/;

function controlFor(info: TokenInfo): { control: Control; unit?: string } | null {
  const { name, raw } = info;
  if (info.group === "color" || info.group === "color") return { control: "color" };
  if (name === "--font-sans" || name === "--font-serif") return { control: "fontFamily" };
  const m = raw.match(UNIT_RE);
  if (!m) return null;
  const unit = m[2] ?? "";
  if (unit === "ms") return { control: "time", unit };
  if (unit === "") return { control: "number", unit };
  return { control: "length", unit };
}

function isEditable(info: TokenInfo): boolean {
  if (info.immutable) return false;
  if (info.form === "derived") return false;
  if (info.primitive) {
    // Color, sizes, spacing, radius, borders, layout, durations — but not the
    // two shadow strings or the two cubic-bezier easings (not safely editable
    // as a single control yet).
    return controlFor(info) !== null;
  }
  if (info.layer === "semantic") {
    // Only color roles that alias a color primitive.
    return info.form === "alias" && info.name.startsWith("--color-") && COLOR_PRIMITIVE_SET.has(info.ref!);
  }
  if (info.layer === "component") {
    // Only the component-layer literals (control heights, badge heights, opacity).
    return info.form === "value" && controlFor(info) !== null;
  }
  return false;
}

function toEditable(info: TokenInfo): EditableToken | null {
  if (!isEditable(info)) return null;
  const base = {
    name: info.name,
    layer: info.layer,
    group: info.group,
    section: info.section,
    canonical: info.raw,
  };
  if (info.form === "alias") {
    return {
      ...base,
      kind: "alias",
      control: "color",
      canonicalRef: info.ref,
      options: COLOR_PRIMITIVES,
    };
  }
  const c = controlFor(info)!;
  return {
    ...base,
    kind: "value",
    control: c.control,
    unit: c.unit,
    ...(c.control === "fontFamily" ? { families: FONT_FAMILIES } : {}),
  };
}

export const EDITABLES: EditableToken[] = TOKEN_INFOS.map(toEditable).filter(
  (e): e is EditableToken => e !== null,
);

export const EDITABLE_BY_NAME: Record<string, EditableToken> = Object.fromEntries(
  EDITABLES.map((e) => [e.name, e]),
);

/** The brand anchors, shown read-only in the palette (never in EDITABLES). */
export const IMMUTABLE_TOKENS: TokenInfo[] = TOKEN_INFOS.filter((t) => t.immutable);

/** Derived tokens, shown read-only so the dependency is visible. */
export const DERIVED_TOKENS: TokenInfo[] = TOKEN_INFOS.filter((t) => t.form === "derived");

/** Section → group → editable tokens, for rendering the panel. */
export function editablesBySection(): Record<Section, Record<string, EditableToken[]>> {
  const out = {} as Record<Section, Record<string, EditableToken[]>>;
  for (const e of EDITABLES) {
    (out[e.section] ??= {});
    (out[e.section]![e.group] ??= []).push(e);
  }
  return out;
}
