# Tokens

Every visual value in Nise comes from a token. There are no raw colours, no
off-scale spacing, and no magic numbers in component code — `npm run
check:usage` fails the build if one appears.

## Three layers

```
primitive   raw values          →   what value?
   ↓
semantic    interface roles     →   what role?
   ↓
component   per-component use   →   where used?
```

- **Primitive** tokens are values with no opinion about use: `--deep-purple`,
  `--purple-600`, `--space-4`, `--radius-md`, `--duration-fast`. Spacing, radii,
  durations and the like are literals authored in `tokens/primitives.mjs`. Colour
  primitives are **generated** — see *The colour model* below.
- **Semantic** tokens are roles: `--color-surface`, `--color-text`,
  `--color-action`, `--color-focus-ring`. A semantic token must reference a
  primitive — never restate a value. Derived colours (a muted text, a border)
  are `color-mix()` of two primitives, so the dependency stays visible.
- **Component** tokens are values a component reads: `--button-height-md`,
  `--input-padding-x`, `--card-gap`. They reference a primitive, a semantic
  token, or a shared `--control-*` slot in their own layer.

`tokens/validate.mjs` enforces the direction: a primitive may not contain a
`var()` or a `color-mix()`; a semantic token may only reference primitives; a
component token may only reference primitives, semantics, or other component
tokens. Anything pointing the wrong way fails. The graph is also proven
**acyclic** (`tokens/graph.mjs`): no token depends on itself, directly or
transitively, so the resolver can never recurse without end.

## Source of truth, and the artifact

The `.mjs` files under `tokens/` are canonical. `npm run tokens:build` renders
them into three artifacts:

| Artifact | Committed? | Why |
| --- | --- | --- |
| `src/tokens/tokens.css` | **yes** | The app and Storybook load it; no build step to run a consumer |
| `tokens/dist/tokens.json` | no (gitignored) | Proprietary machine form for future consumers |
| `tokens/dist/nise.tokens.json` | no (gitignored) | DTCG 2025.10 interchange export (see below) |

Because the CSS is committed, it could drift from the source. `npm run
tokens:validate` regenerates the CSS in memory and diffs it against the commit —
a stale `tokens.css` is a build failure, not a silent inconsistency.

## The DTCG export

`tokens/dist/nise.tokens.json` is the same token set rendered in the Design
Tokens Community Group format, Format Module **2025.10** (a stable Final
Community Group Report). It is a one-way export for tools that speak DTCG — a
tokens studio, an MCP tool surface, a future cross-platform build — and is
deliberately separate from the proprietary `tokens.json`, which is unchanged.

- **Types.** Every literal carries a `$type` and a `$value` in the module's
  shape: `color` as a Color-module object (`colorSpace`/`components`/`alpha`/
  `hex`), `dimension` (px/rem), `duration` (ms), `number`, `fontWeight`,
  `fontFamily`, `cubicBezier`, `shadow`. Aliases are `{group.token}` references
  and inherit their `$type` (§5.2.2).
- **Derived colours.** A `color-mix(...)` has no DTCG value, so it is
  precomputed to a literal colour and its recipe is kept under
  `$extensions["com.numena.nise"].mix`. The maths follows CSS Color 5 §3.5
  (premultiplied alpha) — see `tokens/color.mjs`.
- **What the standard cannot hold.** em/ch dimension values
  (`--letter-spacing-tight`, `--letter-spacing-wide`, `--measure-prose`) have no
  faithful DTCG dimension (only px/rem are defined). They are listed, with their
  original value and unit, under the root extension
  `$extensions["com.numena.nise"].cssOnlyTokens` rather than being faked.
- **Extensions.** Every token also records its original CSS variable name at
  `$extensions["com.numena.nise"].cssVar`, so a consumer can round-trip. A
  generated colour also carries its canonical `oklch` (`{ l, c, h }`) there,
  since the `$value` is sRGB.

The format is versioned by the DTCG, not by Nise: the export targets the last
*stable* module (2025.10). Re-check the spec before adopting a newer draft.


## Adding or changing a token

1. Edit the right layer in `tokens/*.mjs`. Raw value → `primitives.mjs`; a new
   role → `semantic.mjs`; a component value → `component.mjs`.
2. `npm run tokens:build` — this is what writes `src/tokens/tokens.css`.
3. `npm run tokens:validate` — resolves references, checks layer direction and
   the contrast promises.
4. Commit both the source change and the regenerated CSS.

Reference a primitive in the semantic layer with the `ref()` helper; it throws
at author time on a misspelled name, so a typo cannot reach the CSS.

## The colour model

The palette is **modelled, not transcribed**. `tokens/palette.mjs` holds the ten
brand colours as reference anchors plus two pinned dark-ground anchors, and
produces every other colour primitive in one of two ways.

**Generated families** — `neutral`, `purple`, `cyan`, `tangerine` — are walked
through an OKLCH model: a hue, a maximum chroma and a small hue drift over a
fixed lightness ramp. Chroma is clamped into the sRGB gamut by reducing chroma at
constant lightness and hue, so no step is out of gamut and none is a naive RGB
blend.

**Authored families** — `mint`, `citron`, `pink`, `teal` — are pinned to
published candidate values rather than generated, because their candidates are
deliberately uneven per hue: a neon accent and a near-black surface live in one
family, and no single lightness curve fits all four. `authoredScale()`
interpolates the steps between pins in OKLCH; **a pinned step keeps its
published hex verbatim**, to the unit, and `tests/color.test.ts` asserts that a
regeneration cannot move an anchor. These four exist only for the operational
roles described below (decisions.md P4) and are deliberately separate from the
brand accents — tangerine is not warning, cyan is not info.

- **Anchors, not a cage.** The ten brand hex are kept verbatim (`--deep-purple`,
  `--vibrant-purple`, …) and are the reference point for the generated scales.
  The scales are named `--<family>-<step>` (`--purple-600`, `--neutral-950`),
  and every step is itself a primitive, so a role can point at a step as readily
  as at an anchor.
- **OKLCH is canonical; the emitted value is sRGB hex.** Values are *authored*
  in OKLCH and emitted as deterministic hex (`tokens/palette.mjs` keeps the
  OKLCH alongside each hex, and the DTCG export records it). There is no
  `oklch()` in the CSS because the validator, the Theme Explorer and the tests
  all resolve colours from hex, and there is no explicit browser baseline to make
  an `oklch()` fallback sound.

## The colour rules the system keeps

Two rules from the brand are load-bearing:

- **No verdict colours.** "The palette does not establish fixed colors for
  clinical observations, evidence, hypotheses, decisions, or system statuses"
  (color.md §4). A categorical accent is emphasis, never a verdict, and an
  interface error is still text + an icon + a heavier boundary first. The one
  carve-out is recorded as **decisions.md P4**: four *operational* role families
  (mint / citron / pink / teal) exist for machine states only — saved, failed,
  caution, unsaved — never clinical or epistemic meaning. In the light theme
  they read from the deep end of each ramp (mint-700, citron-800, pink-700,
  teal-800) because a neon is not legible on a pale panel; the brightness lives
  in the dark theme, where there is a dark ground to read against. There is no
  `--color-primary` beside `--color-action`; that role already exists.
- **Approved combinations only.** For every foreground/background pair the system
  relies on, `tokens/semantic.mjs` records the pair and its minimum ratio in
  `contrastChecks`, and the validator proves it. The check runs under **every**
  theme (see below); the worst resolved ratios are comfortably above the floors —
  body text ≥ 15:1, muted text ≥ 5.6:1, action text ≥ 5.4:1, link text ≥ 6.3:1,
  the focus ring ≥ 4.0:1, and the strong boundary ≥ 3.9:1.

## Themes

The token source defines a **dark** mapping of the same role names in
`tokens/themes.mjs`; the light contract in `tokens/semantic.mjs` is the base.
`npm run tokens:build` renders the dark overrides into a `[data-theme="dark"]`
block plus a `prefers-color-scheme: dark` fallback (gated so an explicit
`[data-theme="light"]` wins), and `:root { color-scheme: light dark }` is set in
`src/styles/globals.css`. The validator resolves the same contrast promises under
both mappings, so a theme cannot ship a broken pair. See `docs/theme.md`.

Storybook exposes a **Theme** toolbar (Light / Dark / System) in
`.storybook/preview.ts`. It writes the same `data-theme` attribute onto the
preview document root — Light and Dark set it, System removes it (so the OS
preference decides). It reuses this one theme mechanism; there is no second
implementation. Without it the preview simply followed the OS preference, so a
dark host could not show the light theme.

The story canvas already follows the theme: `globals.css` paints `body` with
`--color-surface` / `--color-text`. Storybook's **Docs** view renders each story
in a transparent `.docs-story` block on a page chrome it paints from its own
light palette, so a dark story would sit on a white panel. `.storybook/preview.css`
paints **only** that story block with the theme surface — the surrounding docs
page (heading, arg-types table, code blocks) keeps Storybook's own styling — and
resolves against the same `data-theme`, no second theme. The Storybook UI itself
(sidebar, toolbar) is out of scope.

Storybook's **Foundations → Colour** page reads that same source
(`tokens/palette.mjs`, `tokens/semantic.mjs`, `tokens/themes.mjs`) — it never
keeps a second colour list. The palette is grouped into the ten brand anchors,
the two dark-ground anchors, the four generated scales and the four authored
operational scales; the semantic roles are grouped by meaning (base, surfaces,
actions, fills, operational roles) and follow the preview theme, so the Theme
toolbar drives them and the reference under each role tracks the active
mapping.

## Interaction state tokens

Interactive states are standardized across controls:
- **Surfaces:** `--color-surface` (rest) $\rightarrow$ `--color-surface-hover` (hover) $\rightarrow$ `--color-surface-active` (pressed).
- **Actions:** `--color-action` (rest) $\rightarrow$ `--color-action-hover` (hover) $\rightarrow$ `--color-action-active` (pressed).
- **Boundaries:** `--color-border-strong` (rest) $\rightarrow$ `--color-border-hover` (hover) $\rightarrow$ `--color-focus-ring` (focus).
All hover and active state pairs are verified in `tokens/semantic.mjs` contrast checks.

## Radius is declared at the point of use

There are no `--button-radius` / `--card-radius` tokens. A component writes
`border-radius: var(--button-radius, var(--radius-md))`, so a surface can
re-round one instance without a token, and the default still comes from the
primitive. `check:usage` treats a `var()` that has a fallback as an intentional
override and does not require it to be defined.

## Token names

Primitives are unprefixed and named for the thing (`--deep-purple`,
`--space-4`). Semantic tokens use a `--color-*` role vocabulary
(`--color-action`, `--color-focus-ring`). Component tokens are
`--<component>-<property>` (`--button-height-md`). Size scales use the same
`sm`/`md`/`lg` suffixes everywhere, and `md` is always the default.
