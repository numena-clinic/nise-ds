# Progress

A determinate or indeterminate meter: how far an upload, an export, or a session capture has advanced. It reports machine state — it does not take input (a Slider does that).

## When to use

Use Progress to reflect a long-running operation where the system knows how far along it is (determinate) or is working but cannot say how long it will take (indeterminate). Never use it as a rating scale or a score visualisation — those have their own semantics.

## Determinate vs indeterminate

Pass a `value` number for determinate; pass `value={null}` for indeterminate. The indeterminate state runs a CSS sweep animation and omits `aria-valuenow`.

## Accessibility

`aria-label` is **required** because the painted bar has no text of its own and color must not carry state alone (color.md §4). The component exposes `role="progressbar"` with `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` when determinate.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number \| null` | — | Current value; `null` = indeterminate |
| `max` | `number` | `100` | Maximum value |
| `aria-label` | `string` | **required** | Accessible name for the meter |

## Tokens consumed

```
--progress-height    → 8 px (component layer)
--color-primary      fill bar
--color-base-200     track
--radius-full        rounded ends
```
