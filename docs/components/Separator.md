# Separator

A hairline between groups of related content — sections of a note, toolbars, the parts of a session record. It splits structure by position alone and has no hover, focus, or state treatment.

## When to use

Use Separator when the visual grouping of adjacent regions needs a thin line to reinforce their boundary. For complex spatial separation use whitespace and the spacing scale first; reach for Separator when the line adds meaning beyond the gap.

## Decorative vs semantic

`decorative` (default `true`) marks the separator as presentational. A non-decorative separator (`decorative={false}`) is expected to be named by its surrounding context — set `aria-label` or ensure the region headings identify it.

## Orientation

| `orientation` | Direction | `aria-orientation` |
|---|---|---|
| `"horizontal"` (default) | Full-width rule | `"horizontal"` |
| `"vertical"` | Full-height rule | `"vertical"` |

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `SeparatorOrientation` | `"horizontal"` | Which axis the line runs along |
| `decorative` | `boolean` | `true` | Whether the rule is purely visual |

## Tokens consumed

```
--separator-thickness   → 1 px (component layer, matches --border-width)
--color-border          hairline color
```
