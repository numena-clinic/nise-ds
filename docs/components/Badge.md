# Badge

A short, non-interactive label: a category, a source type, a count.

## When to use

- To label content in place: a source type, a tag, a count beside a heading.
- To group or filter what the user reads, where the **words** carry the meaning.

## When not to use

- To carry an action — a badge is never interactive.
- **To carry a verdict.** `tone` is categorical emphasis from the brand's support
  tints; it is not a status. The palette "does not establish fixed colors for
  clinical observations, evidence, hypotheses, decisions, or system statuses"
  (color.md §4), and an icon or label must not "deliver a verdict"
  (iconography.md §5). A badge meaning "improving" or "at risk" is a misuse —
  the wording would be doing the work anyway, with colour implying a judgement
  the system has not made.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `tone` | `"neutral" \| "purple" \| "cyan" \| "tangerine"` | `"neutral"` | Categorical, not status |
| `size` | `"sm" \| "md"` | `"md"` | — |
| `icon` | `ReactNode` | — | Decorative, `aria-hidden` |
| `children` | `ReactNode` | — | Required |

## Anatomy & tokens

```
[ icon? label ]
```

- Radius is `--radius-full` (`--badge-radius`), so the pill shape is a token.
- Text is `--color-tint-text` (Deep Purple) on the tint surface; `neutral` uses
  `--color-surface-subtle`. Every tone is a tint of a brand colour, validated
  for contrast.

## Accessibility

A `<span>`, non-interactive, so it is not in the tab order and announces no
action. Its icon is decorative and hidden; the label is the content. Do not use
a badge as the only accessible name for anything.

## Do / Don't

- **Do** keep it to one or two words.
- **Don't** use tone to mean severity. Four tints are not a four-point scale.
