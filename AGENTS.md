# AGENTS.md

Working notes for anyone (human or agent) changing this repository. Read this
before editing; it is the short version of `docs/`.

## The one rule

**The brand defines the identity; Nise applies it.** Palette, typefaces, icon
grid and the meaning-rules live in `numena-clinic/numena-brand`. Do not invent a
colour, a typeface or a status convention here. When a decision is needed, find
it in the brand docs and cite the section; if it is genuinely not there, record
the tradeoff in `docs/decisions.md` and mark it provisional.

## Commands

```bash
npm install
npm run storybook        # browse components at :6006
npm run dev              # Theme Explorer at :5173 (bend tokens, preview live)
npm run verify           # the gate — run before saying you are done
```

`npm run verify` runs, in order: `tokens:validate`, `check:usage`, `lint`,
`typecheck`, `test`. Green means done. If you changed anything visual, also run
`npm run tokens:build` first and commit the regenerated
`src/tokens/tokens.css`.

## Tokens

- Source of truth is `tokens/*.mjs`. `src/tokens/tokens.css` is **generated** —
  never edit it by hand; edit the source and rebuild.
- The palette lives in `tokens/palette.mjs` (OKLCH model; the ten brand hex are
  anchors, not the whole palette). Four families are **generated** — `neutral`,
  `purple`, `cyan`, `tangerine` — from a shared lightness curve; four are
  **authored** (pinned to published candidate values, no interpolation may move
  a pin) — `mint`, `citron`, `pink`, `blue` — plus two pinned dark-ground
  anchors, `--dark-ground` / `--dark-panel`. `primitives.mjs` re-exports its
  `colorTokens`; do not hand-author a colour primitive. Themes live in
  `tokens/themes.mjs` (light is the base, dark re-points the same role names).
- Four layers, downward references only: primitive → semantic → themes →
  component. A theme is not a second token set — it re-points the *same* role
  names onto another ground (`tokens/themes.mjs`). `tokens/validate.mjs` rejects
  a reference that points the wrong way. A primitive may not contain `var()` or
  `color-mix()`; a semantic token may only reference primitives; a component
  token may reference primitives, semantics or other component tokens.
- Use `ref()` (semantic layer) to reference a primitive — it throws at author
  time on a typo.
- **No raw colours and no off-token `px`.** `npm run check:usage` fails on raw
  colour literals and on `px` values on spacing/radius/type properties.
- **The role vocabulary is daisyUI-shaped and there is one name per role**
  (decisions.md D20). Surfaces: `--color-base-100/200/300`, `--color-base-content`,
  `--color-base-hover`, `--color-base-active`. Fills: `--color-primary`,
  `--color-secondary`, `--color-accent`, `--color-neutral`, each with a
  `-content`; the primary also carries `-hover`/`-active` and `-edge` (the
  fill's own darker rim, D23). Status:
  `--color-success/warning/error/info`, each with a `-content`. Supporting:
  `--color-text-muted`, `--color-border{,-strong,-hover,-error}`,
  `--color-focus-ring`, `--color-scrim`, `--color-selected-{surface,text}`,
  `--color-link{,-hover}`, `--color-tint-{purple,cyan,tangerine}`. There are no
  aliases — do not reintroduce `--color-surface`, `--color-text` or
  `--color-action`.
- **Status colours are first-class (D5 is superseded).** They report a machine
  state, never a clinical judgement, and colour is never the only signal: an
  interface error is text + an icon + a heavier boundary first (color.md §4).
  They read from the authored ramps above; tangerine is not warning and cyan is
  not info. Do not add a fifth family.
- **The base and emphasis roles read the brand's anchors and active palette** (D22): the page
  is `--white` in light, the body text `--ink-plum`, the secondary
  `--vibrant-purple`, the accent `--accent-violet`. Brand anchors like `--vibrant-tangerine`
  and `--vibrant-cyan` provide identity and categorical tint washes (`--color-tint-*`).
- **`--color-accent` is a fill role.** `--accent-violet` (#AB62ED) paired with
  `--color-accent-content` (`--ink-plum`, #221A2A) achieves a WCAG AA 4.56:1 contrast ratio.
  For subtle washes, use `--color-tint-tangerine` or `--color-tint-purple`.
- **The palette is small on purpose.** `scaleSteps` in `tokens/palette.mjs` is
  the authoritative list of the steps each family surfaces — every surfaced step
  must be read by a role, and a role may only point at a surfaced step. Add a
  step only when a role needs it.
- When a component needs to rely on a colour pair, add it to `contrastChecks` in
  `tokens/semantic.mjs` and let the validator prove the ratio.
- Component-specific values go in the component layer; radius is the exception —
  declare it at the point of use: `var(--button-radius, var(--radius-md))`.
- `npm run tokens:build` also writes `tokens/dist/nise.tokens.json`, a DTCG
  2025.10 export (`tokens/dtcg.mjs`) — an isolated interchange artifact next to
  the proprietary `tokens.json`. It precomputes `color-mix` colours and lists
  em/ch values under the `com.numena.nise` extension; nothing depends on it.

## Components

- One directory per component: `Component.tsx`, `Component.css`, `Component.stories.tsx`,
  `index.ts`. Class names are `nise-<component>__<element>` / `--<modifier>`
  (BEM-ish), matching the house system.
- Every component starts with a header comment: what it is, the tokens it
  consumes, and its accessibility behaviour. Keep it accurate — it is part of the
  documentation.
- Props are typed and exported; forward refs where a ref is meaningful; spread
  the rest of the native attributes.
- Accessibility: a visible label always; never colour alone; `aria-describedby`
  only points at rendered ids; decorative icons `aria-hidden`. Prefer a primitive
  (Radix) for ARIA-heavy patterns and native HTML otherwise.
- Twenty-nine components now. Radix backs `Select`, `Slider`, `Tabs`, `Dialog` and
  `Tooltip`; the rest are native HTML (`Alert`, `AspectRatio`, `Avatar`, `Badge`,
  `Breadcrumb`, `Button`, `Card`, `Checkbox`, `Collapsible`, `Empty`, `Kbd`,
  `Label`, `Pagination`, `Progress`, `Radio`, `Separator`, `Skeleton`, `Switch`,
  `Table`, `TextField`, `Textarea`, `Timeline`, `Toggle`, `ToggleGroup`). Add a
  Radix package only when it earns its place (D6); record the reason in
  `docs/decisions.md`.

## Tests

- `tests/components.test.tsx` — behaviour (roles, names, states) for every component.
- `tests/a11y.test.tsx` — axe over rendered components, closed and open.
- `tests/geometry.test.ts` — switch knob and slider thumb proportional geometry.
- `tests/theme.test.ts` / `tests/promote.test.ts` — the theme model, candidate
  format, and the promotion planner (pure).
- `tests/usage.test.ts` — the token-boundary scanner (`scripts/lib/token-usage.mjs`).
- `tests/graph.test.ts` — the reference-graph acyclicity proof (`tokens/graph.mjs`).
- `tests/explorer.test.tsx` — the Theme Explorer as a user drives it, plus axe.
- Prefer querying by role/name. Polyfills live in `tests/setup.ts`; the axe
  helper is `tests/axe.ts`.

## Theme Explorer

- `src/explorer/` is a standalone Vite app (`npm run dev`), **not** a Storybook
  story or addon. Its Vite config is `vite.config.explorer.ts`, named so
  `@storybook/builder-vite` does not auto-load it.
- It reads `tokens/*.mjs` directly — no second token list. A new token shows up
  automatically; classify edibility from the raw value (literal / `var()` alias /
  `color-mix` derived) in `src/explorer/theme/tokens.ts`, not by hand. The ten
  brand anchors are excluded from editability (`IMMUTABLE_TOKENS` /
  `isEditable`) and shown as fixed cards — a candidate may not name one.
- Preview overrides are **scoped custom properties on the preview wrapper**, never
  on `:root`. The wrapper also pins every theme-varying token to the value of the
  selected Light/Dark mode (`previewStyle(overrides, mode)`), so the preview's
  theme does not depend on `data-theme` cascading or the OS preference. Radix
  overlays inside a scoped theme (Select, Dialog, Tooltip) get the wrapper via
  their optional `container` / `portalContainer` prop (default behaviour
  unchanged).
- The Light/Dark toggle is a **view**, not theme authoring: edits always target
  the light base (D19), and the dark mapping of the same edits is what the toggle
  shows. `resolveContrast(overrides, mode)` re-checks the promises against the
  mapping on screen, and the review panel names it.
- The browser never writes source. It exports a versioned candidate
  (`nise.theme-candidate` v1); `npm run theme:apply -- <file> [--write]` promotes
  it locally — dry-run by default, rebuilds + validates, rolls back on failure,
  never commits. Keep `scripts/lib/promote.mjs` free of I/O side effects so it
  stays unit-testable.
- The parameter pane is a visual editor over the active foundation section
  (Colour / Type / Space / Shape / Motion), opened by the sidebar — there are no
  tabs in the pane; the sidebar IS the section switcher. The preview is a
  **sidebar-driven page system**: Foundations (each section — Colour, Typography,
  Space, Shape, Motion — drives the pane, plus a Token graph page), Components
  (one page per family) and Patterns (composed combinations), each with a
  Phone / Tablet / Desktop toggle. The preview wrapper class
  (`.nise-explorer__preview`), the `data-nise-theme` marker, the labelled token
  inputs and the `.nise-swatch-card--locked` cards are load-bearing for
  `tests/explorer.test.tsx` — keep them.
- **An anchor card names the roles it drives** (`.nise-color__drives`), a role
  reading an anchor is marked (`.nise-pv__swatch-tag`, "· brand anchor"), and a
  role's editor shows its **dark mapping** target beside the light one. Since
  D22 the page, the panel, the body text, the neutral, the primary, the
  secondary and the accent all read a brand anchor, so "immutable" has a
  consequence worth showing. The anchor readership is the **light base** (D19) —
  the dark mapping is a separate authored file, not a darkened copy.

## Docs

When you change something a doc describes, update the doc: `docs/tokens.md`,
`docs/typography.md`, `docs/accessibility.md`, `docs/theme.md`,
`docs/decisions.md`, and the matching `docs/components/*.md`.

## Do not

- Commit licensed font files.
- Edit generated files (`src/tokens/tokens.css`, `tokens/dist/*`).
- Write the token source from the browser — promotion is always `theme:apply`.
- Add a dependency without a note in `docs/decisions.md` — most things are a
  native element or a token, not a library.
- Import Tailwind, `src/components/ui/` or `@/lib/utils` from anywhere — the
  vendored shadcn layer and the Tailwind toolchain were removed in D13 and must
  not come back. Every component is plain CSS over tokens (D2).
- Write a colour outside the token set — raw hex, an off-scale `px`, or a family
  that is not in `palette.mjs`. The token boundary is enforced everywhere, with
  no path exemptions (D13). The four status families in the palette are the
  complete status vocabulary; do not add a role or a fifth family beside them.
