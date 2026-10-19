// Generates the CSS + JSON artifacts from the token source.
//
//   src/tokens/tokens.css        committed — the artifact the app and Storybook load
//   tokens/dist/tokens.json      gitignored — proprietary machine form
//   tokens/dist/nise.tokens.json gitignored — DTCG 2025.10 interchange export
//
// Run with `npm run tokens:build`. Deterministic: same source → same bytes.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderCss, renderJson } from "./emit.mjs";
import { renderDtcg } from "./dtcg.mjs";
import { layers } from "./index.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const cssPath = resolve(root, "src/tokens/tokens.css");
const jsonPath = resolve(root, "tokens/dist/tokens.json");
const dtcgPath = resolve(root, "tokens/dist/nise.tokens.json");

mkdirSync(dirname(cssPath), { recursive: true });
mkdirSync(dirname(jsonPath), { recursive: true });

writeFileSync(cssPath, renderCss());
writeFileSync(jsonPath, renderJson());
writeFileSync(dtcgPath, renderDtcg());

const count = layers.reduce(
  (n, layer) => n + layer.groups.reduce((m, g) => m + Object.keys(g.tokens).length, 0),
  0,
);

console.log(`tokens:build — wrote ${count} tokens`);
console.log(`  · src/tokens/tokens.css`);
console.log(`  · tokens/dist/tokens.json`);
console.log(`  · tokens/dist/nise.tokens.json (DTCG 2025.10)`);
