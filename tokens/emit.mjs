// Renders the token layers to CSS and JSON. Shared by build.mjs (writes the
// files) and validate.mjs (regenerates the CSS and diffs it against the commit)
// so the "reproducible" claim is checked against the exact same code path.

import { layers, allTokens } from "./index.mjs";

const BANNER = `/* =============================================================================
   Nise Design System — GENERATED FILE, DO NOT EDIT.

   Source:     tokens/*.mjs  (the canonical token source)
   Regenerate: npm run tokens:build
   Checked by: npm run tokens:validate  (references, contrast, reproducibility)

   Three layers, each referencing only the layers below it:
     primitive  raw values      → colour, type, spacing, radius, motion
     semantic   interface roles → surface, text, border, action, focus, accent
     component  per-component   → control heights, paddings, font sizes

   The token layer is the first thing loaded by the app entry, src/styles/
   globals.css (which Storybook pulls in via .storybook/preview.ts). Components
   never read primitives directly — see docs/tokens.md.
   ============================================================================= */`;

/** Render the full tokens.css contents. */
export function renderCss() {
  const blocks = layers.map((layer) => {
    const groups = layer.groups
      .map((group) => {
        const note = group.note ? `\n  /* ${group.note} */` : "";
        const decls = Object.entries(group.tokens)
          .map(([name, value]) => `  ${name}: ${value};`)
          .join("\n");
        return `  /* ${group.label} */${note}\n${decls}`;
      })
      .join("\n\n");

    return `/* ── ${layer.title} ${"─".repeat(Math.max(0, 56 - layer.title.length))} */\n:root {\n${groups}\n}`;
  });

  return `${BANNER}\n\n${blocks.join("\n\n")}\n`;
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
  return JSON.stringify(
    {
      name: "nise-ds",
      version: 1,
      layers: byLayer,
      flat: allTokens,
    },
    null,
    2,
  ) + "\n";
}
