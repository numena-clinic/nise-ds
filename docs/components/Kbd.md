# Kbd

A key cap: shows what keyboard shortcut the interface recognises, or what key it is waiting for. It labels — it never acts. A shortcut hint beside a menu item, not a button.

## When to use

Use Kbd to show keyboard shortcuts or key sequences in documentation, tooltips, and inline hints. Do not use it as a button or a selectable element.

## Composition

For a key sequence, render multiple `<Kbd>` elements side by side:

```tsx
<span style={{ display: "flex", gap: "var(--space-1)" }}>
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
</span>
```

## Accessibility

The component renders a `<kbd>` HTML element, which carries the correct semantic meaning for screen readers without additional ARIA.

## Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | The key label or symbol |

Also accepts all `<kbd>` HTML attributes.

## Tokens consumed

```
--kbd-height        24 px (component layer)
--kbd-padding-x     → --space-2
--kbd-font-size     → --font-size-xs
--kbd-radius        falls back to var(--radius-sm) at point of use
--color-base-200    key cap background
--color-base-content key cap text
--color-border      hairline border
--border-width      border thickness
--font-weight-medium key cap weight
```
