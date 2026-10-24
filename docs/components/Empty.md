# Empty

An empty state block for a list or view with no records yet — no sessions recorded, no assessment data. A centred column: an optional tinted icon slot, a title, an optional description, and an optional action.

## When to use

Use Empty when a list, table, or section has genuinely no content yet. It tells the user why the area is blank and what they can do next. Do not use it for error states — use Alert for those.

## Accessibility

The icon slot is `aria-hidden`. The title and description carry the meaning in words (iconography.md §5). If you pass an icon, it must be decorative — the text must be complete without it.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | **required** | Short explanation of the empty state |
| `description` | `string` | — | Supporting copy; what the user can do next |
| `icon` | `ReactNode` | — | Decorative icon; rendered in the tinted slot |
| `action` | `ReactNode` | — | A Button or link to help the user get started |

## Tokens consumed

```
--empty-padding         → --space-8
--empty-gap             → --space-3
--control-height-lg     icon slot size (48 px)
--color-tint-purple     icon slot background
--color-base-content    title text
--color-text-muted      description text
--font-size-md          title
--font-size-sm          description
--font-weight-medium    title weight
--line-height-snug      heading line height
--radius-full           icon slot circle (point of use: var(--empty-radius, var(--radius-full)))
```
