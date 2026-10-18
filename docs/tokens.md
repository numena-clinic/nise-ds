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
  `--space-4`, `--radius-md`, `--duration-fast`. Only `tokens/primitives.mjs`
  authors a literal.
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
tokens. Anything pointing the wrong way fails.

## Source of truth, and the artifact

The `.mjs` files under `tokens/` are canonical. `npm run tokens:build` renders
them into two artifacts:

| Artifact | Committed? | Why |
| --- | --- | --- |
| `src/tokens/tokens.css` | **yes** | The app and Storybook load it; no build step to run a consumer |
| `tokens/dist/tokens.json` | no (gitignored) | Machine form for future consumers (tokens studio, other platforms) |

Because the CSS is committed, it could drift from the source. `npm run
tokens:validate` regenerates the CSS in memory and diffs it against the commit —
a stale `tokens.css` is a build failure, not a silent inconsistency.

## Adding or changing a token

1. Edit the right layer in `tokens/*.mjs`. Raw value → `primitives.mjs`; a new
   role → `semantic.mjs`; a component value → `component.mjs`.
2. `npm run tokens:build` — this is what writes `src/tokens/tokens.css`.
3. `npm run tokens:validate` — resolves references, checks layer direction and
   the contrast promises.
4. Commit both the source change and the regenerated CSS.

Reference a primitive in the semantic layer with the `ref()` helper; it throws
at author time on a misspelled name, so a typo cannot reach the CSS.

## The colour rules the system keeps

The palette is exactly the ten brand colours (color.md §2). Two rules from the
brand are load-bearing here:

- **No status colours.** "The palette does not establish fixed colors for
  clinical observations, evidence, hypotheses, decisions, or system statuses"
  (color.md §4). Nise therefore ships **no** `--color-success`, `--color-danger`,
  `--color-warning`. Errors are carried by text, an icon and a heavier boundary;
  a categorical accent is emphasis, never a verdict.
- **Approved combinations only.** For every foreground/background pair the
  system relies on, `tokens/semantic.mjs` records the pair and its minimum ratio
  in `contrastChecks`, and the validator proves it. The resolved values
  reproduce the brand's published ratios (White on Vibrant Purple 5.27:1, Ink
  Plum on Vibrant Cyan 10.83:1, and the Vibrant Purple focus ring at 5.27:1 on
  White and 4.41:1 on Pale Lavender).

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
