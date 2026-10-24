# Slider

Radix-backed single-value slider. Pass `label` and `hint` for a visible name;
otherwise forward `aria-label`.

## Usage
```tsx
<Slider label="Tone" defaultValue={[40]} min={0} max={100} />
```

## Tokens
`--slider-track-height`, `--slider-thumb-size`, `--slider-gap`.

## Geometry
Radix positions a zero-size wrapper at the value point, and the thumb is
centred on that origin with `translate(-50%, -50%)` — the wrapper's static
position is on the root's centre line because the root is
`align-items: center`. The thumb is larger than the rail, so it overhangs it
symmetrically by `(thumb − rail) / 2`; at the ends Radix nudges the thumb by
half its size so it stays inside the track.
