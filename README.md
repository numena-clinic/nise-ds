# Nise Design System

The design system for **Numena** — a code-first library of interface tokens,
components and patterns for the clinical reasoning workspace Numena builds for
psychologists.

Nise *consumes* the Numena brand; it does not define it. Brand decisions — the
palette, the typefaces, the icon grid, the rules about what color may and may
not mean — live in [`numena-clinic/numena-brand`](https://github.com/numena-clinic/numena-brand)
and are treated here as input. Everything in this repository turns those
decisions into things an engineer can import.

## Quickstart

```bash
npm install
npm run tokens:build     # regenerate src/tokens/tokens.css from tokens/*.mjs
npm run storybook        # browse the components at http://localhost:6006
npm run dev              # Theme Explorer: bend the tokens, preview live, export
npm run export:openpencil # export tokens and visual specimens to OpenPencil (.pen)
npm run verify           # the full gate: tokens, usage, lint, types, tests
```

## What's here

```
tokens/            canonical token source (the .mjs files) + build & validation
  primitives.mjs   raw values: color, type, space, radius, motion
  semantic.mjs     interface roles, and the contrast promises kept
  component.mjs    per-component values (control heights, paddings)
  build.mjs        source → tokens.css (+ tokens/dist/*.json: proprietary & DTCG)
  dtcg.mjs         renders the DTCG 2025.10 export (tokens/dist/nise.tokens.json)
  validate.mjs     references, layer direction, acyclicity, contrast, reproducibility
src/
  tokens/tokens.css  GENERATED — the artifact the app loads. Do not edit.
  styles/            global baseline, fonts, shared field layout
  icons/             the seed of the icon set (Iconoir grid)
  components/        Button, TextField, Select, Checkbox, Radio, Switch,
                     Badge, Card, Slider, Tabs, Tooltip, Dialog, Table
  compositions/      InformationReview — the reference composition
  explorer/          Theme Explorer — the standalone token design tool
  index.ts           the public surface
tests/             behaviour + axe accessibility tests
docs/              tokens, typography, accessibility, theme, decisions, components
```

## Tokens

Four layers, each referencing only the layers below it:

| Layer | Answers | Example |
| --- | --- | --- |
| **primitive** | *what value?* | `--deep-purple: #4C207F` |
| **semantic** | *what role?* | `--color-primary: var(--deep-purple)` |
| **themes** | *the same roles, on another ground* | `[data-theme="dark"] { --color-primary: var(--purple-500) }` |
| **component** | *where used?* | `--button-height-md: var(--control-height-md)` |

The source of truth is the `.mjs` files, not the CSS. `npm run tokens:build`
renders them to `src/tokens/tokens.css`, which is **committed** so the system is
usable without a build step; `npm run tokens:validate` proves the committed CSS
is exactly what the source produces, that every reference resolves, and that
every promised color pair meets its WCAG ratio. Read [`docs/tokens.md`](docs/tokens.md).

## Scripts

| Script | Does |
| --- | --- |
| `npm run tokens:build` | Regenerate `tokens.css` and `tokens/dist/*.json` (proprietary + DTCG) |
| `npm run tokens:validate` | References, layer direction, acyclicity, contrast, reproducibility |
| `npm run check:usage` | Fail on raw colors / off-token px / unknown tokens in `src` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (flat config) |
| `npm run test` | Vitest: behaviour + axe |
| `npm run storybook` | Storybook dev server (docs + a11y panel) |
| `npm run build-storybook` | Static Storybook build |
| `npm run dev` | Theme Explorer dev server (Vite) |
| `npm run build:explorer` | Static Theme Explorer build → `dist/` |
| `npm run theme:apply -- <file> [--write]` | Promote a theme candidate into the token source |
| `npm run verify` | All of the above gates in order |

## Theming

The **Theme Explorer** (`npm run dev`) lets a designer change the tokens and see
real components re-theme live — a sidebar of Foundations, Components and Patterns
pages, a visual token editor over the active foundation, and a live preview with
a Phone / Tablet / Desktop toggle — then export a versioned *candidate*. Promotion
is a local, explicit, reviewable command — `npm run theme:apply` — that edits the
token source, rebuilds and validates, and rolls back if the contrast promises
break. It never writes from the browser and never commits. See
[`docs/theme.md`](docs/theme.md).

The component and pattern pages preview the **Nise components themselves** — the
same ones an application ships — so what you see is what the token change will
actually produce. Every component is plain CSS over tokens (decision D2); there
is no second library or CSS toolchain behind the preview (D13).

## Definition of done

A change is done when `npm run verify` is green and:

- the token source changed (if visuals did), not just the generated CSS;
- any new token references a lower layer and is validated;
- new behaviour has a test, and new UI passes axe;
- component docs (`docs/components/*.md`) and the component's header comment
  still describe what the code does.

## Status

Foundation, plus the Theme Explorer previewing the full Nise component set in both Light and Dark themes. See
[`docs/decisions.md`](docs/decisions.md) for what is settled, what is
provisional, and what is deliberately deferred (cloud visual-regression services,
package registry publishing, a full icon catalogue, multi-theme authoring).
