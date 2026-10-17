# Decisions

A running record of what Nise settled, what it left provisional, and what it
deliberately did not build — with the reasoning, so the next person can disagree
with the decision rather than guess at it.

## Settled

**D1 — Nise is its own repository and consumes the brand.**
Token and component decisions that the brand leaves open belong here; palette,
typefaces, icon grid and meaning-rules belong to `numena-brand` and are cited,
not re-litigated.

**D2 — Plain CSS custom properties. No Tailwind, no CSS-in-JS.**
Matches the existing house system. Tokens are already CSS variables, so the
runtime and the source agree, and there is no build transform between them.

**D3 — Tokens are authored in `.mjs` and the generated CSS is committed.**
The source is data (`tokens/*.mjs`); `tokens/build.mjs` renders
`src/tokens/tokens.css`. Committing the CSS keeps the system usable without a
build step, and `tokens/validate.mjs` diffs a fresh regeneration against the
commit so it cannot drift. This is the one capability the house system lacked.

**D4 — Three layers with an enforced direction.**
primitive → semantic → component. The validator rejects a primitive that
contains a reference, a semantic token that is not a primitive reference, and a
component token that points upward. Composition over duplication; a change in a
primitive propagates.

**D5 — No status colours.**
The brand states the palette establishes no colours for system statuses
(color.md §4). Nise ships no success/warning/danger tokens. Errors use text, an
icon and a heavier boundary; badges and accents are categorical, never verdicts.

**D6 — Radix for the ARIA-heavy pattern, native HTML elsewhere.**
`Select` is a hard problem (listbox semantics, typeahead, focus, portals) and
uses `@radix-ui/react-select`. `Button` and `TextField` are a native `<button>`
and `<input>`. The dependency is deliberate: adopt a primitive when it removes a
class of accessibility bugs, not by reflex.

**D7 — Storybook is the preview and documentation surface.**
Docs are generated from real component types (`react-docgen-typescript`), so a
prop table cannot drift from the implementation. The a11y addon runs axe per
story. Storybook is dev-only — no runtime cost.

**D8 — Accessibility is verified two ways.**
Contrast is proven analytically in the token validator (resolving
`color-mix` to sRGB); everything else is axe over rendered components, closed
and open. Neither alone is sufficient: axe cannot see layout in jsdom, and the
validator cannot see DOM structure.

**D9 — Radius is declared at the point of use.**
`var(--button-radius, var(--radius-md))` rather than a root `--button-radius`,
so one instance can be re-rounded without a token and the default still comes
from a primitive.

**D10 — The composition is real UI, with synthetic content.**
`InformationReview` proves the pieces compose on the surface a psychologist
actually uses. Content is fake and labelled as such; no clinical logic runs.

## Provisional

**P1 — The type scale, weights and line heights.**
The brand leaves these to the design system and asks for validation in real
layouts (typography.md §3, §8). Sizes are a plain `xs…4xl` ramp; treat them as a
first pass.

**P2 — Spacing, radii, shadows, durations.**
A 4px spacing base, five radii, two shadows, three durations. Reasonable
defaults, not brand mandates.

**P3 — The icon set.**
A seed, not a catalogue: the grid, stroke rule and four sizes are fixed by
iconography.md §3, but the glyph list grows on demand. Empty states and the
reasoning-stage icons (iconography.md §7) are not built yet.

## Deferred

**Visual regression (Playwright / Chromatic).** Assessed and deferred. It needs a
hosted service or a browser matrix and a baseline corpus; neither exists yet,
and the current guarantees (build, axe, token contrast) cover the failure modes
we can actually catch today. Revisit when components are consumed by more than
one surface and a visual baseline is worth maintaining.

**Publishing / monorepo.** `src/index.ts` is the public surface, but the package
is not published and not split per-component. Deferred until there is a second
consumer.

**Theming / dark mode.** The brand is light-only. The icon rules anticipate a
theme (icons follow `currentColor`), and tokens are structured so a second theme
is a second set of semantic values — but no dark theme is built.

**A token gallery / editor and MCP tooling.** `tokens/dist/tokens.json` is the
machine-readable form a future tool would read. Not built.

## Constraints carried in

- Brand colour ratios are reproduced exactly by `npm run tokens:validate`
  (5.27, 10.83, 4.41 …) — a useful cross-check that the pipeline is faithful.
- Licensed fonts are never committed (brand `assets/README.md`).
