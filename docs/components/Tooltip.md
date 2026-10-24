# Tooltip

Supplemental text only. Never the sole means of conveying information.

## Usage
```tsx
<TooltipProvider>
  <TooltipRoot>
    <TooltipTrigger asChild><Button>Hover</Button></TooltipTrigger>
    <TooltipContent>More info</TooltipContent>
  </TooltipRoot>
</TooltipProvider>
```

## Tokens
`--tooltip-padding-x`, `--tooltip-padding-y`, `--tooltip-font-size`.

## Appearance
- The bubble is a floating surface: `--color-base-100`, `--radius-md`,
  `--shadow-sm`, and a **light** boundary — `var(--border-width) solid
  var(--color-border)`. A tooltip is a small, temporary surface; the strong
  boundary is reserved for controls that take input.
