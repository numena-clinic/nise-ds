# Decisions

A running record of what Nise settled, what it left provisional, and what it
deliberately did not build — with the reasoning, so the next person can disagree
with the decision rather than guess at it.

## Settled

**D1 — Nise is its own repository and consumes the brand.**
Token and component decisions that the brand leaves open belong here; palette,
typefaces, icon grid and meaning-rules belong to `numena-brand` and are cited,
not re-litigated.

**D2 — Nise components are plain CSS custom properties. No Tailwind, no
CSS-in-JS.** Matches the existing house system. Tokens are already CSS
variables, so the runtime and the source agree, and there is no build transform
between them. This holds for everything under `src/components/` with no
exception. It was briefly qualified when the Theme Explorer's preview vendored
shadcn/ui into the tree (D12); that was reversed and the whole layer removed
(D13).

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
Adopt a primitive when it removes a class of accessibility bugs, not by reflex.
Radix backs the four patterns whose ARIA is genuinely hard: `Select`
(listbox semantics, typeahead, focus, portals), `Slider` (range semantics,
keyboard stepping), `Tabs` (tablist/tabpanel wiring, roving tabindex) and
`Dialog`/`Tooltip` (focus trap, dismissal, portal). Everything else is a native
element: `Button` (`<button>`), `TextField` (`<input>`/`<label>`), `Checkbox`
(`<input type="checkbox">`), `Radio` (`<input type="radio">`), `Switch`
(`<input type="checkbox" role="switch">`) and `Table` (real `<table>` semantics).
The dependency is deliberate: each Radix package is added because it earns its
place, not because a component exists.

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

**D11 — The Theme Explorer reads the token source directly, and promotion is a
separate local step.**
The explorer is a standalone Vite app (`npm run dev`), not a Storybook story or
addon: Storybook documents the components, the explorer bends the tokens they
read, and keeping the two apart means neither can disturb the other. It imports
`tokens/*.mjs` — the same modules the generator uses — so there is no second
token list to drift. It previews by applying overrides as scoped CSS custom
properties on the preview wrapper, never on `:root`. A browser tab cannot write
source: it exports a versioned *candidate*, and `npm run theme:apply`
(dry-run by default, `--write` to apply) makes line-scoped edits, rebuilds and
validates, and rolls back the source *and* the generated CSS if the contrast
promises break. It never commits. Candidate validation is intentionally written
in two places (the explorer for editing feedback, the CLI as a conservative
pre-filter); the authoritative gate is the pipeline (`tokens:build` +
`tokens:validate`) run straight after any write.

**D12 — The Theme Explorer previews against vendored shadcn/ui, themed onto Nise
tokens. Tailwind is scoped to the explorer. — REVERSED by D13.**
Kept for the record. The explorer exists to answer "what does this palette look
like on real components?", and Nise's own components were too thin to be a
credible answer, so a dense shadcn/ui catalogue (forms, tables, overlays, charts)
sourced into `src/components/ui/` and themed through `src/explorer/shadcn.css`.
It was admitted under an explicit exception to D2 and scoped as tightly as the
problem allowed (Tailwind only in the explorer; shadcn's variables aliased onto
Nise tokens; `--nise-*` intermediates for colliding names; radius mapped onto the
token scale; the vendored layer plus the bridge as the only token-boundary
exemptions). It worked, but it bought a second design language and a Tailwind
toolchain to preview one palette. D13 removes it.

**D13 — The explorer previews Nise's own components. shadcn/ui and Tailwind are
removed. (Reverses D12.)**
The preview should show the components an application is actually expected to
ship, not a parallel library. So the preview is built from Nise components alone,
and to make that a fair answer the component set was widened from five to
thirteen: `Checkbox`, `Radio`, `Switch`, `Slider`, `Tabs`, `Tooltip`, `Dialog`
and `Table` join the original five (D6 states which use Radix and which are
native). Every one is plain CSS over tokens, matching D2 without exception.

- **The vendored layer, the Tailwind bridge and the Tailwind toolchain are
  gone.** `src/components/ui/`, `src/hooks/`, `src/lib/utils.ts`,
  `components.json` and `src/explorer/shadcn.css` are deleted; the Tailwind Vite
  plugin and the `@` path alias are removed from `vite.config.explorer.ts`,
  `vitest.config.ts` and `tsconfig.json`; the sixteen dependencies that only
  served shadcn/ui are pruned from `package.json`.
- **The token-boundary exemptions are gone with them.**
  `scripts/check-token-usage.mjs` no longer skips any path. The single greppable
  waiver (`token-boundary: waive`) for the colour-picker's hue spectrum remains —
  it is control chrome, not themeable colour.
- **The catalogue is a Nise catalogue.** `src/explorer/components/Catalogue.tsx`
  renders the same components with plain CSS; `Preview.tsx` scopes
  `portalContainer` onto Radix overlays (Select, Dialog, Tooltip) so their
  portalled content still inherits the preview's experimental custom properties
  instead of escaping to the document root.

The cost is scope: eight new components to design and keep accessible. The
benefit is one design language and no second toolchain, and a preview that is
honest about what ships.

**D14 — Standardized interaction state tokens.**
Interactive states across all controls are structured into three coherent
role progressions:
- Surfaces: `--color-surface` $\rightarrow$ `--color-surface-hover` $\rightarrow$ `--color-surface-active`
- Actions: `--color-action` $\rightarrow$ `--color-action-hover` $\rightarrow$ `--color-action-active`
- Boundaries: `--color-border-strong` $\rightarrow$ `--color-border-hover` $\rightarrow$ `--color-focus-ring`
This replaces ad-hoc mixes and fallback proxies (such as using `--color-text-muted`
for border hover), guarantees mathematical contrast via `tokens/validate.mjs`, and
keeps interactive feedback consistent across Button, Select, TextField, Tabs,
Checkbox, Radio, Switch, Table, and Slider without adding runtime dependencies.

**D15 — A DTCG 2025.10 export, generated alongside the proprietary JSON.**
The token source (`tokens/*.mjs`) remains the single source of truth; `npm run
tokens:build` additionally writes `tokens/dist/nise.tokens.json`, a Design
Tokens Community Group document in the Format Module 2025.10 (a stable Final
Community Group Report). The existing proprietary `tokens/dist/tokens.json` and
all CSS/component/explorer behaviour are unchanged — the export is an isolated
build step (`tokens/dtcg.mjs`), not a replacement, so nothing depends on it.
Colours use the Color Module's `color` object; `color-mix(...)` derivations are
precomputed to literals (via `tokens/color.mjs`) with the recipe kept in a
namespaced `$extensions`. Values the stable modules cannot express (em/ch
dimensions) are recorded under `$extensions["com.numena.nise"].cssOnlyTokens`
rather than approximated. This also entailed a correctness fix: the evaluator
now interpolates `color-mix` with premultiplied alpha (CSS Color 5 §3.5), so
`--color-scrim` resolves to its true `rgba(34, 26, 42, 0.4)` instead of a
spurious `#000000`. Deciding to *emit* DTCG is reversible; the exporter and its
extensions can be deleted without touching the token source.

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

**MCP tooling and multi-theme authoring.** The Theme Explorer (D11) edits the one
light theme; authoring a *second* theme (a dark set of semantic values) and
exposing the token graph to MCP tooling are not built. `tokens/dist/tokens.json`
is the machine-readable form such tooling would read.

## Constraints carried in

- Brand colour ratios are reproduced exactly by `npm run tokens:validate`
  (5.27, 10.83, 4.41 …) — a useful cross-check that the pipeline is faithful.
- Licensed fonts are never committed (brand `assets/README.md`).
