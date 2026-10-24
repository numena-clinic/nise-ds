# AspectRatio

A frame that keeps its shape whatever the content inside does — a chart illustration, a scan, a video. The frame reserves the ratio up front so the page does not jump while an asset streams in.

## When to use

Use AspectRatio to wrap any content that must maintain a fixed width-to-height ratio regardless of the container width. Common uses: image thumbnails in a grid, video embeds, chart placeholders.

## How it works

The outer `<div>` has `aspect-ratio: <ratio>` set as an inline style, so the browser reserves the correct height relative to whatever width the container gives it. An inner wrapper fills the box `position: absolute; inset: 0`, so `object-fit: cover` on an `<img>` inside works as expected.

```tsx
<AspectRatio ratio={16 / 9}>
  <img src="/scan.png" alt="MRI scan" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
</AspectRatio>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ratio` | `number` | `16 / 9` | Width ÷ height to reserve |
| `children` | `ReactNode` | — | Content to fill the reserved box |

## Tokens consumed

None. AspectRatio is geometry only — the ratio is a prop, not a themeable value. Apply surface colour and radius on the children or a wrapper.
