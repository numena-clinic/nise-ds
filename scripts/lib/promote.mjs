// ─────────────────────────────────────────────────────────────────────────────
// Pure helpers for the token promotion step.
//
// A Theme Explorer candidate lists changed tokens. This module turns that list
// into precise, line-scoped edits to the canonical token source — one token per
// edit, no reformatting, no touching anything else. It is intentionally dumb
// about layout: every token entry is a single line of the form
//
//     "--token-name": value,
//
// and only the `value` part is replaced. If a token cannot be found on exactly
// one line, the plan reports it instead of guessing.
//
// The rules here mirror src/explorer/theme/tokens.ts. The real integrity gate is
// the generator + validator (tokens:build, tokens:validate), which the CLI runs
// straight after writing — this module only decides WHICH text to change.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { allTokens, layerOf, primitiveGroups } from "../../tokens/index.mjs";

export const TOKEN_FILES = {
  primitive: "tokens/primitives.mjs",
  semantic: "tokens/semantic.mjs",
  component: "tokens/component.mjs",
};

const ALIAS_RE = /^var\(\s*(--[a-zA-Z0-9_-]+)\s*\)$/;
const LINE_RE = /^(\s*)"(--[a-zA-Z0-9_-]+)":\s*(.*),\s*$/;

/** Color primitives — the only legal targets for a color-role retarget. Read
 * from the source (the brand anchors plus the generated scales), so a scale step
 * becomes a legal target the moment it exists. */
export const COLOR_PRIMITIVES = Object.keys(
  primitiveGroups.find((group) => group.label === "color" || group.label === "color")?.tokens ?? {},
);

/** Named consts already defined in semantic.mjs, so a retarget reuses them. */
const SEMANTIC_CONSTS = {
  "--white": "white",
  "--ink-plum": "inkPlum",
};

import { validateCandidate } from "../../tokens/candidate-schema.mjs";

/** Quote a value as a safe JS string literal using JSON.stringify. */
export function quote(value) {
  return JSON.stringify(value).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

/** The expression to write for an alias retarget, in the given layer. */
export function aliasExpr(layer, ref) {
  if (layer === "semantic" && SEMANTIC_CONSTS[ref]) return SEMANTIC_CONSTS[ref];
  return `ref(${quote(ref)})`;
}

/** True when a token is a color role we allow retargeting (semantic alias). */
export function isColorRole(name) {
  const raw = allTokens[name];
  return (
    layerOf[name] === "semantic" &&
    name.startsWith("--color-") &&
    !!raw &&
    ALIAS_RE.test(raw) &&
    COLOR_PRIMITIVES.includes(raw.match(ALIAS_RE)[1])
  );
}

/** True when a token is a primitive literal we allow editing. */
export function isPrimitiveLiteral(name) {
  return layerOf[name] === "primitive";
}

/**
 * Replace one token's value on its single source line.
 * @returns {{ text: string, changed: boolean, line: number | null, from: string | null, reason?: string }}
 */
export function replaceTokenInFile(text, name, newExpr) {
  const lines = text.split("\n");
  const hits = [];
  lines.forEach((line, i) => {
    const m = line.match(LINE_RE);
    if (m && m[2] === name) hits.push({ i, m });
  });
  if (hits.length === 0) return { text, changed: false, line: null, from: null, reason: "not found" };
  if (hits.length > 1)
    return { text, changed: false, line: null, from: null, reason: `found on ${hits.length} lines` };
  const { i, m } = hits[0];
  const from = m[3];
  lines[i] = `${m[1]}"${name}": ${newExpr},`;
  return { text: lines.join("\n"), changed: true, line: i + 1, from };
}

/**
 * Build the edit plan for a candidate. Pure: reads files, returns new text +
 * a per-token report. Does not write.
 * @returns {{ files: Record<string,string>, edits: object[], errors: string[] }}
 */
export function planPromotion(root, candidate) {
  const originals = {};
  const files = {};
  for (const rel of Object.values(TOKEN_FILES)) {
    const abs = resolve(root, rel);
    const text = readFileSync(abs, "utf8");
    originals[rel] = text;
    files[rel] = text;
  }

  const validation = validateCandidate(candidate);
  if (!validation.ok) {
    return { files: {}, edits: [], errors: validation.errors };
  }

  const drift = validation.candidate.tokens.filter(token => token.from !== allTokens[token.name]);
  if (drift.length) {
    return { files: {}, edits: [], errors: drift.map(token => `${token.name}: source changed since this candidate was authored; export a fresh candidate`) };
  }

  const edits = [];
  const errors = [];

  for (const t of validation.candidate.tokens) {
    const layer = t.layer;

    if (t.kind === "alias") {
      const rel = TOKEN_FILES.semantic;
      const res = replaceTokenInFile(files[rel], t.name, aliasExpr(layer, t.ref));
      if (!res.changed) {
        errors.push(`${t.name}: ${res.reason ?? "could not edit"}`);
        continue;
      }
      files[rel] = res.text;
      edits.push({ name: t.name, layer, from: res.from, to: aliasExpr(layer, t.ref), file: rel, line: res.line });
    } else if (t.kind === "value") {
      const rel = TOKEN_FILES[layer];
      const res = replaceTokenInFile(files[rel], t.name, quote(t.value));
      if (!res.changed) {
        errors.push(`${t.name}: ${res.reason ?? "could not edit"}`);
        continue;
      }
      files[rel] = res.text;
      edits.push({ name: t.name, layer, from: res.from, to: quote(t.value), file: rel, line: res.line });
    }
  }

  // Only return files whose text actually changed.
  const changedFiles = {};
  for (const [rel, text] of Object.entries(files)) if (text !== originals[rel]) changedFiles[rel] = text;

  return { files: changedFiles, edits, errors };
}
