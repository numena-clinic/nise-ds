# Button

An action. Triggers a single, immediate operation.

## When to use

- The user's next step: **Confirm**, **Submit**, **Continue**.
- One **`primary`** action per view — the affirmative one.
- **`secondary`** for the other real actions in the same context.
- **`ghost`** for in-place actions (a row toolbar, a "clear" beside a field) that
  should not compete with the surface.

## When not to use

- For navigation with no action, use a link.
- To carry status — a button never changes colour to mean good or bad (color.md
  §4). This is why there is no `danger` variant: a destructive action earns a
  clear label and confirmation, not a red fill, because the palette defines no
  status colour.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `"primary" \| "secondary" \| "ghost"` | `"primary"` | See above |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control heights 32 / 40 / 48 |
| `loading` | `boolean` | `false` | Spinner, `aria-busy`, blocks re-activation, label stays |
| `fullWidth` | `boolean` | `false` | Stretch to container |
| `leftIcon` / `rightIcon` | `ReactNode` | — | Decorative, `aria-hidden` |
| `disabled` | `boolean` | — | Native, inert |
| …rest | `ButtonHTMLAttributes` | — | `type` defaults to `"button"` |

## Anatomy & tokens

```
[ icon? ] [ label ] [ icon? ]
```

- Heights `--button-height-{sm,md,lg}` → `--control-height-*`.
- Padding `--button-padding-x-*` → `--space-*`; gap `--button-gap` → `--space-2`.
- `primary` uses `--color-action` (a deep purple) with `--color-action-text`
  (white) — 9.06:1 in the light theme. `secondary` is a bordered surface; `ghost`
  has no fill until hover.
- Radius via `var(--button-radius, var(--radius-md))`, so a surface can re-round
  one button without a token.

## Accessibility

A real `<button>`. Disabled is inert. While `loading`, the spinner is
`aria-hidden` and `aria-busy="true"` is set, so the accessible name is still the
label and the action cannot fire twice. The focus ring is the 2px
`--color-focus-ring` outline, shared by every control.

## Do / Don't

- **Do** give one primary action per view.
- **Don't** put an icon button with no visible label here — the label is the
  accessible name. Icon-only actions are a separate pattern, not built yet
  (iconography.md §5).
- **Don't** use `secondary` twice to mean primary and secondary.
