# Accordion

A vertically stacked set of interactive headings that each reveal a section of content. Adheres to the W3C WAI-ARIA Accordion design pattern with full keyboard roving navigation.

## When to use

Use Accordion to organize related content into progressive disclosure sections where vertical screen space is constrained (FAQ lists, clinical milestone history, detailed form sections).

## Single vs Multiple

- **`type="single"`** (default): Only one item can be expanded at any given time. If `collapsible={true}` (default), clicking the open item closes it.
- **`type="multiple"`**: Any number of items can be expanded simultaneously.

## Accessibility

- Each trigger is wrapped in an `<h3>` heading and renders as an interactive `<button>`.
- `aria-expanded` and `aria-controls` indicate expansion state and target content ID.
- The content container renders `role="region"` with `aria-labelledby` referencing the trigger button.
- Full keyboard support:
  - `Space` / `Enter`: Toggles the focused item.
  - `ArrowDown`: Moves focus to the next accordion trigger.
  - `ArrowUp`: Moves focus to the previous accordion trigger.
  - `Home`: Moves focus to the first accordion trigger.
  - `End`: Moves focus to the last accordion trigger.
- The chevron indicator is decorative (`aria-hidden`).

## Props

### Accordion

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `"single" \| "multiple"` | `"single"` | Selection mode |
| `collapsible` | `boolean` | `true` | Allows closing the item in single mode |
| `value` | `string \| string[]` | — | Controlled active item(s) |
| `defaultValue` | `string \| string[]` | — | Uncontrolled initial value |
| `onValueChange` | `(val: string \| string[]) => void` | — | Fired when selection changes |

### AccordionItem

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | **required** | Unique item key |
| `disabled` | `boolean` | `false` | Disables interaction |

## Tokens consumed

```
--color-base-content      header and content text
--color-text-muted        chevron indicator
--color-border            bottom divider between items
--color-focus-ring        focus outline
--focus-ring-width        focus ring thickness
--focus-ring-offset       focus ring offset
--font-sans               typography family
--font-weight-medium      header title weight
--font-size-sm            font size
--space-4                 padding
--duration-fast           chevron transition duration
--ease-standard           chevron transition easing
```
