# TextField

A single-line text input with a visible label, an optional hint and an optional
error.

## When to use

- The user types or edits a short piece of text: a name, a phrase, a note title.
- For a longer body of text, a textarea is a separate pattern, not built yet.

## When not to use

- When the value comes from a short known list — use `Select`.
- When the label could be the placeholder. **A placeholder is not a label**
  (iconography.md §5). Every field here has a real `<label>`.

## Props

| Prop | Type | Notes |
| --- | --- | --- |
| `label` | `string` | Required, always visible |
| `hint` | `ReactNode` | Helper text; leaves the DOM when `error` is set |
| `error` | `ReactNode` | Error message; switches `aria-invalid` and the boundary |
| `required` | `boolean` | Native `required` + an `aria-hidden` marker on the label |
| `id` | `string` | Optional; a stable id is generated with `useId` otherwise |
| …rest | `InputHTMLAttributes` | `className` is managed |

## Anatomy & tokens

```
Label  *
[ input ]
hint or error
```

- `--field-gap`, `--field-label-gap` space the stack; `--input-height` and
  `--input-padding-x` size the control (→ `--control-*`).
- Radius via `var(--input-radius, var(--radius-md))`.

## Error handling — read this

An error is carried by three things at once, in this order of importance:

1. the message text,
2. a 16px `AlertIcon` (shape, not hue),
3. a heavier boundary (`--border-width-strong` plus `--color-border-error`).

The boundary reads from the operational error accent (decisions.md P4) rather
than a neutral, which is the *only* place colour enters — it is the third
channel, not the first. Strip the text and the icon and the field must still
read as invalid. This follows color.md §4: colour may reinforce a state the
other channels have already stated, and an icon or label must not "deliver a
verdict" on its own (iconography.md §5).

When an error is present the hint is **removed from the DOM**, and
`aria-describedby` lists only ids that are actually rendered — it never points
at a missing node.

## Accessibility

- The `<label>` is associated via `htmlFor`; `useId` guarantees a unique id.
- `aria-invalid` is set only when there is an error.
- `aria-describedby` points at the hint or the error, never both, never neither
  by accident.

## Do / Don't

- **Do** write an error that says what to do, in words.
- **Don't** rely on a red border — colour alone is the one thing that is
  guaranteed not to carry the error here.
