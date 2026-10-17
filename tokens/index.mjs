// The three token layers, assembled in dependency order. Both the build and the
// validator read the system through this module so they cannot disagree.

export { primitiveGroups, primitives } from "./primitives.mjs";
export { semanticGroups, semantic, contrastChecks } from "./semantic.mjs";
export { componentGroups, component } from "./component.mjs";

import { primitiveGroups, primitives } from "./primitives.mjs";
import { semanticGroups, semantic } from "./semantic.mjs";
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

/** Every token name → its declared value, across all layers. */
export const allTokens = { ...primitives, ...semantic, ...component };

/** Which layer each token name belongs to. */
export const layerOf = Object.fromEntries(
  layers.flatMap((layer) =>
    layer.groups.flatMap((group) =>
      Object.keys(group.tokens).map((name) => [name, layer.id]),
    ),
  ),
);
