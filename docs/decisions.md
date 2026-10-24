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

**D4 — Four layers with an enforced direction.**
primitive → semantic → themes → component. The validator rejects a primitive that
contains a reference, a semantic token that is not a primitive reference, and a
component token that points upward. Themes are not a second token set: they
re-point the *same* semantic role names onto another ground, so the direction
primitive → semantic → component still holds and there is only one vocabulary to
learn. Composition over duplication; a change in a primitive propagates.

**D5 — Status colours are a first-class part of the vocabulary (formerly "No status colours").**
*(Superseded by D20.)* Originally, Nise shipped no status tokens based on brand
color.md §4 (errors used text, an icon and a heavier boundary). D20 superseded
this restriction, establishing `--color-success`, `--color-warning`,
`--color-error`, and `--color-info` as first-class roles. What survives from the
original rule: colour is never the sole indicator of state, and categorical
accents are never verdicts.

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
- Surfaces: `--color-base-100` $\rightarrow$ `--color-base-hover` $\rightarrow$ `--color-base-active`
- Actions: `--color-primary` $\rightarrow$ `--color-primary-hover` $\rightarrow$ `--color-primary-active`
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
by name+line, and two occurrences of `--color-base-100` in one file make a
retarget ambiguous. `npm run tokens:build` emits a `[data-theme="dark"]` block
and a `prefers-color-scheme` fallback (gated so `[data-theme="light"]` wins);
`npm run tokens:validate` proves the same `contrastChecks` under both mappings.
The promotion workflow stays paused for themes: a candidate carries no theme id,
so dark is changed in the source.

**D20 — The colour vocabulary is daisyUI-shaped: one role set, one name per role,
and a small palette that surfaces only the steps a role reads.**
The semantic layer had accumulated two vocabularies at once — a Nise one
(`--color-surface`, `--color-text`, `--color-action`, `--color-tint-text`, six
`--color-accent-<family>-{surface,text}` pairs) and a daisyUI-shaped one it was
trying to grow into. A component that wanted "the page" had to know whether the
system called it `surface` or `base-100`; a component that wanted "the primary
action" had to know whether it was `action` or `primary`. Two spellings for one
role is duplication, which is what D5 exists to prevent.

The vocabulary is now one set of roles, named the way daisyUI names them, because
the names are a *shared* language and a second private dialect is a permanent
tax on every new component and every new consumer:

| Meaning | Role |
| --- | --- |
| The surface ladder | `--color-base-100` (page) → `--color-base-200` (raised) → `--color-base-300` (panel) |
| Text on the ladder | `--color-base-content` |
| Surface states | `--color-base-hover`, `--color-base-active` |
| Fills | `--color-primary`, `--color-secondary`, `--color-accent`, `--color-neutral`, each with `-content` |
| Action states | `--color-primary-hover`, `--color-primary-active` |
| Machine states | `--color-success`, `--color-warning`, `--color-error`, `--color-info`, each with `-content` |
| Supporting | `--color-text-muted`, `--color-border{,-strong,-hover,-error}`, `--color-focus-ring`, `--color-scrim`, `--color-selected-{surface,text}`, `--color-link{,-hover}`, `--color-tint-{purple,cyan,tangerine}` |

Consequences, all deliberate:

- **No compatibility aliases.** The old names are gone, not deprecated. An alias
  would leave two names for one role — the exact duplication this decision
  removes — and would let the vocabulary drift back.
- **Status colours are now first-class (superseding D5 and P4).** The four
  status families carry two roles each — the accent and the content on it — and
  they are a normal part of the vocabulary, not a carve-out with a footnote.
  What survives from the old rule is the part that was never about colour: an
  error is still text + an icon + a heavier boundary first, colour last, and the
  three categorical tints remain emphasis rather than verdicts.
- **The palette is small on purpose.** `scaleSteps` in `tokens/palette.mjs` is
  the authoritative list of steps each family surfaces — ten for neutral, ten
  for purple, three each for cyan, tangerine, mint, citron, pink and blue. A
  consumer does not browse a twelve-step scale; it reads a role that points at
  one step. Every surfaced step is referenced by a role and
  `tests/color.test.ts` asserts both directions, so a ramp cannot grow an
  orphan and a role cannot point at a step that does not exist.
- **The dark ground stays pinned.** `--dark-ground` and `--dark-panel` remain
  published values rather than curve steps, because the dark base ladder has to
  stay near its ground or a card reads as a hole, and because the tight ladder
  is what lets a saturated accent clear 4.5:1 on the strongest dark panel.

The cost is a breaking rename across the component layer, the explorer and the
tests. That is cheaper than the alternative — every future component and every
future consumer paying for two dialects — and it is paid once, now, while the
system is thirteen components old.

**D21 — The info family is a true blue, and every fill must be separable from
every other in both themes.**
The status families were told apart by hue, and the hue test was the only test.
That was not enough. The info family was a cyan, and the dark secondary fill
**is** the brand's cyan (`--vibrant-cyan`, one of the ten published anchors) —
so the two roles collided on the same colour, and no contrast ratio could see
it, because each colour was perfectly legible on its own ground. Measured with
CIEDE2000: the dark theme put `--color-info` (#45E8FF) at **ΔE 1.9** from
`--color-secondary` (#25E4F8) — the same colour to the eye — and the light
theme put them at ΔE 8.9, below a just-noticeable difference. An info badge
and a secondary button were not two colours that happened to be close; they
were one colour with two names. P4 accepted this, reasoning that "the roles
and the form keep them distinct, not the hue" — but the form of a badge and
the form of a button is the same form, which is exactly why the collision
mattered.

The fix is a new authored family, `blue`, that cannot impersonate any other
role, with the info role re-pointed at it:

- `blue` pins `50 #F0F8FF`, `200 #C6E4FF`, `500 #80C5FF`, `700 #2B75B9`,
  `900 #143B69`, `950 #0C2345`; the family surfaces `500`, `700` and `950`.
- Light: `--color-info` → `blue-700`, content white (4.83:1).
- Dark: `--color-info` → `blue-500`, content → `blue-950` (8.46:1).
- The role name is unchanged (`--color-info`); only the family behind it moved,
  so no component or consumer renames again.

The second half of the decision is the guard, and it is the part that matters
more than the hexes. A system that lets two roles share a colour will do it
again, so the rule is now machine-checked rather than eyeballed:

- `tokens/validate.mjs` proves that every fill and status role sits at least
  **ΔE2000 10** from every other, in **both** themes, and reports the closest
  pair per theme. Measured: light's closest pair is secondary/success at 17.3,
  dark's is secondary/info at 17.8.
- `tests/color.test.ts` asserts the same thing, and pins the metric itself to
  the 34 published CIEDE2000 reference values (Sharma, Wu & Dalal 2005) — an
  implementation that mishandles the hue term reports two different colours as
  identical, and the guard would wave that through.
- ΔE2000, not plain Lab ΔE: Lab under-weights hue differences between two
  saturated colours at similar lightness, which is the exact shape of the
  collision it has to catch.

Why 10: below roughly a just-noticeable difference, two saturated colours read
as one colour on screen, so 10 is the floor with room to spare — the shipped
palette sits at 17.3 and 17.8, and the old pair, at 1.9 and 8.9, would have
failed it in both themes.

Why a family and not a re-pointed step: `teal-500` and `--vibrant-cyan` are
both published-ish values whose gap is a hue-order fact about two neons. A blue
family is a hue the palette does not otherwise use, so the information role
cannot collide with the brand secondary by construction — the separation is a
property of the palette, not of a chosen step.

This supersedes the separation claim in P4 §1, and amends D20's "tangerine is
not warning, cyan is not info" — that rule is right about *hue* and was never
a guarantee of *distinctness*, which is what D21 adds. The brand's own
position is unchanged and consistent: `color.md` §4 says the palette does not
establish fixed colours for system statuses and requires a separate design
decision plus validation for each — D20 and D21 are that decision, and the
validator is that validation.

**D22 — The base surfaces and the emphasis roles read the brand's own anchors.**
A brief asked for the semantic roles to carry the brand's published values
directly: a `#FFFFFF` page, a `#221A2A` body text, a `#8E36F4` secondary and a
`#F57A44` accent. Each candidate was measured against the floors in D20 and D21
before it was adopted, and one was rejected.

What changed:

- **Light page and body text.** `--color-base-100` → `--white` (#FFFFFF) and
  `--color-base-content` → `--ink-plum` (#221A2A, 16.81:1 on the page). Before
  this the page was `--neutral-0` and the body text `--neutral-950` — the same
  two colours as the brand's anchors, but reached through a second, editable
  copy of the ramp. That is a duplicate source of truth for a value the brand
  already publishes, and it made the page and the text two tokens that could
  drift apart. `--neutral-0` is gone; `--neutral-100`…`950` remain.
- **Light secondary.** `--color-secondary` → `--vibrant-purple` (#8E36F4) with
  white content (5.27:1), replacing the old cyan. The brand's own secondary
  violet now carries the role, which is the whole point of the brief.
- **Light accent.** `--color-accent` → `--vibrant-tangerine` (#F57A44) with
  `--ink-plum` content (6.20:1), replacing the old burnt orange. **The accent is
  a fill-only role.** #F57A44 as body text on a light ground is 2.71:1, so it
  may only be used as a fill (with `--color-accent-content` on it) or through
  `--color-tint-tangerine` for a pale wash. A component that needs tangerine as
  a text colour has to reach for the status roles, not the accent.
- **Dark secondary.** `--color-secondary` → `--purple-300` (#d6bfff) with
  `--neutral-950` content (9.99:1 on the fill, 11.18:1 as text on the dark
  ground). The brand's #8E36F4 does not work here: as a fill it needs dark text
  (white on it is 5.27:1, but the dark ground wants 4.5:1 of *ink* on it), and
  as text on the dark ground it is 3.49:1. #d6bfff is the lightest purple that
  still clears the ΔE2000 floor against the dark primary (17.3); #c2a0fb, one
  step darker, sits at 9.1 and fails.
- **Surface steps.** `scaleSteps.cyan` and `scaleSteps.tangerine` drop `700`
  (nothing reads it any more) and `scaleSteps.neutral` drops `0` (the page is
  `--white` now). 201 tokens became 198.

What was rejected, and why:

- **`#F6F2F8` as the raised surface.** It separates better from the page
  (ΔE2000 4.59 against 2.80 for `#FAF8FC`, 1.107:1 against 1.055:1), but it
  pushes `--color-info` on a raised surface down to 4.36:1, under the 4.5 floor.
  The only way to keep the promise was to move info to `blue-900` (#143B69),
  which at 10.21:1 is a navy that reads as a heading colour, not an
  information colour. The surface relationship is worth less than the promise,
  so the raised surface stays `--neutral-50` (#FAF8FC).
- **A ΔE2000 exemption for primary vs secondary.** The brief treats
  primary and secondary as a pair, which is the one relationship the
  distinguishability guard would normally forbid. No exemption was needed:
  the measured gap is 20.1 in light and 17.3 in dark, both far above the floor
  of 10. The guard stays exactly as D21 left it.

What this costs, stated plainly:

- **`--vibrant-cyan` no longer has a role.** It was the dark secondary. It
  survives as a brand anchor and through `--color-tint-cyan` and the `cyan`
  ramp (100, 900), but the brand's cyan no longer carries a theme-facing
  emphasis role — the emphasis hierarchy is now deep purple → vibrant purple →
  vibrant tangerine, and cyan is a tint. This is the one real loss in the
  change, and it is the price of a coherent secondary: the cyan could not be
  the secondary *and* stay distinct from the info family that D21 had to
  separate it from.
- **The page and the body text are no longer editable in the Explorer.** They
  are brand anchors, and D11 makes the ten anchors fixed. The *roles* are
  still editable — `--color-base-100` can be retargeted at any colour
  primitive — so the Explorer can still re-tint the page; it can no longer
  move the brand's own white or ink, which is the point of keeping them as
  anchors.

Two things this decision deliberately does **not** do:

- It does not re-point the components. `--color-secondary` and
  `--color-accent` have no component consumer today, and `Button`'s
  `--secondary` and `--ghost` variants still paint their label with
  `--color-primary` (`src/components/Button/Button.css`). That is a naming
  defect, not a token defect, and it is recorded as a follow-up rather than
  folded into a colour decision.
- It does not fix the pre-existing state contrast defects the audit turned up
  while measuring this: in the dark theme the primary label on
  `--color-base-hover` is 2.72:1 and on `--color-base-active` 1.88:1, and the
  accent on base-active is 2.08:1. Those are hover and pressed states, which
  the current contrast promises do not cover. They are real, they are visible,
  and they belong to the component work, not here.

### What the Explorer shows about it

An anchor is no longer an inert artwork swatch, so the Explorer says what each
one is for: an anchor card names the roles it drives ("drives base-100",
"drives base-content · neutral"), a role that reads an anchor is marked where
it appears — a "brand" tag on the Colour page's role grid, a "· brand anchor"
note on the role's own editor — and every role's editor shows the **dark
mapping** target beside the light one. The last one matters after D22: the
dark secondary is a different family step from the light one, not a darkened
copy of it, and the two mappings are separate authored facts (D19) — promoting
a candidate changes the light contract and leaves `tokens/themes.mjs` to be
edited in turn.

A `-content` role reading an anchor is deliberately *not* called out. The label
on a fill being the page's own white is expected; marking it would bury the
six roles that actually carry the brand.

**D23 — A solid action carries an edge and a lip; the lip is the brand ink at
25%.** The primary button is the system's one solid object, so by user
direction (2026-10-22) it gains a hairline **darker border** and a hard
**1px shadow**: `border-color: var(--color-primary-edge)` and
`box-shadow: var(--shadow-lip)`.

Two things that decision had to settle:

- **The edge is a role, not a component mix.** `--color-primary-edge` is the
  primary fill mixed 15% toward the brand ink, authored **per theme** — the
  light theme mixes `--deep-purple`, the dark theme `--purple-500` — because
  a custom property's `var()`s resolve on the element that declares them, so
  a single mix in the component layer would freeze at the light value and
  never follow the dark mapping. It stays a role because that is what the
  theme layer can re-point.
- **The lip is a primitive, and it is the brand's black, not a grey.** The
  system's shadows are all the brand ink (`--shadow-sm`, `--shadow-md`), so
  `--shadow-lip` is the ink at 25%, offset 1px down with **no blur**: it draws
  a line under the button rather than a halo. The other two button variants
  stay flat — the lip belongs to the one filled control.

## Provisional

**P1 — The type scale, weights and line heights.**
The brand leaves these to the design system and asks for validation in real
layouts (typography.md §3, §8). Sizes are a plain `xs…4xl` ramp; treat them as a
first pass.

**P2 — Spacing, radii, shadows, durations.**
A 4px spacing base, five radii, two shadows, three durations. Reasonable
defaults, not brand mandates. Radius roles were retuned by user direction
(2026-10-20), mapping an external three-knob scheme onto the existing scale
rather than importing its token names: interactive fields and buttons use
`--radius-sm` (4px), the Checkbox box uses the field radius `--radius-sm`
(4px), boxes (Card,
Dialog) use `--radius-md` (8px), and `--border-width` is a 0.5px hairline
(`--border-width-strong` stays 2px so control boundaries and focus rings keep
their weight). The knobs that had no nise counterpart (`--depth`, `--noise`,
control `--size-*`) were not adopted. Later user direction (2026-10-22) moved
the **Select trigger** off `--radius-xl` onto the field radius
(`var(--select-radius, var(--radius-sm))`) so it reads as a text field, and the
Select menu onto the surface radius (`--radius-md`, as Dialog and Tooltip).
The same direction moved the **Checkbox box** onto the field radius
(`var(--checkbox-radius, var(--radius-sm))`), so a checkbox sits with the
TextField beside it instead of reading as a separate, rounder control.

**P3 — The icon set.**
A seed, not a catalogue: the grid, stroke rule and four sizes are fixed by
iconography.md §3, but the glyph list grows on demand. Empty states and the
reasoning-stage icons (iconography.md §7) are not built yet.

**P4 — Status colour roles (success / warning / error / info).**
*(Superseded by D20 and D21.)* Originally established four authored functional
ramps and pinned dark ground anchors as a provisional override. This was folded
permanently into the primary role vocabulary by D20, with the info family migrated
from teal to blue by D21. Full rationale is preserved in D20 and D21.

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
