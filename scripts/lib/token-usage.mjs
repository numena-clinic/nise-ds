// Pure token-boundary scanner.
//
// The mechanical half of "tokens are the only source of visual truth": given a
// file's text, it finds
//   1. a `var()` that references a token which does not exist
//   2. a raw colour literal instead of a semantic token
//   3. an off-token `px` value on a spacing / radius / type property
//
// It performs no I/O and never exits the process, so it is unit-testable
// (tests/usage.test.ts) exactly like scripts/lib/promote.mjs. The CLI wrapper
// (scripts/check-token-usage.mjs) walks the tree and reports.
//
// Known boundaries (kept deliberately narrow so there are no false positives):
//   · Block comments are stripped across lines; `//` comments are stripped per
//     line, so a `//` inside a multi-line template literal is not detected.
//   · A CSS declaration is only recognised when it is delimited by `{`/`;` and
//     ends at `;`/`}` — a selector colon (`a:hover`) is never a declaration.
//   · `var()` and colour rules are line-oriented: a `var()` name split across a
//     newline is not seen, and a bare named colour is only caught when followed
//     by `;`.
//   · JSX is only inspected inside an inline `style={{ … }}`; a unitless
//     React style number (which React renders as px) is out of scope — only an
//     explicit `"…px"` is policed.

// Files that are generated from the token source and therefore allowed to
// contain the values the source itself produces.
export const GENERATED = ["src/tokens/tokens.css"];

// One documented exemption: a single line carrying the marker
// `token-boundary: waive` — used only for colour-picker affordances (a hue
// slider's spectrum) that are UI chrome, not themeable colour.
export const WAIVER = /token-boundary:\s*waive/;

export const COLOR_LITERAL =
  /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\(/;

export const NAMED_COLORS = new Set([
  "black", "white", "red", "green", "blue", "yellow", "orange", "purple",
  "pink", "brown", "gray", "grey", "silver", "maroon", "navy", "teal",
  "olive", "lime", "aqua", "fuchsia", "cyan", "magenta", "gold", "crimson",
  "salmon", "tomato", "khaki", "indigo", "violet",
]);

// px is only allowed on these when it comes through a token.
export const PX_PROPERTY =
  /^(?:margin|padding|gap|row-gap|column-gap|inset|font-size|line-height|letter-spacing|border-width|outline-offset|outline-width|outline|border)(?:-(?:top|right|bottom|left|inline|block|start|end))*(?:-(?:width|radius|size))*$/;
export const PX_PROPERTY_RADIUS = /(?:^|-)(?:border-)?radius(?:$|-)/;

const KEBAB = (s) => s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());

/**
 * Replace block comments with spaces, preserving newlines so every reported
 * line number still matches the source. Handles comments that span lines, which
 * a per-line strip cannot.
 */
export function stripBlockComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
}

/**
 * Remove a trailing `//` comment from one line, skipping `://` (URLs) and any
 * `//` inside a quoted string. A per-line approximation: a `//` inside a
 * multi-line template literal is not detected.
 */
export function stripLineComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "/" && line[i + 1] === "/" && line[i - 1] !== ":") return line.slice(0, i);
  }
  return line;
}

/** `var()` references that have no fallback must name a token that exists. */
export function checkVars(text, isKnownToken) {
  const out = [];
  for (const m of text.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)\s*(,|\))/g)) {
    const [, name, closer] = m;
    if (closer === ")" && !isKnownToken(name)) out.push(`unknown token ${name}`);
  }
  return out;
}

/** Reports a raw colour literal, or a bare named colour in a declaration. */
export function checkColor(text) {
  const out = [];
  if (COLOR_LITERAL.test(text)) {
    return [`raw colour literal — use a semantic token: ${text.trim()}`];
  }
  for (const m of text.matchAll(/:\s*([a-zA-Z]+)\s*;/g)) {
    const word = m[1].toLowerCase();
    if (NAMED_COLORS.has(word)) out.push(`named colour "${word}" — use a semantic token`);
  }
  return out;
}

/** Reports the first off-token px on a spacing / radius / type property. */
export function checkPx(prop, value) {
  if (!PX_PROPERTY.test(prop) && !PX_PROPERTY_RADIUS.test(prop)) return [];
  // Border / radius / outline values may mix several lengths, so we keep the
  // whole value; elsewhere token and function calls are removed first so only
  // literal lengths remain. calc() is NOT removed — a literal inside it is
  // still an off-token value.
  const boundary = prop.startsWith("border") || prop.includes("radius") || prop.includes("outline");
  const decl = boundary ? value : value.replace(/var\([^)]*\)/gi, "");
  for (const m of decl.matchAll(/(-?\d*\.?\d+)px/g)) {
    if (parseFloat(m[1]) === 0) continue;
    return [`off-token px on \`${prop}\` — use a token (--space-*, --radius-*, …)`];
  }
  return [];
}

/**
 * Every declaration in CSS text, with the 1-based line the property starts on.
 * A declaration must be delimited by `{` or `;` and end at `;` or `}` — so a
 * selector colon (`a:hover`) is never mistaken for one. Scans the whole text
 * (not per line) so a declaration that wraps across lines is still seen.
 */
export function cssDeclarations(text) {
  const out = [];
  const re = /(?<=;|\{)(\s*)([a-zA-Z][a-zA-Z-]*)\s*:\s*([^;{}]*?)\s*(?=;|\})/g;
  for (const m of text.matchAll(re)) {
    const prop = m[2];
    const value = m[3];
    const line = text.slice(0, m.index + m[1].length).split("\n").length;
    out.push({ prop, value, line });
  }
  return out;
}

/** Every declaration inside a `style={{ … }}` object literal, JSX-cased. */
export function tsxStyleDeclarations(text) {
  const out = [];
  for (const block of text.matchAll(/style=\{\{([\s\S]*?)\}\}/g)) {
    const inner = block[1];
    const start = block.index + block[0].indexOf(inner);
    let offset = 0;
    for (const part of inner.split(",")) {
      const m = part.match(/^\s*([a-zA-Z][a-zA-Z0-9]*)\s*:\s*([\s\S]+?)\s*$/);
      if (m) {
        const at = start + offset + part.indexOf(m[1]);
        out.push({
          prop: KEBAB(m[1]),
          value: m[2],
          line: text.slice(0, at).split("\n").length,
        });
      }
      offset += part.length + 1;
    }
  }
  return out;
}

/**
 * Scan one file's text and return `{ line, message }` problems. `isCss` selects
 * the declaration syntax (CSS vs inline JSX styles); `isKnownToken` decides
 * whether a `var()` name is defined.
 */
export function scanSource(text, { isCss, isKnownToken }) {
  const problems = [];
  // The waiver marker is itself a comment, so it is tested against the original
  // line; every other rule reads the comment-stripped line. stripBlockComments
  // preserves newlines, so the two arrays stay index-aligned.
  const original = text.split("\n");
  const stripped = stripBlockComments(text);
  const push = (line, message) => problems.push({ line, message });

  stripped.split("\n").forEach((raw, i) => {
    if (WAIVER.test(original[i] ?? "")) return;
    const line = isCss ? raw : stripLineComment(raw);
    if (!line.trim()) return;
    for (const message of checkVars(line, isKnownToken)) push(i + 1, message);
    for (const message of checkColor(line)) push(i + 1, message);
  });

  const declarations = isCss ? cssDeclarations(stripped) : tsxStyleDeclarations(stripped);
  for (const { prop, value, line } of declarations) {
    if (WAIVER.test(original[line - 1] ?? "")) continue;
    for (const message of checkPx(prop, value)) push(line, message);
  }
  return problems;
}
