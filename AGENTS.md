# AGENTS.md

Working notes for anyone (human or agent) changing this repository. Read this
before editing; it is the short version of `docs/`.

## The one rule

**The brand defines the identity; Nise applies it.** Palette, typefaces, icon
grid and the meaning-rules live in `numena-clinic/numena-brand`. Do not invent a
color, a typeface or a status convention here. When a decision is needed, find
it in the brand docs and cite the section; if it is genuinely not there, record
the tradeoff in `docs/decisions.md` and mark it provisional.

## Commands

```bash
npm install
npm run storybook        # browse components at :6006
npm run dev              # standalone showcase at :5173
npm run build:lib        # build ES module library + declarations to dist/
npm run build:site       # build standalone showcase site to dist-site/
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
  `colorTokens`; do not hand-author a color primitive. Themes live in
  `tokens/themes.mjs` (light is the base, dark re-points the same role names).
- Four layers, downward references only: primitive → semantic → themes →
  component. A theme is not a second token set — it re-points the *same* role
  names onto another ground (`tokens/themes.mjs`). `tokens/validate.mjs` rejects
  a reference that points the wrong way. A primitive may not contain `var()` or
  `color-mix()`; a semantic token may only reference primitives; a component
  token may reference primitives, semantics or other component tokens.
- Use `ref()` (semantic layer) to reference a primitive — it throws at author
  time on a typo.
- **No raw colors and no off-token `px`.** `npm run check:usage` fails on raw
  color literals and on `px` values on spacing/radius/type properties.
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
- **Status colors are first-class (D5 is superseded).** They report a machine
  state, never a clinical judgement, and color is never the only signal: an
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
- When a component needs to rely on a color pair, add it to `contrastChecks` in
  `tokens/semantic.mjs` and let the validator prove the ratio.
- Component-specific values go in the component layer; radius is the exception —
  declare it at the point of use: `var(--button-radius, var(--radius-md))`.
- `npm run tokens:build` also writes `tokens/dist/nise.tokens.json`, a DTCG
  2025.10 export (`tokens/dtcg.mjs`) — an isolated interchange artifact next to
  the proprietary `tokens.json`. It precomputes `color-mix` colors and lists
  em/ch values under the `com.numena.nise` extension; nothing depends on it.

## Styling & Components (D36)

- **Tailwind CSS v4 + Token Bridge:** `src/styles/globals.css` imports Tailwind v4
  (`@import "tailwindcss" source("../");`), web fonts, and `src/tokens/tokens.css`,
  and binds Tailwind's `@theme inline` directly to Nise's semantic roles (`bg-base-100`,
  `text-base-content`, `bg-primary`, `border-border-strong`, etc.). Components use
  `class-variance-authority` (`cva`) and `cn` (`src/lib/cn.ts` wrapping `clsx` +
  `tailwind-merge`) alongside `nise-<component>__<element>` / `--<modifier>`
  structural class markers.
- **Two-tier component hierarchy (modeled after `tabular-ui`):**
  - `src/components/foundational/` — 20 core UI primitives (`Accordion`, `Button`,
    `Checkbox`, `Collapsible`, `Dialog`, `Kbd`, `Label`, `Progress`, `Radio`,
    `Select`, `Separator`, `Skeleton`, `Slider`, `Switch`, `Tabs`, `TextField`,
    `Textarea`, `Toggle`, `ToggleGroup`, `Tooltip`).
  - `src/components/product/` — 10 domain and layout blocks (`Alert`,
    `AspectRatio`, `Avatar`, `Badge`, `Breadcrumb`, `Card`, `Empty`, `Pagination`,
    `Table`, `Timeline`).
  - Everything is re-exported cleanly from `src/index.ts`.
- **One directory per component:** `Component.tsx`, `Component.stories.tsx`,
  `index.ts`.
- **Headless primitives:** `@base-ui/react` backs the 9 complex interactive
  components (`Accordion`, `Collapsible`, `Dialog`, `Select`, `Slider`, `Tabs`,
  `Toggle`, `ToggleGroup`, `Tooltip`); the remaining 21 components are native HTML.
  New headless foundations must earn their place; record the reason in `docs/decisions.md`.
- Every component starts with a header comment: what it is, the tokens it
  consumes, and its accessibility behaviour. Keep it accurate — it is part of the
  documentation.
- Props are typed and exported; forward refs where a ref is meaningful; spread
  the rest of the native attributes.
- Accessibility: a visible label always; never color alone; `aria-describedby`
  only points at rendered ids; decorative icons `aria-hidden`.

## Tests

- `tests/components.test.tsx` — behaviour (roles, names, states) for every component.
- `tests/a11y.test.tsx` — axe over rendered components, closed and open.
- `tests/geometry.test.ts` — switch knob and slider thumb proportional geometry.
- `tests/usage.test.ts` — the token-boundary scanner (`scripts/lib/token-usage.mjs`).
- `tests/graph.test.ts` — the reference-graph acyclicity proof (`tokens/graph.mjs`).
- `tests/compositions.test.tsx` / `tests/showcase.test.tsx` — product compositions and showcase.
- `tests/browser/*.spec.ts` — Playwright browser verification (motion, portfolio, standalone site, axe, phone reflow).
- Prefer querying by role/name. Polyfills live in `tests/setup.ts`; the axe
  helper is `tests/axe.ts`.

## Docs

When you change something a doc describes, update the doc: `docs/tokens.md`,
`docs/typography.md`, `docs/accessibility.md`, `docs/theme.md`,
`docs/decisions.md`, and the matching `docs/components/*.md`.

## Do not

- Commit licensed font files.
- Edit generated files (`src/tokens/tokens.css`, `tokens/dist/*`).
- Add a dependency without a note in `docs/decisions.md` — most things are a
  native element or a token, not a library.
- Write a color outside the token set — raw hex, an off-scale `px`, or a family
  that is not in `palette.mjs`. The token boundary is enforced everywhere, with
  no path exemptions. The four status families in the palette are the
  complete status vocabulary; do not add a role or a fifth family beside them.

## Portfolio release and agent consumption

- The portfolio entry is the standalone site in `src/site/` and `site/`. The
  workspace and 30-family grid have their own HTML routes (`/` and `/components/`). Keep
  portfolio presentation out of Storybook; component documentation stays there.
- Import shipped components from `src/index.ts`. Check props in component source
  and its story before use. Reuse components; do not invent props or duplicate
  controls in a composition.
- With Storybook running, the official MCP addon is at `http://localhost:6006/mcp`.
  Use `docs-list` and `docs-show` when your agent client has this server configured.
  Without MCP, read the same source/stories directly; there is no custom MCP server.
- Run `npm run verify`, then `npm run build:site` and `npm run build-storybook`, then `npm run test:browser`.
- Chromatic publishes the built Storybook and reviews visual changes. The repo
  needs `CHROMATIC_PROJECT_TOKEN` in Actions secrets; do not claim publication
  before a real Chromatic build returns a public URL.
