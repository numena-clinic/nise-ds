# Skeleton

A loading placeholder: a painted shape that stands where content is about to appear. It holds no meaning and must never be the only signal that a region is loading.

## When to use

Use Skeleton while data is fetching so the page does not shift when content arrives. Always pair it with a live region or `aria-busy` on the parent so screen readers are notified when loading completes. Never use Skeleton to communicate an error or an empty state — use Alert or Empty for those.

## Accessibility

The component renders `aria-hidden="true"`. The loading announcement belongs to the actual state, not the shimmer. Pair with `aria-busy="true"` on a parent container and update it to `"false"` when content is ready.

## Sizing

Skeleton has no intrinsic size — pass `style`, `className`, or a width/height directly so it matches the element it stands in for.

```tsx
<Skeleton style={{ width: "100%", height: "var(--control-height-md)" }} />
```

## Props

Accepts all `<div>` HTML attributes except `role`, `children`, and `aria-hidden` (all controlled internally). Apply size via `style` or `className`.

## Tokens consumed

```
--color-base-200    shimmer base color
--duration-slow     animation duration
--ease-standard     animation easing
--skeleton-radius   falls back to var(--radius-md) at point of use
```
