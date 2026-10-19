// ─────────────────────────────────────────────────────────────────────────────
// The token reference graph, as a pure module.
//
// `tokens/validate.mjs` proves the graph is well-formed: every reference resolves
// and points down the layers. This module adds the remaining proof — that it is
// ACYCLIC. References only ever point down the layers, so a cycle can only live
// inside the component layer, but it must still be proven absent: a cycle would
// make `expand()` recurse without end and silently corrupt any value built from
// it.
//
// Pure and side-effect free, so it is unit-tested (tests/graph.test.ts) without
// touching the filesystem or exiting the process.
// ─────────────────────────────────────────────────────────────────────────────

/** Every `var(--x)` name referenced by a token value, in order of appearance. */
export function refsOf(value) {
  return [...String(value).matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)\s*\)/g)].map((m) => m[1]);
}

/**
 * Find every circular reference in a `name → value` token map. Returns one path
 * per distinct cycle, e.g. `["--a", "--b", "--a"]`. References to names that are
 * not in the map are ignored here — a dangling reference is a different failure,
 * reported by the validator's resolution pass.
 */
export function findCycles(tokenMap) {
  const WHITE = 0;
  const GREY = 1;
  const BLACK = 2;
  const state = new Map();
  const stack = [];
  const cycles = [];
  const seen = new Set();

  const visit = (name) => {
    const s = state.get(name) ?? WHITE;
    if (s === BLACK) return;
    if (s === GREY) {
      const cycle = [...stack.slice(stack.indexOf(name)), name];
      const key = [...cycle].sort().join("\u0000");
      if (!seen.has(key)) {
        seen.add(key);
        cycles.push(cycle);
      }
      return;
    }
    state.set(name, GREY);
    stack.push(name);
    for (const ref of refsOf(tokenMap[name] ?? "")) {
      if (ref in tokenMap) visit(ref);
    }
    stack.pop();
    state.set(name, BLACK);
  };

  for (const name of Object.keys(tokenMap)) visit(name);
  return cycles;
}
