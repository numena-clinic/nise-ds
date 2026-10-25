// Renders the token layers to CSS and JSON. Shared by build.mjs (writes the
// files) and validate.mjs (regenerates the CSS and diffs it against the commit)
// so the "reproducible" claim is checked against the exact same code path.

import { layers, allTokens, themes } from "./index.mjs";

const BANNER = `/* =============================================================================
   Nise Design System — GENERATED FILE, DO NOT EDIT.

   Source:     tokens/*.mjs  (the canonical token source)
   Regenerate: npm run tokens:build
   Checked by: npm run tokens:validate  (references, contrast, reproducibility)

   Three layers, each referencing only the layers below it:
     primitive  raw values      → color, type, spacing, radius, motion
     semantic   interface roles → surface, text, border, action, focus, accent
     component  per-component   → control heights, paddings, font sizes

   Color primitives are generated in OKLCH (tokens/palette.mjs) and emitted as
   deterministic sRGB hex; light and dark are the same semantic roles mapped onto
   different grounds. The token layer is the first thing loaded by the app entry,
   src/styles/globals.css (which Storybook pulls in via .storybook/preview.ts).
   Components never read primitives directly — see docs/tokens.md and docs/theme.md.
   ============================================================================= */`;

const rule = (title) => `/* ── ${title} ${"─".repeat(Math.max(0, 56 - title.length))} */`;

/** Render one group's declarations, at the given indent. */
function renderGroups(groups, indent = "  ") {
  return groups
    .map((group) => {
      const note = group.note ? `\n${indent}/* ${group.note} */` : "";
      const decls = Object.entries(group.tokens)
        .map(([name, value]) => `${indent}${name}: ${value};`)
        .join("\n");
      return `${indent}/* ${group.label} */${note}\n${decls}`;
    })
    .join("\n\n");
}

/** Render the full tokens.css contents: the light base, then each theme. */
export function renderCss() {
  const blocks = layers.map((layer) => {
    const body = renderGroups(layer.groups);
    // `color-scheme` lets the UA adopt native form controls and scrollbars; the
    // light base declares it here, dark re-declares it in its own block.
    const scheme =
      layer.id === "primitive" ? `\n  /* native control/scrollbar scheme */\n  color-scheme: light;\n` : "";
    return `${rule(layer.title)}\n:root {${scheme}\n${body}\n}`;
  });

  const themeBlocks = themes.map((theme) => {
    const body = renderGroups(theme.groups);
    return [
      `${rule(theme.title)}\n[data-theme="${theme.id}"] {\n  color-scheme: ${theme.id};\n\n${body}\n}`,
      `/* the OS preference is the default; an explicit [data-theme] wins */\n@media (prefers-color-scheme: ${theme.id}) {\n  :root:not([data-theme="light"]) {\n    color-scheme: ${theme.id};\n\n${body}\n  }\n}`,
    ].join("\n\n");
  });

  return `${BANNER}\n\n${blocks.join("\n\n")}\n\n${themeBlocks.join("\n\n")}\n`;
}

/** Render tokens.json — the machine-readable form for future consumers. */
export function renderJson() {
  const byLayer = Object.fromEntries(
    layers.map((layer) => [
      layer.id,
      Object.fromEntries(
        layer.groups.flatMap((group) => Object.entries(group.tokens)),
      ),
    ]),
  );
  const byTheme = Object.fromEntries(
    themes.map((theme) => [
      theme.id,
      Object.fromEntries(
        theme.groups.flatMap((group) => Object.entries(group.tokens)),
      ),
    ]),
  );
  return JSON.stringify(
    {
      name: "nise-ds",
      version: 1,
      layers: byLayer,
      themes: byTheme,
      flat: allTokens,
    },
    null,
    2,
  ) + "\n";
}
