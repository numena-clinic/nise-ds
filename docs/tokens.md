# Tokens

Every visual value in Nise comes from a token. There are no raw colours, no
off-scale spacing, and no magic numbers in component code — `npm run
check:usage` fails the build if one appears.

## Four layers

```
primitive   raw values          →   what value?
   ↓
semantic    interface roles     →   what role?
   ↓
themes      the same roles, re-pointed onto another ground
   ↓
component   per-component use   →   where used?
```

- **Primitive** tokens are values with no opinion about use: `--deep-purple`,
  `--purple-600`, `--space-4`, `--radius-md`, `--duration-fast`. Spacing, radii,
  durations and the like are literals authored in `tokens/primitives.mjs`. Colour
  primitives are **generated** — see *The colour model* below.
- **Semantic** tokens are roles: `--color-base-100`, `--color-base-content`,
  `--color-primary`, `--color-focus-ring`. A semantic token must reference a
  primitive — never restate a value. Derived colours (a muted text, a border)
  are `color-mix()` of two primitives, so the dependency stays visible.
- **Themes** are not a second token set. `tokens/themes.mjs` re-points the *same*
  role names onto another ground, so dark is a mapping of light rather than a
  parallel vocabulary. The light mapping is the base `:root`; dark renders as
  `[data-theme="dark"]` overrides.
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

**Authored families** — `mint`, `citron`, `pink`, `blue` — are pinned to
published candidate values rather than generated, because their candidates are
deliberately uneven per hue: a neon accent and a near-black surface live in one
family, and no single lightness curve fits all four. `authoredScale()`
interpolates the steps between pins in OKLCH; **a pinned step keeps its
published hex verbatim**, to the unit, and `tests/color.test.ts` asserts that a
regeneration cannot move an anchor. These four back the status roles and are
deliberately separate from the brand accents — tangerine is not warning, cyan is
not info.

**A family must not impersonate another role.** The four status families are
told apart by hue, but hue alone is not the test: a status fill and a button
fill have to be *different colours*, not differently-named ones. The info
family was once a cyan, and the dark secondary fill **is** the brand's cyan —
so in the dark theme an info badge and a secondary button painted the same
colour (ΔE2000 1.9), and in the light theme they were close enough to
misread (ΔE2000 8.9). The info family is therefore a true blue
(`tokens/palette.mjs`, D21), and the validator now proves the separation:
every fill and status role must sit at least ΔE2000 10 from every other, in
**both** themes. The dark secondary has since moved off the cyan altogether
onto `--purple-300` (D22), so the brand's cyan is a tint and an anchor rather
than a role.

**The palette is small on purpose.** A consumer does not browse a twelve-step
scale; it reads a role that points at one step. `scaleSteps` in
`tokens/palette.mjs` is the authoritative list of the steps each family
*surfaces*, and it is exactly what the semantic and theme layers reference. The
neutral ramp surfaces nine steps, purple ten, cyan and tangerine two each, and
the four authored families three each. Add a step only when a role needs it —
`tests/color.test.ts` asserts that every surfaced step is referenced and that no
family carries a step nothing reads.

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

These are the rules a change must satisfy. Rules 1–4 are the brand rules from
`numena-brand color.md §4`; rules 5–9 are what the token layer and
`npm run check:usage` mechanically enforce. Together they are the reason the
system is safe to bend in the Theme Explorer and safe to ship.

1. **Brand artwork may use the fixed brand colours.** Kaleidoscopic artwork,
   illustrations and marketing surfaces draw on the ten anchors directly. They
   are the brand, not interface colours.
2. **Product components use semantic roles — never a raw hex and never a
   primitive scale reference.** A component names `--color-*` (or a component
   token). `npm run check:usage` fails a hardcoded colour *and* a direct
   `var(--neutral-400)`-style primitive reference anywhere under `src/` outside
   the generated layer and the Theme Explorer (which render the primitives by
   design). The one labelled waiver is `token-boundary: waive`, for a
   colour-picker's own spectrum.
3. **Every role has one documented purpose.** The semantic layer in
   `tokens/semantic.mjs` is a contract of role names; each is declared once and
   mapped, not re-invented per component.
4. **A brand colour does not imply interface meaning.** Tangerine is not
   warning, cyan is not info, and a vivid anchor is not promoted to a role just
   because it exists. The status roles are declared explicitly rather than
   inherited from an accent; see "Status colours" below and decisions.md D20.
5. **Foreground and background are validated together, never separately.** A
   pair the UI relies on is recorded in `contrastChecks` and the validator
   proves it under every theme.
6. **Colour is never the only carrier of meaning.** An error is text + an icon
   + a heavier boundary first, colour last (color.md §4).
7. **Both themes are first-class.** Every role is mapped in light and dark, and
   the validator proves the same promises against both. Dark is a re-pointing of
   the same role names, never a second token set.
8. **New colours or scales need a demonstrated product need**, recorded in
   decisions.md — not palette completeness. A new step in an existing ramp needs
   a role that reads it.
9. **When a role already exists, reuse it.** There is one name per role, not a
   Nise name and a daisyUI name for the same thing; component-specific tokens
   are added only when a semantic role cannot express the behaviour.

### The two brand rules in detail

Two rules from the brand are load-bearing:

- **A status colour is a first-class role, and still never the only signal.**
  `--color-success`, `--color-warning`, `--color-error` and `--color-info` (each
  with a `-content`) are part of the ordinary vocabulary, not a carve-out. What
  survives from the brand's rule is the part that was never about colour: a
  categorical accent is emphasis, never a verdict, and an interface error is
  still text + an icon + a heavier boundary first, colour last. The three
  categorical tints (`--color-tint-purple/cyan/tangerine`) remain emphasis.
  The status families are separate from the brand accents by construction —
  tangerine is not warning and cyan is not info — and the light theme sources
  each status accent from the deep end of its ramp (mint-700, citron-800,
  pink-700, blue-700) because a neon is not legible on a pale panel; the
  brightness lives in the dark theme, where there is a dark ground to read
  against.
- **Approved combinations only.** For every foreground/background pair the system
  relies on, `tokens/semantic.mjs` records the pair and its minimum ratio in
  `contrastChecks`, and the validator proves it. The check runs under **every**
  theme (see below); the worst resolved ratio for each promise across both
  themes is comfortably above the floor — body text ≥ 16.8:1, muted text
  ≥ 5.6:1, link text ≥ 6.3:1, primary text on the primary fill ≥ 5.4:1,
  secondary text on the page ≥ 5.2:1, text on the accent fill ≥ 6.2:1, status
  text on the page ≥ 4.8:1, tint text ≥ 11.3:1, the focus ring ≥ 4.0:1, and the
  strong boundary ≥ 3.7:1.

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
`--color-base-100` / `--color-base-content`. Storybook's **Docs** view renders
each story in a transparent `.docs-story` block on a page chrome it paints from
its own light palette, so a dark story would sit on a white panel.
`.storybook/preview.css` paints **only** that story block with the theme surface
— the surrounding docs page (heading, arg-types table, code blocks) keeps
Storybook's own styling — and resolves against the same `data-theme`, no second
theme. The Storybook UI itself (sidebar, toolbar) is out of scope.

Storybook's **Foundations → Colour** page reads that same source
(`tokens/palette.mjs`, `tokens/semantic.mjs`, `tokens/themes.mjs`) — it never
keeps a second colour list. The palette is grouped into the ten brand anchors,
the two dark-ground anchors, the four generated scales and the four authored
status scales; the semantic roles are grouped by meaning (base, emphasis,
status, supporting, tints) and follow the preview theme, so the Theme toolbar
drives them and the reference under each role tracks the active mapping.

## Interaction state tokens

Interactive states are standardized across controls:
- **Surfaces:** `--color-base-100` (rest) $\rightarrow$ `--color-base-hover` (hover) $\rightarrow$ `--color-base-active` (pressed).
- **Actions:** `--color-primary` (rest) $\rightarrow$ `--color-primary-hover` (hover) $\rightarrow$ `--color-primary-active` (pressed).
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
(`--color-base-100`, `--color-primary`, `--color-focus-ring`). Component tokens
are `--<component>-<property>` (`--button-height-md`). Size scales use the same
`sm`/`md`/`lg` suffixes everywhere, and `md` is always the default.

## The colour role vocabulary

One name per role (D20). There are no aliases: a second spelling for a role is
duplication, so the old Nise names (`--color-surface*`, `--color-text`,
`--color-action*`) are gone rather than deprecated. This is the complete list.

| Group | Roles |
| --- | --- |
| **Surfaces** | `--color-base-100` (page) · `--color-base-200` (raised) · `--color-base-300` (panel) · `--color-base-content` (text on them) |
| **Surface states** | `--color-base-hover` · `--color-base-active` |
| **Fills** | `--color-primary` · `--color-secondary` · `--color-accent` · `--color-neutral` |
| **Fill content** | `--color-primary-content` · `--color-secondary-content` · `--color-accent-content` · `--color-neutral-content` |
| **Action states** | `--color-primary-hover` · `--color-primary-active` |
| **Action edge** | `--color-primary-edge` (the primary fill's own darker rim) |
| **Status** | `--color-success` · `--color-warning` · `--color-error` · `--color-info` |
| **Status content** | `--color-success-content` · `--color-warning-content` · `--color-error-content` · `--color-info-content` |
| **Text** | `--color-text-muted` |
| **Boundaries** | `--color-border` · `--color-border-strong` · `--color-border-hover` · `--color-border-error` |
| **Focus & overlay** | `--color-focus-ring` · `--color-scrim` |
| **Selection** | `--color-selected-surface` · `--color-selected-text` |
| **Links** | `--color-link` · `--color-link-hover` |
| **Tints** | `--color-tint-purple` · `--color-tint-cyan` · `--color-tint-tangerine` |

Two rules bind the groups together:

- **A status role reports a machine state, never a clinical judgement.** The
  four status families are first-class vocabulary, but colour is never the only
  signal: an error is text + an icon + a heavier boundary first, colour last
  (brand `color.md §4`).
- **A categorical accent is emphasis, not a verdict.** The tints say "look
  here"; they never say "good" or "bad".

### Which roles read the brand anchors

Since D22 the emphasis roles and the base surfaces read the brand's own
published colours rather than a second copy of them (decisions.md D22):

| Role | Light | Dark |
| --- | --- | --- |
| `--color-base-100` (page) | `--white` | `--dark-ground` |
| `--color-base-200` (raised) | `--neutral-50` | `--ink-plum` |
| `--color-base-300` (panel) | `--pale-lavender` | `--dark-panel` |
| `--color-base-content` (text) | `--ink-plum` | `--neutral-50` |
| `--color-primary` | `--deep-purple` | `--purple-500` |
| `--color-secondary` | `--vibrant-purple` | `--purple-300` |
| `--color-accent` | `--vibrant-tangerine` | `--vibrant-tangerine` |

Two consequences a consumer has to know:

- **`--color-accent` is a fill-only role.** #F57A44 as text on a light ground
  is 2.71:1. Use it as a fill with `--color-accent-content` on it, or use
  `--color-tint-tangerine` for a pale wash. A component that needs tangerine as
  a *text* colour wants a status role, not the accent.
- **The brand's cyan is not a role.** `--vibrant-cyan` is an anchor and a tint
  (`--color-tint-cyan`); it no longer carries a theme-facing emphasis role.
