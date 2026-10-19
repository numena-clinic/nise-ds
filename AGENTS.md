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
- Three layers, downward references only: primitive → semantic → component.
  `tokens/validate.mjs` rejects a reference that points the wrong way. A
  primitive may not contain `var()` or `color-mix()`; a semantic token may only
  reference primitives; a component token may reference primitives, semantics or
  other component tokens.
- Use `ref()` (semantic layer) to reference a primitive — it throws at author
  time on a typo.
- **No raw colours and no off-token `px`.** `npm run check:usage` fails on raw
  colour literals and on `px` values on spacing/radius/type properties.
- **No status colours, ever.** There is no `--color-success` / `-danger` /
  `-warning`, by brand rule (color.md §4). Errors are text + an icon + a heavier
  boundary; accents are categorical, not verdicts.
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
- Thirteen components now. Radix backs `Select`, `Slider`, `Tabs`, `Dialog` and
  `Tooltip`; the rest are native HTML (`Button`, `TextField`, `Checkbox`,
  `Radio`, `Switch`, `Badge`, `Card`, `Table`). Add a Radix package only when it
  earns its place (D6); record the reason in `docs/decisions.md`.

## Tests

- `tests/components.test.tsx` — behaviour (roles, names, states).
- `tests/a11y.test.tsx` — axe over rendered components, closed and open.
- `tests/theme.test.ts` / `tests/promote.test.ts` — the theme model, candidate
  format, and the promotion planner (pure).
- `tests/explorer.test.tsx` — the Theme Explorer as a user drives it, plus axe.
- Prefer querying by role/name. Polyfills live in `tests/setup.ts`; the axe
  helper is `tests/axe.ts`.

## Theme Explorer

- `src/explorer/` is a standalone Vite app (`npm run dev`), **not** a Storybook
  story or addon. Its Vite config is `vite.config.explorer.ts`, named so
  `@storybook/builder-vite` does not auto-load it.
- It reads `tokens/*.mjs` directly — no second token list. A new token shows up
  automatically; classify edibility from the raw value (literal / `var()` alias /
  `color-mix` derived) in `src/explorer/theme/tokens.ts`, not by hand.
- Preview overrides are **scoped custom properties on the preview wrapper**, never
  on `:root`. Radix overlays inside a scoped theme (Select, Dialog, Tooltip) get
  the wrapper via their optional `container` / `portalContainer` prop (default
  behaviour unchanged).
- The browser never writes source. It exports a versioned candidate
  (`nise.theme-candidate` v1); `npm run theme:apply -- <file> [--write]` promotes
  it locally — dry-run by default, rebuilds + validates, rolls back on failure,
  never commits. Keep `scripts/lib/promote.mjs` free of I/O side effects so it
  stays unit-testable.
- The panel is a tabbed visual editor (Colour / Type / Space / Shape / Motion)
  with palette and roles split apart; the preview has a **Catalogue** view (the
  Nise components) and a **Tokens** view (the reference graph), each with a
  Phone / Tablet / Desktop toggle. The preview wrapper class
  (`.nise-explorer__preview`) and the labelled token inputs are load-bearing for
  `tests/explorer.test.tsx` — keep them.

## Docs

When you change something a doc describes, update the doc: `docs/tokens.md`,
`docs/typography.md`, `docs/accessibility.md`, `docs/theme.md`,
`docs/decisions.md`, and the matching `docs/components/*.md`.

## Do not

- Commit licensed font files.
- Edit generated files (`src/tokens/tokens.css`, `tokens/dist/*`).
- Write the token source from the browser, or add a status colour — promotion is
  always `theme:apply`.
- Add a dependency without a note in `docs/decisions.md` — most things are a
  native element or a token, not a library.
- Import Tailwind, `src/components/ui/` or `@/lib/utils` from anywhere — the
  vendored shadcn layer and the Tailwind toolchain were removed in D13 and must
  not come back. Every component is plain CSS over tokens (D2).
- Write a status colour, or a hand-authored colour outside the token set — the
  token boundary is enforced everywhere now, with no path exemptions (D13).
