# ToggleGroup

A set of Toggle-style pressed buttons sharing one selection space: `single` keeps exactly one item pressed, `multi` keeps a set. A selection group for toolbars and filters — not a radio group over a form field, not a Tabs row.

## When to use

Use ToggleGroup when multiple related Toggle controls share a single selection: view mode switchers, toolbar format options, filter chip sets. For a single on/off control, use Toggle. For form submission, use Radio (single) or Checkbox (multi).

## Types

| `type` | Behaviour |
|--------|-----------|
| `"single"` | Exactly one item pressed at a time once any item is chosen |
| `"multi"` | Any number of items pressed independently |

## Controlled vs uncontrolled

- Uncontrolled: pass `defaultValue` (string for single, string[] for multi).
- Controlled: pass `value` + `onValueChange`. Clicks call `onValueChange` only; `aria-pressed` reflects `value`.

## Accessibility

- Renders `role="group"` named by the required `label` prop.
- Each item renders `aria-pressed`.
- Keyboard: Tab enters the group; arrow keys move between items.

## Props (ToggleGroup)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `ToggleGroupType` | `"single"` | `"single"` \| `"multi"` (or `"multiple"`) |
| `variant` | `ToggleVariant` | `"default"` | `"default"` (ghost) \| `"outline"` (bordered) |
| `label` | `string` | **required** | Accessible group name |
| `value` | `string \| string[]` | — | Controlled selection |
| `defaultValue` | `string \| string[]` | — | Initial selection (uncontrolled) |
| `onValueChange` | `function` | — | Called on change |
| `size` | `ToggleSize` | `"md"` | Passed to all items |

## Tokens consumed

Same as Toggle — the group delegates all visual tokens to its items:

```
--color-selected-surface  pressed fill
--color-selected-text     pressed text
--color-primary           unpressed label
--color-base-hover        unpressed hover fill
--color-focus-ring        focus outline
--radius-sm               item border-radius
```
