# Timeline

A vertical history of system events on a record — session note saved, intake form completed, assessment scheduled. Native list semantics with token-parameterised rail connectors and dot states.

## When to use

Use Timeline to show the chronological sequence of machine events attached to a client record or workflow. The item states (`done`, `current`, `upcoming`) are operational vocabulary only — they report a machine state, never a clinical reading of color (color.md §4).

## Item variants

| Variant | Dot color | Meaning |
|---------|-----------|---------|
| `done` | `--color-tint-purple` | Completed step |
| `current` | `--color-primary` | The step in progress now |
| `upcoming` | `--color-border` | A future step |

## Accessibility

- `Timeline` renders `<ol role="list">` (the explicit role restores list announcement lost when `list-style: none` is applied in some browser/reader pairs).
- Each `TimelineItem` renders `<li>`.
- Color is not the only differentiator — the dot position and the `title` text distinguish variants.

## Composition

```tsx
<Timeline>
  <TimelineItem variant="done" title="Intake form completed" meta="12 Mar · Amina Mensah" />
  <TimelineItem variant="current" title="Session 2 — in progress" meta="26 Mar" />
  <TimelineItem variant="upcoming" title="Session 3 — scheduled" meta="9 Apr" />
</Timeline>
```

## TimelineItem props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `TimelineItemVariant` | `"upcoming"` | `"done"` \| `"current"` \| `"upcoming"` |
| `title` | `string` | **required** | Event description |
| `meta` | `string` | — | Date, author, or other secondary metadata |

## Tokens consumed

```
--timeline-dot      10 px dot diameter (component layer)
--timeline-gap      → --space-4 (row gap)
--timeline-rail     → --border-width-strong (connector line thickness)
--color-tint-purple done dot
--color-primary     current dot
--color-border      upcoming dot + rail
--color-base-content title text
--color-text-muted  meta text
```
