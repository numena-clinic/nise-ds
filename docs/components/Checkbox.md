# Checkbox

A real checkbox inside its label. `indeterminate` is supported. Color is never
the only signal — the drawn glyph marks the state.

## Usage
```tsx
<Checkbox label="Store clinician notes" />
<Checkbox label="Enable" hint="Takes effect immediately" />
<Checkbox label="Partial" indeterminate />
```

## Tokens
- `--choice-size` (drawn box), `--choice-gap`, `--choice-group-gap`
- `--color-primary`, `--color-primary-content`, `--color-base-100`, `--color-border-strong`, `--color-base-content`, `--color-text-muted`
- `--color-focus-ring`, `--focus-ring-width`, `--border-width-strong`, `--radius-sm`

## Shape
- The box uses the **field radius** — `var(--checkbox-radius, var(--radius-sm))` —
  so a checkbox and a TextField in the same form share a corner treatment.
- The tick and the indeterminate dash are drawn in `--color-primary-content` on
  the `--color-primary` fill. Their stroke is deliberately heavy (3 units on a
  24-unit grid, drawn at 13px in an 18px box): a thin hairline tick at this
  size disappears against the fill instead of reading as a mark.
