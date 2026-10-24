# Switch

An on/off toggle (immediate effect). Styled track+knob, but a native checkbox
powers keyboard and form semantics.

## Usage
```tsx
<Switch label="Auto-save" hint="Saves every 30s" />
```

## Tokens
`--switch-width`, `--switch-height`, `--switch-knob`, `--switch-inset`.

## Geometry
The track is the knob plus the inset on each side: the width is twice the
knob (`2 × 18 + 2 × 3 = 42`), the height is the knob plus the inset top and
bottom (`18 + 2 × 3 = 24`). The knob is positioned from the track's **outer**
edge, so the track carries no border — a border would shrink the box the knob
is measured against and push it out of the track. The knob travels the full
width minus the knob and the two insets, leaving `--switch-inset` on the far
side when checked.
