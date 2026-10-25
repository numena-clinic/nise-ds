# Toggle

A two-state pressed button: a toolbar mode, a filter, a transcript layer that can be switched on and off. It is an `aria-pressed` button — not a checkbox, not a switch.

## When to use

Use Toggle for a control whose state belongs to the surface it acts on (a view mode, a filter), not to a form submission. If the control feeds a form value, use Checkbox or Switch instead. If multiple items share a selection space, use ToggleGroup.

## Pressed state

The pressed state is a SELECTION, not a status: it draws `--color-selected-surface` under `--color-selected-text`. Pressed and unpressed differ by fill AND text color — never color alone.

## Sizes

| Size | Token height |
|------|-------------|
| `sm` | `--button-height-sm` |
| `md` (default) | `--button-height-md` |
| `lg` | `--button-height-lg` |

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `ToggleVariant` | `"default"` | `"default"` (ghost tile) \| `"outline"` (bordered) |
| `defaultPressed` | `boolean` | `false` | Initial pressed state (uncontrolled) |
| `pressed` | `boolean` | — | Controlled pressed state |
| `onPressedChange` | `(p: boolean) => void` | — | Called on press state change |
| `size` | `ToggleSize` | `"md"` | `"sm"` \| `"md"` \| `"lg"` |
| `disabled` | `boolean` | `false` | Disables the control |

## Tokens consumed

```
--button-height-{sm,md,lg}    height
--button-padding-x-{sm,md}    horizontal padding
--button-font-size-{sm,md,lg} text size
--button-gap                  icon + label gap
--color-selected-surface      pressed fill
--color-selected-text         pressed text
--color-primary               unpressed label color
--color-base-hover            unpressed hover fill
--color-focus-ring            focus outline
```
