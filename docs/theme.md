# Theme Explorer

A small, standalone tool for **exploring the token system live**: change a token,
watch the real components re-theme, review what follows from the change, and
export a *candidate* you can promote back into the canonical source.

It is a design tool, not a product surface, and it is deliberately **not** a
Storybook story or addon. Storybook documents the components; the explorer bends
the tokens they read.

```bash
npm run dev              # open the explorer (Vite, http://localhost:5173)
npm run build:explorer   # static build → dist/
npm run preview:explorer # serve the build
```

## The idea

The token source (`tokens/*.mjs`) is plain ESM data, so the explorer imports the
**same modules** the generator and validator use. There is no second list of
tokens to keep in sync: add a token to the source and it appears in the explorer.

You edit tokens; the explorer renders **real components** inside a preview that
carries your changes. Nothing is written to disk while you work — a browser tab
must not author source files. When you are happy, you export a **candidate** and
promote it from the command line.

The preview has two views, each with a Phone / Tablet / Desktop width, and a
**Light / Dark toggle** that picks which theme mapping everything reads:

- **Catalogue** — a dense set of Nise specimens covering the whole component set
  (buttons, badges, cards, form fields, choice controls, sliders, tabs, tables,
  overlays). This is the "what does this palette look like on real components?"
  answer.
- **Tokens** — the reference graph: primitive → semantic → component, column by
  column, each row showing the live resolved value under your current edits and
  the selected mapping.

The catalogue renders the **Nise components themselves** — the same ones an
application ships — plus the `InformationReview` composition. There is no
separate library behind the preview: it shows what ships.

## What you can edit

The panel is a tabbed editor — **Colour / Type / Space / Shape / Motion** — with
a search box that filters across the active tab. In Colour, the palette and the
roles that point at it are split into two groups, because they are different
edits (change a value vs. re-point an alias). A change is marked and can be
reset, per token or all at once.

| Section | Editable | Read-only |
| --- | --- | --- |
| **Colour** | the generated scale steps (swatch + hex + picker); every colour *role* retargets which primitive it points at | the ten **brand anchors** — fixed by numena-brand (color.md §2), shown with their published value and an "Immutable" badge; derived colours (`color-mix`, e.g. `--color-scrim`) — they follow the palette |
| **Type** | sizes, line heights, weights, letter spacing; font families via a constrained select | — |
| **Space** | the spacing scale, layout measures | — |
| **Shape** | radii, border widths, control heights, badge heights | component *aliases* (they follow lower layers) |
| **Motion** | durations, disabled opacity | easings |

Three principles decide editability:

- **A value can be edited; a reference can be re-pointed; a derivation cannot be
  edited directly.** A `color-mix(...)` token is shown read-only because it is a
  function of the primitives — change those instead.
- **The brand anchors are immutable.** The ten published values (color.md §2)
  have no control: a role may point at an anchor, but neither the panel nor a
  candidate file can change one — `parseCandidate` rejects it.
- **Font families are a closed set** (the families already referenced in the
  repo). The explorer will not introduce a font the brand does not already name.

## How the preview works

Overrides are applied as **scoped CSS custom properties** on the preview
wrapper, never on `:root`. The token layer cascades exactly as it does in an app,
so changing one primitive flows through every semantic and component token that
depends on it — live — while the explorer's own chrome is untouched.

The **Light / Dark toggle** chooses which mapping the preview, the Tokens view
and the contrast re-check read. Light is the base you edit; dark is the same
role names mapped onto `tokens/themes.mjs`. The mechanism is the same scoped
custom properties: besides your overrides, the wrapper pins every token that
differs between themes to its value under the selected mode — so the preview
follows the toggle regardless of the operating system's colour-scheme
preference, and your overrides still win over the pin. Nothing is applied to
`:root` or an ancestor, and no `[data-theme]` attribute is relied on.

The Radix overlays (the `Select` popup, `Dialog` and `Tooltip` content) portal to
`document.body` by default, which would escape the wrapper and lose the scoped
variables, so they are pointed at the wrapper via the component's optional
`portalContainer` / `container` prop. That prop is additive and does not change
default behaviour.

## Review, export and promote

**Review & export** shows three things before you commit to anything:

1. **The diff** — each changed token, its old and new value, and what follows
   from it: how many dependents it has directly and in total, with the first few
   named.
2. **The contrast promises** — the same pairs `npm run tokens:validate` checks,
   re-resolved against your experimental values **under the mapping the preview
   is showing** (the heading says "light mapping" or "dark mapping"). A failure
   is shown as an icon plus the word, never a colour verdict (color.md §4).
3. **The candidate** — the portable, versioned change set.

The candidate is the only thing that leaves the tool. Its shape:

```json
{
  "schema": "nise.theme-candidate",
  "version": 1,
  "tokens": [
    { "name": "--purple-600", "layer": "primitive", "kind": "value", "value": "#3B1E66", "from": "#935DE1" },
    { "name": "--color-surface", "layer": "semantic", "kind": "alias", "ref": "--neutral-100", "from": "ref(\"--neutral-0\")" }
  ]
}
```

`kind` is `"value"` (edit a literal) or `"alias"` (re-point a role). `from` is the
canonical value the candidate was authored against, so promotion can warn about
**drift** if the source has moved since.

### Promoting

```bash
npm run theme:apply -- theme-candidate.json           # dry run: show the diff
npm run theme:apply -- theme-candidate.json --write   # apply, rebuild, validate
```

(The `--` lets npm pass the flags to the script.)

`scripts/apply-theme.mjs` is the local, explicit, reviewable step:

- **Dry-run by default.** Nothing is written until `--write`.
- **Line-scoped edits.** Each token is replaced on its own source line; nothing
  else is reformatted. A token that is missing, ambiguous, or not editable is
  reported, not guessed.
- **Rebuild + validate after writing.** If `tokens:build` or `tokens:validate`
  fails, the token source *and* the generated `tokens.css` are restored and the
  command exits non-zero — a bad candidate can never leave the repo broken.
- **It never commits or pushes.** Git stays your decision.

Candidate validation exists in two places by design: the explorer (rich, for
editing feedback) and the script (a conservative pre-filter). The authoritative
gate is the pipeline itself — `tokens:build` + `tokens:validate` — which runs
immediately after any write.

## Boundaries

- The explorer's own chrome is plain CSS on tokens, checked by
  `npm run check:usage` like everything else in `src`.
- **The preview is built from Nise components only.** There is no vendored layer
  and no Tailwind toolchain; an earlier version previewed against shadcn/ui
  (D12) and was reversed (D13). Every component in the preview is plain CSS over
  tokens, so the token boundary has no path exemptions.
- No verdict colours, ever. The palette defines none as verdicts (color.md §4)
  and the tool does not invent any. The operational roles that exist under the
  provisional P4 carve-out (success / warning / error / info — machine states
  only) are ordinary colour roles here, editable like any other; they never
  carry a clinical judgement.
- The generated `src/tokens/tokens.css` is never edited by hand — only
  regenerated by `tokens:build`.

## Where it lives

```
src/explorer/
  main.tsx                 entry (Vite root: index.html)
  App.tsx                  shell: state, top bar, draft persistence
  explorer.css             the tool's own styles (tokens only)
  ambient.d.ts             types the *.mjs token modules at the boundary
  theme/tokens.ts          token introspection: forms, groups, editability
  theme/theme.ts           overrides, preview resolution, contrast, candidate
  theme/color.ts           hex ⇄ hsl, contrast-on, derived from tokens
  components/              TokenPanel, ColorControls, Preview, Catalogue,
                           TokenReference, ReviewPanel
tokens/color.mjs           shared colour maths (validator + explorer)
scripts/apply-theme.mjs    promotion CLI
scripts/lib/promote.mjs    pure promotion helpers
scripts/check-token-usage.mjs  the boundary (one documented waiver)
vite.config.explorer.ts    explorer Vite config
```

`vite.config.explorer.ts` is intentionally not named `vite.config.ts`:
`@storybook/builder-vite` auto-loads a root `vite.config.*`, and keeping the
explorer's config out of that filename keeps the two tools independent.

## Not built

- No theme *authoring*: the token source now defines a dark mapping
  (`tokens/themes.mjs`), but the explorer edits the light base only — a candidate
  carries no theme id, so dark is promoted by editing the source, not the tool.
  The Light/Dark toggle is a **view** of both mappings, not an editor: an override
  you make in dark mode is still a light-base change (D19), re-shown against the
  dark mapping.
- No persistent server-side storage — the draft is a convenience in
  `localStorage`, never an applied change.
- No write-back from the browser; promotion is always the local CLI step.
