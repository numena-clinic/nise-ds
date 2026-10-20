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

**D16 — The guards were hardened after an audit.**
An audit of the verification surface found that two guards were narrower than
they claimed. `scripts/check-token-usage.mjs` stripped `/* */` comments one line
at a time, so a colour inside a multi-line comment or a trailing `//` comment was
a false positive; and it only tested a line that was *entirely* one `prop: value`,
so an inline one-liner (`.x { padding: 13px; }`), a declaration split across
lines, a JSX `style={{ padding: "13px" }}`, and any literal `px` inside `calc()`
were false negatives. The `calc()` gap was not theoretical: it hid a real
off-token `40px` in `Radio.css`/`Switch.css` where every sibling used
`var(--control-height-md)`. The scanner is now a pure, unit-tested module
(`scripts/lib/token-usage.mjs`, `tests/usage.test.ts`) that strips block comments
across lines, drops trailing `//` comments, and reads *declarations* — CSS
`prop: value` and JSX `style={{ }}` (camelCase→kebab) — rather than lines.
Separately, `tokens/validate.mjs` proved references resolve and point down the
layers but never that the graph was acyclic, and a cycle would make the resolver
recurse without end; `tokens/graph.mjs` now proves acyclicity
(`tests/graph.test.ts`) and the validator fails on any cycle. No token value
changed and `tokens/tokens.css` is byte-identical. Behaviour and axe tests were
added for the eight components that had none (Checkbox, Radio, Switch, Tabs,
Slider, Dialog, Tooltip, Table), so all thirteen are now covered both ways.

**D17 — Node's type definitions are declared, so the type check is self-contained.**
`tests/promote.test.ts` imports `node:fs`/`node:path` and uses `process`, but
`@types/node` was never a declared dependency — it resolved only from an ancestor
`node_modules` on the author's machine, so `npm run typecheck` passed locally while
a clean checkout (CI) failed with `TS2307` for `node:fs`/`node:path` and `TS2591`
for `process`. Node's types are now declared explicitly: `@types/node` (v22, the
runtime CI pins) is a devDependency, and `tsconfig.json` lists `"node"` in
`types`. The gate is unchanged and no check is disabled — the type check simply no
longer depends on an ancestor directory that CI does not have.

**D18 — The palette is generated in OKLCH; the brand hex are anchors, not the palette.**
The original ten brand colours were a flat list with no ramp between them, so a
tint, a border, a hover or a dark surface had to be approximated with
`color-mix()` on two anchors. The palette is now a small OKLCH model
(`tokens/palette.mjs`): the ten brand hex are kept as named **anchors** (identity
preserved, exact hex and provenance retained), and around them the system
generates a neutral ramp plus purple/cyan/tangerine scales — a fixed lightness
ladder, a family chroma envelope, a slight hue shift, and gamut mapping by
binary-search chroma reduction to sRGB. Primitives are no longer hand-authored
in `primitives.mjs`; its colour group re-exports the generated `colorTokens`.
This trades "the palette is exactly ten literals" for a real ramp, which the
brand brief invites (color.md §2 is a starting point) and which the semantic and
component layers need. The semantic layer keeps the *same role names*; the
component layer is untouched. Values are authored in OKLCH but **emitted as sRGB
hex**: there is no explicit browserslist, so the `oklch()`-with-hex-fallback
idiom is unsound (the fallback wins in the engines the fallback is meant to
serve), and the validator, explorer and tests all resolve hex/rgb. OKLCH is kept
in `colorMeta` and the DTCG export so the model is visible without shipping a
possibly-unsupported `oklch()`.

**D19 — Light and dark are two mappings of one contract; dark lives in `tokens/themes.mjs`.**
Dark is not an inversion of light and not a second token set: it re-points the
*same* semantic role names (surfaces step down the neutral ramp, text steps up,
the action brightens so a near-black text reads on it, the focus ring lightens,
the accent surfaces brighten to carry dark text). It lives in its own source file
so each role name appears once per file — `scripts/lib/promote.mjs` edits tokens
by name+line, and two occurrences of `--color-surface` in one file make a
retarget ambiguous. `npm run tokens:build` emits a `[data-theme="dark"]` block
and a `prefers-color-scheme` fallback (gated so `[data-theme="light"]` wins);
`npm run tokens:validate` proves the same `contrastChecks` under both mappings.
The promotion workflow stays paused for themes: a candidate carries no theme id,
so dark is changed in the source.

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

**P4 — Operational colour roles (success / warning / error / info).**
color.md §4 and D5 still govern: the palette establishes no status colours,
accents are categorical and never a verdict, and an error is text + an icon + a
heavier boundary. This entry records a **user-directed, provisional override** so
the decision is visible rather than implied by code.

What it adds:

- Four **authored** ramps — mint (success), citron (warning), pink (error),
  teal (info) — pinned to published candidate values in `tokens/palette.mjs`
  (`functionalFamilies`) instead of generated from the shared lightness curve.
  They are authored because the candidates are deliberately uneven per hue: a
  neon accent and a near-black surface in one family, and no single lightness
  curve fits all four. A pinned step keeps its published hex **verbatim**;
  `tests/color.test.ts` asserts that, to the unit.
- Twelve semantic roles (three per family: `-surface`, the accent, `-content`),
  mapped independently per theme, plus `--color-border-error` re-pointed from
  neutral to the pink family. Its four consumers (TextField, Select, the two
  explorer call sites) are unchanged — only the value moved.
- Two pinned foundation values for the dark ground (`--dark-ground` #17121D,
  `--dark-panel` #2D2238) with the brand ink-plum as the raised step between
  them. The dark **page** moves from neutral-950 to `--dark-ground`. This was
  not optional: at L .43 the neutral-800 panel leaves pink-500 at 2.86:1, so no
  saturated accent could clear 4.5:1 on the strongest dark panel. The tight
  0.04-L ladder is what makes the operational roles legible in dark, and it
  improves every other dark ratio.

What keeps the brand rule intact:

1. **Operational states only** — saved, failed, caution, unsaved. Never clinical
   or epistemic meaning.
2. **Separate families.** Tangerine is not warning, cyan is not info. Teal is
   pushed a few degrees bluer than `--vibrant-cyan` so the two never collide;
   the brand cyan keeps its own anchor and its own uses.
3. **The light theme takes its accents from the deep end of each ramp.** A neon
   is not legible on a pale panel — mint-500 is 1.6:1 on white, citron-600 is
   3.83:1 with white content — so light sources mint/pink at 700 and
   citron/teal at 800 (measured per hue, never one step for all four), and the
   brightness lives in the dark theme where it has a dark ground to read
   against. Same reasoning as `--color-text-accent-tangerine`.

What it deliberately does **not** add: a lavender ramp (pale-lavender plus the
low-chroma neutral ramp already cover that ground, and a third near-identical
ramp fails D5's own test); a separate `--color-primary`/`-content` (that is
`--color-action`/`--color-action-text`, and one value under two names is the
redundancy D5 exists to prevent); border roles for the three non-error families
(nothing consumes them).

If P4 is vetoed, remove `functionalFamilies` and `groundAnchors` from
`tokens/palette.mjs`, the `functional`/`functionalDark` groups and their
`contrastChecks`, and the operational-roles group from the Foundations story.
Nothing in the component layer depends on them.

## Deferred

**Visual regression (Playwright / Chromatic).** Assessed and deferred. It needs a
hosted service or a browser matrix and a baseline corpus; neither exists yet,
and the current guarantees (build, axe, token contrast) cover the failure modes
we can actually catch today. Revisit when components are consumed by more than
one surface and a visual baseline is worth maintaining.

**Publishing / monorepo.** `src/index.ts` is the public surface, but the package
is not published and not split per-component. Deferred until there is a second
consumer.

**Theming breadth.** Light and dark are both built (D19, P4). A third theme —
a different brand, or a high-contrast variant — is not, and the promotion
workflow still carries no theme id, so theme values change in the source.

**MCP tooling and multi-theme authoring.** The Theme Explorer (D11) edits the
light theme and *displays* dark; authoring a candidate that targets a theme, and
exposing the token graph to MCP tooling, are not built.
`tokens/dist/tokens.json` is the machine-readable form such tooling would read.

## Constraints carried in

- Brand colour ratios are reproduced exactly by `npm run tokens:validate`
  (5.27, 10.83, 4.41 …) — a useful cross-check that the pipeline is faithful.
- Licensed fonts are never committed (brand `assets/README.md`).
