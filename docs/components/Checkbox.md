# Checkbox

A real checkbox inside its label. `indeterminate` is supported. Colour is never
the only signal — the drawn glyph marks the state.

## Usage
```tsx
<Checkbox label="Store clinician notes" />
<Checkbox label="Enable" hint="Takes effect immediately" />
<Checkbox label="Partial" indeterminate />
```

## Tokens
- `--choice-size` (drawn box), `--choice-gap`, `--choice-group-gap`
- `--color-action`, `--color-surface`, `--color-border-strong`, `--color-text`, `--color-text-muted`
- `--color-focus-ring`, `--focus-ring-width`, `--border-width-strong`, `--radius-sm`
