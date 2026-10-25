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
- To carry status — a button never changes color to mean good or bad (color.md
  §4). This is why there is no `danger` variant: a destructive action earns a
  clear label and confirmation, not a red fill. The status roles that exist now
  describe machine states — saved, failed — and are not a licence to make a
  button's color carry a verdict.

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
- `primary` uses `--color-primary` (a deep purple) with `--color-primary-content`
  (white) — 11.54:1 in the light theme. `secondary` is a bordered surface whose
  border carries `--color-primary` (the label already does), moving through
  `--color-primary-hover` and `--color-primary-active` with the state; the
  boundary clears 3:1 in both themes. `ghost` has no fill until hover.
- The `primary` fill is a solid object, so it carries an edge and a lip:
  `border-color: var(--color-primary-edge)` — the fill mixed 15% toward the
  brand ink, a hairline darker than the fill itself, re-authored per theme so
  it stays darker in both — and `box-shadow: var(--shadow-lip)`, a hard 1px
  line under the button in the brand ink at 25% (no blur: it draws an edge, not
  a halo). The other two variants stay flat.
- Radius via `var(--button-radius, var(--radius-sm))`, so a surface can re-round
  one button without a token.

### Known limitation — the secondary/ghost label in dark

`secondary` and `ghost` paint their label with `--color-primary`, a *fill* role
used as a text color. It is legible at rest (6.13:1 on the dark ground, 11.54:1
on the light page) but it fails in the dark theme's interactive states: 2.72:1 on
`--color-base-hover` and 1.88:1 on `--color-base-active`. The light theme is
fine (10.19:1 and 8.70:1).

The token-correct fix is to label these two variants with `--color-base-content`
(the text role) — 7.74:1 and 5.35:1 in the dark theme, 14.85:1 and 12.68:1 in
light — or to introduce a role for "the primary color as text on a surface",
which D20's one-name-per-role rule does not currently allow. This is a
component decision, not a token one, and it is deliberately not made here
(decisions.md D22).

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
