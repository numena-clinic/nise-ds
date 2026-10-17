# Card

A bordered surface that groups related content under a heading.

## When to use

- To group a section of content that belongs together: a review block, a summary,
  a panel with a footer of actions.
- When the group needs a heading in the page outline.

## When not to use

- As a button. A card is a container, not an interactive control. If the whole
  card should be clickable, put a link or button **inside** it — making the
  surface itself the target breaks semantics and the tab order.

## Props

| Prop | Type | Notes |
| --- | --- | --- |
| `heading` | `ReactNode` | Rendered as `<h{headingLevel}>` |
| `description` | `ReactNode` | Muted line under the heading |
| `actions` | `ReactNode` | Right-aligned header controls |
| `footer` | `ReactNode` | Bottom row, separated by a rule |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | Defaults to `3`; controls the page outline |
| `children` | `ReactNode` | Body |

## Anatomy & tokens

```
┌ header ────────────────────┐
│ heading        [ actions ] │
│ description                │
├ body ──────────────────────┤
├ footer ────────────────────┤
└────────────────────────────┘
```

- Rendered as a `<section>`; header/footer are `<header>`/`<footer>`.
- Padding `--card-padding` and gap `--card-gap` → `--space-*`.
- Heading is serif (`--font-serif`); the surface is `--color-surface` with a
  `--color-border` boundary and `--shadow-sm`.
- Radius via `var(--card-radius, var(--radius-lg))`.

## Accessibility

The heading level is a prop because a card's place in the outline depends on
where it sits — a card at the top of a page is `<h2>`, the same card nested is
`<h3>`. Default `3` is a safe middle, but pass the level that keeps the outline
correct; a card with no heading is a decorative grouping and should not invent
one.

## Do / Don't

- **Do** set `headingLevel` to keep the document outline sequential.
- **Don't** nest cards to create sections — use headings and spacing.
