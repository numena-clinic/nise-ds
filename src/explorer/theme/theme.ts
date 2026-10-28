// ─────────────────────────────────────────────────────────────────────────────
// Experimental theme state, contrast re-checking, and the portable candidate.
//
// The explorer never writes to the token source while you work. It keeps a small
// map of OVERRIDES (only the tokens you changed), applies them as scoped CSS
// custom properties on the preview, re-runs the same contrast promises the
// validator checks, and can serialise the change set into a versioned candidate
// file. Turning that candidate into real source is a separate, explicit step:
// `npm run theme:apply` (see scripts/apply-theme.mjs). Nothing here touches disk.
// ─────────────────────────────────────────────────────────────────────────────

import { contrastChecks } from "../../../tokens/semantic.mjs";
import { themeOverrides } from "../../../tokens/themes.mjs";
import { expand, parseColor, contrast } from "../../../tokens/color.mjs";
import {
  ALL_TOKENS,
  EDITABLE_BY_NAME,
  LAYER_OF,
  directDependents,
  transitiveDependents,
  type EditableToken,
  type LayerId,
} from "./tokens";

/** A single change. "value" replaces a literal; "alias" retargets a reference. */
export type Override = { kind: "value"; value: string } | { kind: "alias"; ref: string };
export type Overrides = Record<string, Override>;

/** Which theme mapping the preview and the contrast re-check are judged under.
 * The explorer EDITS the light base (D19); "dark" is a VIEW of the same edits
 * against tokens/themes.mjs. */
export type ThemeMode = "light" | "dark";

const DARK_RAW = themeOverrides.dark as Record<string, string>;

/** Every token whose raw value differs between the two themes — exactly the
 * keys of the generated [data-theme="dark"] block. */
export const THEME_VARYING: string[] = Object.keys(DARK_RAW);

export interface ContrastCheck {
  fg: string;
  bg: string;
  min: number;
  why: string;
}
export const CONTRAST_CHECKS = contrastChecks as ContrastCheck[];

// ── baseline ─────────────────────────────────────────────────────────────────

export function canonicalOverride(e: EditableToken): Override {
  return e.kind === "alias"
    ? { kind: "alias", ref: e.canonicalRef! }
    : { kind: "value", value: e.canonical };
}

/** True when the override differs from the token's canonical value. */
export function isChanged(name: string, override: Override | undefined): boolean {
  const e = EDITABLE_BY_NAME[name];
  if (!e || !override) return false;
  const base = canonicalOverride(e);
  if (base.kind === "value" && override.kind === "value") return base.value !== override.value;
  if (base.kind === "alias" && override.kind === "alias") return base.ref !== override.ref;
  return true;
}

/** Drop no-op overrides so "unsaved changes" only counts real edits. */
export function prune(overrides: Overrides): Overrides {
  const out: Overrides = {};
  for (const [name, o] of Object.entries(overrides)) if (isChanged(name, o)) out[name] = o;
  return out;
}

export function changeCount(overrides: Overrides): number {
  return Object.keys(prune(overrides)).length;
}

// ── value validation ─────────────────────────────────────────────────────────

const NUMBER_RE = /^-?\d*\.?\d+$/;

export function validateValue(e: EditableToken, raw: string): string | null {
  const value = raw.trim();
  if (value === "") return "Value is required";
  switch (e.control) {
    case "color":
      return parseColor(value) ? null : `Enter a hex color (e.g. ${ALL_TOKENS["--deep-purple"]})`;
    case "number":
      return NUMBER_RE.test(value) ? null : "Enter a number (e.g. 1.5)";
    case "time":
      return /^\d+ms$/.test(value) ? null : "Enter a duration in ms (e.g. 120ms)";
    case "length": {
      const m = value.match(/^(-?\d*\.?\d+)([a-z%]*)$/);
      if (!m) return "Enter a number with a unit (e.g. 12px)";
      const unit = m[2];
      if (e.unit && unit !== e.unit) return `Expected a ${e.unit} value (e.g. 12${e.unit})`;
      return null;
    }
    case "fontFamily":
      return (e.families ?? []).some((f) => value.replace(/^["']/, "").startsWith(f))
        ? null
        : `Start the stack with one of: ${(e.families ?? []).join(", ")}`;
  }
}

/** Options shown for a fontFamily control (the allowed first family). */
export function fontFamilyOptions(e: EditableToken): string[] {
  return e.families ?? [];
}

/** The current first family of a font stack, and the tail we keep. */
export function fontStackParts(value: string): { first: string; tail: string } {
  const idx = value.indexOf(",");
  if (idx === -1) return { first: value.trim(), tail: "" };
  return { first: value.slice(0, idx).trim().replace(/^["']|["']$/g, ""), tail: value.slice(idx) };
}

export function withFontFamily(value: string, family: string): string {
  const { tail } = fontStackParts(value);
  const first = family.includes(" ") ? `"${family}"` : family;
  return `${first}${tail}`;
}

// ── experimental resolution ──────────────────────────────────────────────────

/** The token graph with overrides applied — the "experimental" state.
 * Under the light-authoring/dark-view model:
 * 1. User overrides edit the light base.
 * 2. In dark mode, authored DARK_RAW mappings take precedence over light base. */
export function experimentalTokens(overrides: Overrides, mode: ThemeMode = "light"): Record<string, string> {
  const map: Record<string, string> = { ...ALL_TOKENS };
  for (const [name, o] of Object.entries(overrides)) {
    if (!(name in EDITABLE_BY_NAME)) continue;
    map[name] = o.kind === "alias" ? `var(${o.ref})` : o.value;
  }
  if (mode === "dark") {
    for (const [name, raw] of Object.entries(DARK_RAW)) {
      map[name] = raw;
    }
  }
  return map;
}

/** Inline custom properties for a scoped preview wrapper (no :root mutation).
 *
 * 1. Theme-varying tokens are pinned to the active mode.
 * 2. User overrides are applied (in dark mode, authored DARK_RAW overrides light edits).
 * 3. Transitive dependents of altered tokens are redeclared at preview scope so
 *    dependent aliases resolve against the scoped variables instead of :root. */
export function previewStyle(overrides: Overrides, mode: ThemeMode = "light"): Record<string, string> {
  const style: Record<string, string> = {};
  const themeSource = mode === "dark" ? DARK_RAW : ALL_TOKENS;
  for (const name of THEME_VARYING) {
    const raw = themeSource[name];
    if (raw !== undefined) style[name] = raw;
  }
  for (const [name, o] of Object.entries(overrides)) {
    if (!(name in EDITABLE_BY_NAME)) continue;
    if (mode === "dark" && name in DARK_RAW) {
      continue;
    }
    style[name] = o.kind === "alias" ? `var(${o.ref})` : o.value;
  }

  // Redeclare necessary dependency graph at the preview scope
  const changedTokens = new Set<string>();
  for (const name of Object.keys(overrides)) {
    if (name in EDITABLE_BY_NAME) changedTokens.add(name);
  }
  if (mode === "dark") {
    for (const name of THEME_VARYING) {
      changedTokens.add(name);
    }
  }

  const dependentsToRedeclare = new Set<string>();
  for (const token of changedTokens) {
    for (const dep of transitiveDependents(token)) {
      dependentsToRedeclare.add(dep);
    }
  }

  for (const dep of dependentsToRedeclare) {
    if (dep in style) continue;
    const darkVal = mode === "dark" ? DARK_RAW[dep] : undefined;
    const baseVal = ALL_TOKENS[dep];
    if (darkVal !== undefined) {
      style[dep] = darkVal;
    } else if (baseVal !== undefined) {
      style[dep] = baseVal;
    }
  }

  return style;
}

/** Fully resolve one token (color → hex, length → as written) in a token map. */
export function resolve(name: string, map: Record<string, string>): string {
  const raw = map[name];
  if (raw === undefined) return "";
  try {
    return expand(name, map, [name], () => {});
  } catch {
    return raw;
  }
}

/** What the shipped dark mapping points a role at, and the value it resolves
 *  to there. The explorer edits the LIGHT base (D19): promoting a candidate
 *  changes the light contract, and `tokens/themes.mjs` keeps its own target
 *  for a role until it is edited in turn. Showing both is the difference
 *  between "the dark theme re-points this role" and "the dark theme is a
 *  different color". */
export function darkTarget(
  name: string,
  map: Record<string, string>,
): { ref: string; resolved: string } | null {
  const raw = DARK_RAW[name];
  if (raw === undefined) return null;
  const ref = raw.replace(/^var\(\s*|\s*\)$/g, "");
  return { ref, resolved: resolve(name, map) };
}

export interface ContrastResult extends ContrastCheck {
  fgResolved: string;
  bgResolved: string;
  ratio: number;
  pass: boolean;
}

/** Re-run every contrast promise against the experimental tokens, under the
 * given theme mapping. */
export function resolveContrast(overrides: Overrides, mode: ThemeMode = "light"): ContrastResult[] {
  const map = experimentalTokens(overrides, mode);
  return CONTRAST_CHECKS.map((check) => {
    const fgResolved = resolve(check.fg, map);
    const bgResolved = resolve(check.bg, map);
    const fg = parseColor(fgResolved);
    const bg = parseColor(bgResolved);
    const ratio = fg && bg ? contrast(fg, bg) : 0;
    return {
      ...check,
      fgResolved,
      bgResolved,
      ratio: Math.round(ratio * 100) / 100,
      pass: !!fg && !!bg && ratio >= check.min,
    };
  });
}

// ── diff (for the review step) ───────────────────────────────────────────────

export interface DiffRow {
  name: string;
  layer: LayerId;
  group: string;
  kind: "value" | "alias";
  from: string;
  to: string;
  /** Tokens that point at this one directly. */
  direct: string[];
  /** Every token that follows it, directly or transitively. */
  dependents: string[];
}

export function diffRows(overrides: Overrides): DiffRow[] {
  const rows: DiffRow[] = [];
  for (const [name, o] of Object.entries(prune(overrides))) {
    const e = EDITABLE_BY_NAME[name];
    if (!e) continue;
    rows.push({
      name,
      layer: LAYER_OF[name] ?? "primitive",
      group: e.group,
      kind: o.kind,
      from: e.kind === "alias" ? `var(${e.canonicalRef})` : e.canonical,
      to: o.kind === "alias" ? `var(${o.ref})` : o.value,
      direct: directDependents(name),
      dependents: transitiveDependents(name),
    });
  }
  return rows;
}

import {
  parseCandidateText,
  CANDIDATE_SCHEMA,
  CANDIDATE_VERSION,
} from "../../../tokens/candidate-schema.mjs";

export { CANDIDATE_SCHEMA, CANDIDATE_VERSION };

export interface CandidateToken {
  name: string;
  layer: LayerId;
  kind: "value" | "alias";
  /** Present when kind is "value". */
  value?: string;
  /** Present when kind is "alias". */
  ref?: string;
  /** The canonical value/ref the candidate was authored against (drift check). */
  from: string;
}
export interface Candidate {
  schema: typeof CANDIDATE_SCHEMA;
  version: typeof CANDIDATE_VERSION;
  tokens: CandidateToken[];
}

export function serializeCandidate(overrides: Overrides): Candidate {
  const tokens: CandidateToken[] = [];
  for (const [name, o] of Object.entries(prune(overrides))) {
    const e = EDITABLE_BY_NAME[name];
    if (!e) continue;
    tokens.push(
      o.kind === "value"
        ? { name, layer: e.layer, kind: "value", value: o.value, from: e.canonical }
        : { name, layer: e.layer, kind: "alias", ref: o.ref, from: `var(${e.canonicalRef})` },
    );
  }
  tokens.sort((a, b) => a.name.localeCompare(b.name));
  return { schema: CANDIDATE_SCHEMA, version: CANDIDATE_VERSION, tokens };
}

export function candidateToJson(candidate: Candidate): string {
  return JSON.stringify(candidate, null, 2) + "\n";
}

export type ParseResult =
  | { ok: true; candidate: Candidate; errors: string[] }
  | { ok: false; candidate: null; errors: string[] };

/** Parse and validate a candidate file's text using shared environment-neutral schema.
 * Enforces atomic imports: returns ok: false and candidate: null on any error.
 * Preserves incoming `from` field to enable accurate drift detection. */
export function parseCandidate(text: string): ParseResult {
  const res = parseCandidateText(text);
  if (!res.ok) {
    return { ok: false, candidate: null, errors: res.errors };
  }
  return { ok: true, candidate: res.candidate as Candidate, errors: [] };
}

/** Turn a candidate back into overrides (used by import). */
export function overridesFromCandidate(candidate: Candidate): Overrides {
  const out: Overrides = {};
  for (const t of candidate.tokens) {
    if (t.kind === "alias") out[t.name] = { kind: "alias", ref: t.ref! };
    else out[t.name] = { kind: "value", value: t.value! };
  }
  return prune(out);
}

/** Warnings about a candidate whose `from` no longer matches the source (drift). */
export function candidateDrift(candidate: Candidate): string[] {
  const warnings: string[] = [];
  for (const t of candidate.tokens) {
    const e = EDITABLE_BY_NAME[t.name];
    if (!e) continue;
    const current = e.kind === "alias" ? `var(${e.canonicalRef})` : e.canonical;
    if (current !== t.from) {
      warnings.push(`${t.name}: source is now ${current}, candidate was authored against ${t.from}`);
    }
  }
  return warnings;
}
