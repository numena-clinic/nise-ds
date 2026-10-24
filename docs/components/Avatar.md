# Avatar

A person's face, or their initials when no image is available. It identifies a clinician, a client, or a team member. It is never interactive and never carries an action — a Button beside it does that.

## When to use

Use Avatar to attach a human identity to a record, a comment, or a list row. It is an identity marker, not a status badge.

## Sizes

| Size | Token | Height |
|------|-------|--------|
| `sm` | `--control-height-sm` | 32 px |
| `md` (default) | `--control-height-md` | 40 px |
| `lg` | `--control-height-lg` | 48 px |

## Image fallback

When `src` is absent or the image fails to load, the component renders `fallback` (initials) on a `--color-tint-purple` disc. The fallback is always shown while the image is loading, so the avatar never shows a broken icon.

## Accessibility

- An image with a non-empty `alt` is announced by its alt text.
- Omit `alt` (or pass `""`) for decorative avatars where an adjacent name already identifies the person.
- The fallback span carries no accessible role; pair it with an adjacent visible name.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | Image URL |
| `alt` | `string` | `""` | Alt text for the image |
| `srcSet` | `string` | — | Responsive image source set |
| `fallback` | `string` | — | Initials rendered when the image is absent or failed |
| `size` | `AvatarSize` | `"md"` | `"sm"` \| `"md"` \| `"lg"` |

## Tokens consumed

```
--avatar-size        → --control-height-md (overridden per size variant)
--avatar-font-size   → --font-size-sm
--color-tint-purple  fallback disc background
--color-base-content fallback text
--radius-full        circular clip
```
