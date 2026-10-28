// ─────────────────────────────────────────────────────────────────────────────
// Shared, environment-neutral validation for Theme Explorer candidates.
//
// Both the browser importer (src/explorer/theme/theme.ts) and the CLI promoter
// (scripts/apply-theme.mjs, scripts/lib/promote.mjs) use this module to enforce
// identical integrity rules before importing or planning source edits.
// ─────────────────────────────────────────────────────────────────────────────

import { allTokens, layerOf, layers } from "./index.mjs";
import { brandAnchors } from "./palette.mjs";
import { parseColor } from "./color.mjs";

export const CANDIDATE_SCHEMA = "nise.theme-candidate";
export const CANDIDATE_VERSION = 1;

export const FONT_FAMILIES = ["Albert Sans", "Tiempos Text", "Georgia", "system-ui"];

const IMMUTABLE_NAMES = new Set(brandAnchors.map((a) => a.name));

const ALIAS_RE = /^var\(\s*(--[a-zA-Z0-9_-]+)\s*\)$/;
const UNIT_RE = /^(-?\d*\.?\d+)(px|rem|em|ch|%|ms)?$/;
const NUMBER_RE = /^-?\d*\.?\d+$/;
const TIME_RE = /^\d+ms$/;

/** Color primitives (brand anchors + generated scales) */
export const COLOR_PRIMITIVES = layers
  .find((l) => l.id === "primitive")
  ?.groups.filter((g) => g.label === "color")
  .flatMap((g) => Object.keys(g.tokens)) ?? [];

const COLOR_PRIMITIVE_SET = new Set(COLOR_PRIMITIVES);

/** Classify token control and expected unit from raw value */
export function controlForToken(name, raw, layer, group) {
  if (group === "color") return { control: "color" };
  if (name === "--font-sans" || name === "--font-serif") return { control: "fontFamily" };
  const m = String(raw).match(UNIT_RE);
  if (!m) return null;
  const unit = m[2] ?? "";
  if (unit === "ms") return { control: "time", unit };
  if (unit === "") return { control: "number", unit };
  return { control: "length", unit };
}

/** Check if a token is editable in the system */
export function isTokenEditable(name) {
  if (IMMUTABLE_NAMES.has(name)) return false;
  const raw = allTokens[name];
  if (!raw) return false;
  if (raw.includes("color-mix(")) return false;

  const layer = layerOf[name];
  const alias = raw.match(ALIAS_RE);

  if (layer === "primitive") {
    if (alias) return false;
    // Find group
    const primLayer = layers.find((l) => l.id === "primitive");
    const group = primLayer?.groups.find((g) => name in g.tokens)?.label ?? "";
    return controlForToken(name, raw, layer, group) !== null;
  }

  if (layer === "semantic") {
    return !!alias && name.startsWith("--color-") && COLOR_PRIMITIVE_SET.has(alias[1]);
  }

  if (layer === "component") {
    if (alias) return false;
    const compLayer = layers.find((l) => l.id === "component");
    const group = compLayer?.groups.find((g) => name in g.tokens)?.label ?? "";
    return controlForToken(name, raw, layer, group) !== null;
  }

  return false;
}

/** Validate a value literal against a token's definition */
export function validateTokenValue(name, rawValue) {
  const value = typeof rawValue === "string" ? rawValue.trim() : "";
  if (value === "") return "value is required";

  const raw = allTokens[name];
  const layer = layerOf[name];
  const layerObj = layers.find((l) => l.id === layer);
  const group = layerObj?.groups.find((g) => name in g.tokens)?.label ?? "";
  const ctrl = controlForToken(name, raw, layer, group);

  if (!ctrl) return "unsupported token type";

  switch (ctrl.control) {
    case "color": {
      const parsed = parseColor(value);
      if (!parsed) return `invalid color value: "${value}"`;
      if (!value.startsWith("#")) return `color must be a hex literal: "${value}"`;
      return null;
    }
    case "number": {
      if (!NUMBER_RE.test(value)) return `expected a number: "${value}"`;
      const num = parseFloat(value);
      if (!Number.isFinite(num)) return "number must be finite";
      if (name.startsWith("--line-height-") && num <= 0) return "line height must be positive";
      if (name.startsWith("--font-weight-") && (num < 1 || num > 1000)) return "font weight must be between 1 and 1000";
      if (name.includes("opacity")) {
        if (num < 0 || num > 1) return `opacity must be between 0 and 1: "${value}"`;
      }
      return null;
    }
    case "time": {
      if (!TIME_RE.test(value)) return `expected duration in ms (e.g. 120ms): "${value}"`;
      return null;
    }
    case "length": {
      const m = value.match(UNIT_RE);
      if (!m) return `invalid length format: "${value}"`;
      const num = parseFloat(m[1]);
      const unit = m[2] ?? "";
      if (ctrl.unit && unit !== ctrl.unit) {
        return `expected unit "${ctrl.unit}": "${value}"`;
      }
      if (
        (name.startsWith("--font-size-") ||
          name.startsWith("--space-") ||
          name.startsWith("--radius-") ||
          name.startsWith("--control-height-") ||
          name.startsWith("--badge-height-") ||
          name.startsWith("--border-width") ||
          name.startsWith("--focus-ring-")) &&
        num < 0
      ) {
        return `length must be non-negative: "${value}"`;
      }
      return null;
    }
    case "fontFamily": {
      const first = value.split(",")[0].trim().replace(/^["']|["']$/g, "");
      const valid = FONT_FAMILIES.includes(first);
      if (!valid) {
        return `start font stack with one of: ${FONT_FAMILIES.join(", ")}`;
      }
      return null;
    }
    default:
      return null;
  }
}

/**
 * Validate candidate structure, token editability, types, units, and ranges.
 * Atomic: returns { ok: true, candidate, errors: [] } ONLY if all tokens pass.
 * Otherwise returns { ok: false, candidate: null, errors: [...] }.
 */
export function validateCandidate(data) {
  const errors = [];

  if (typeof data !== "object" || data === null) {
    return { ok: false, candidate: null, errors: ["candidate must be a JSON object"] };
  }

  if (data.schema !== CANDIDATE_SCHEMA) {
    errors.push(`expected schema "${CANDIDATE_SCHEMA}", got "${String(data.schema)}"`);
  }
  if (data.version !== CANDIDATE_VERSION) {
    errors.push(`unsupported version: ${String(data.version)}`);
  }
  if (!Array.isArray(data.tokens)) {
    errors.push('"tokens" must be an array');
    return { ok: false, candidate: null, errors };
  }

  const seen = new Set();
  const validatedTokens = [];

  for (let i = 0; i < data.tokens.length; i++) {
    const raw = data.tokens[i];
    const at = `tokens[${i}]`;

    if (typeof raw !== "object" || raw === null) {
      errors.push(`${at}: not an object`);
      continue;
    }

    const { name, kind, value, ref, from } = raw;

    if (typeof name !== "string" || !(name in allTokens)) {
      errors.push(`${at}: unknown token "${String(name)}"`);
      continue;
    }

    if (seen.has(name)) {
      errors.push(`${at}: duplicate token "${name}"`);
      continue;
    }
    seen.add(name);

    if (IMMUTABLE_NAMES.has(name)) {
      errors.push(`${name}: brand anchors are immutable and cannot be edited`);
      continue;
    }

    if (!isTokenEditable(name)) {
      errors.push(`${name}: token is not editable`);
      continue;
    }

    const layer = layerOf[name];
    const canonicalRaw = allTokens[name];
    const expectedCanonicalFrom = canonicalRaw;

    // Preserve incoming `from` if provided, else fallback to current canonical
    const tokenFrom = typeof from === "string" ? from : expectedCanonicalFrom;

    if (kind === "alias") {
      if (layer !== "semantic" || !name.startsWith("--color-")) {
        errors.push(`${name}: only semantic color roles can be alias retargets`);
        continue;
      }
      if (typeof ref !== "string" || !COLOR_PRIMITIVE_SET.has(ref)) {
        errors.push(`${name}: alias target "${String(ref)}" is not a legal color primitive`);
        continue;
      }
      validatedTokens.push({
        name,
        layer,
        kind: "alias",
        ref,
        from: tokenFrom,
      });
    } else if (kind === "value") {
      if (typeof value !== "string") {
        errors.push(`${name}: value must be a string`);
        continue;
      }
      const valError = validateTokenValue(name, value);
      if (valError) {
        errors.push(`${name}: ${valError}`);
        continue;
      }
      validatedTokens.push({
        name,
        layer,
        kind: "value",
        value,
        from: tokenFrom,
      });
    } else {
      errors.push(`${name}: kind must be "value" or "alias"`);
    }
  }

  if (errors.length > 0) {
    return { ok: false, candidate: null, errors };
  }

  return {
    ok: true,
    candidate: {
      schema: CANDIDATE_SCHEMA,
      version: CANDIDATE_VERSION,
      tokens: validatedTokens,
    },
    errors: [],
  };
}

/** Parse JSON string and validate candidate atomically */
export function parseCandidateText(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { ok: false, candidate: null, errors: [`Not valid JSON: ${e.message}`] };
  }
  return validateCandidate(data);
}
