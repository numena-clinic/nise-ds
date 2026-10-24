// The token system, assembled in dependency order. Both the build and the
// validator read it through this module so they cannot disagree.
//
// The documented chain is four layers: primitive → semantic → themes → component.
// A theme is not a second token set — it re-points the SAME role names onto
// another ground — so `layers` below holds the three layers that declare tokens,
// and `themes` below holds the fourth, which only remaps.

export { primitiveGroups, primitives } from "./primitives.mjs";
export { semanticGroups, semantic, contrastChecks } from "./semantic.mjs";
export { darkGroups, semanticDark, themeOverrides } from "./themes.mjs";
export { componentGroups, component } from "./component.mjs";

import { primitiveGroups, primitives } from "./primitives.mjs";
import { semanticGroups, semantic } from "./semantic.mjs";
import { darkGroups } from "./themes.mjs";
import { componentGroups, component } from "./component.mjs";

/**
 * The layers, in order, with the metadata the two consumers need:
 * - `allow`: which lower layers a token in this layer may reference
 * - `groups`: the ordered token groups to render
 * @type {{ id: string, title: string, allow: string[], groups: import("./primitives.mjs").Group[] }[]}
 */
export const layers = [
  {
    id: "primitive",
    title: "Primitive layer",
    allow: [],
    groups: primitiveGroups,
  },
  {
    id: "semantic",
    title: "Semantic layer",
    allow: ["primitive"],
    groups: semanticGroups,
  },
  {
    id: "component",
    title: "Component layer",
    // Component tokens may also reference the shared `--control-*` slots in
    // their own layer, but never anything above them.
    allow: ["primitive", "semantic", "component"],
    groups: componentGroups,
  },
];

/** Every token name → its declared value, across all layers (the light base). */
export const allTokens = { ...primitives, ...semantic, ...component };

/**
 * The theme layer: the same set of role names mapped onto another ground. This
 * is the fourth layer of the chain primitive → semantic → themes → component.
 * The light mapping is the base `:root`, so it is not listed here.
 * `npm run tokens:build` renders these into `[data-theme="<id>"]` blocks with a
 * `prefers-color-scheme` fallback.
 * @type {{ id: string, title: string, groups: import("./primitives.mjs").Group[] }[]}
 */
export const themes = [{ id: "dark", title: "Dark theme", groups: darkGroups }];

/** Which layer each token name belongs to. */
export const layerOf = Object.fromEntries(
  layers.flatMap((layer) =>
    layer.groups.flatMap((group) =>
      Object.keys(group.tokens).map((name) => [name, layer.id]),
    ),
  ),
);
