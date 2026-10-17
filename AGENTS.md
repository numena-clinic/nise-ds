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

## Components

- One directory per component: `Component.tsx`, `Component.css`, `Component.stories.tsx`,
  `index.ts`. Class names are `nise-<component>__<element>` / `--<modifier>`
  (BEM-ish), matching the house system.
- Every component starts with a header comment: what it is, the tokens it
  consumes, and its accessibility behaviour. Keep it accurate — it is part of
  the documentation.
- Props are typed and exported; forward refs where a ref is meaningful; spread
  the rest of the native attributes.
- Accessibility: a visible label always; never colour alone; `aria-describedby`
  only points at rendered ids; decorative icons `aria-hidden`. Prefer a primitive
  (Radix) for ARIA-heavy patterns and native HTML otherwise.

## Tests

- `tests/components.test.tsx` — behaviour (roles, names, states).
- `tests/a11y.test.tsx` — axe over rendered components, closed and open.
- Prefer querying by role/name. Polyfills live in `tests/setup.ts`; the axe
  helper is `tests/axe.ts`.

## Docs

When you change something a doc describes, update the doc: `docs/tokens.md`,
`docs/typography.md`, `docs/accessibility.md`, `docs/decisions.md`, and the
matching `docs/components/*.md`.

## Do not

- Commit licensed font files.
- Edit generated files (`src/tokens/tokens.css`, `tokens/dist/*`).
- Add a dependency without a note in `docs/decisions.md` — most things are a
  native element or a token, not a library.
