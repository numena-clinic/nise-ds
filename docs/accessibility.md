# Accessibility

Accessibility is checked mechanically, not asserted in prose.

## What runs

| Check | Where | Proves |
| --- | --- | --- |
| Token contrast | `npm run tokens:validate` | Every relied-on color pair meets its WCAG 2.2 ratio |
| axe (component) | `npm run test` (`tests/a11y.test.tsx`) | No axe violations on rendered components, closed and open |
| axe (Storybook) | `.storybook/preview.ts`, `a11y.test: "error"` | Every story is audited in the addon panel |
| Behaviour | `npm run test` (`tests/components.test.tsx`) | Names, descriptions, states behave as documented |

Color contrast is proven analytically rather than in axe, because jsdom has no
layout. `tokens/semantic.mjs` lists every foreground/background pair the system
depends on with its minimum ratio; the validator resolves the tokens (through
`color-mix`) to sRGB and computes the real ratio, under **both** themes. The
palette is generated in OKLCH (`docs/tokens.md`), so the ratios are the system's
own, not a reproduction of the brand's published figures.

## Principles the components hold to

- **A visible label always.** Every field has a real `<label>`; a placeholder is
  never a substitute (iconography.md §5, "label by default").
- **Not by color alone.** The focus ring is a 2px outline with an offset, so it
  reads against any surface. Selection is a tinted tile *and* a distinct
  foreground (iconography.md §4). An error is text, an icon and a heavier
  boundary — never just a color.
- **The error is described, not just shown.** A field's `aria-describedby`
  includes the error id only when the error is rendered; the hint leaves the DOM
  when an error is present, so the description never points at a missing node.
- **Decorative icons are hidden.** Icons that repeat their label are
  `aria-hidden`; an icon carrying meaning takes a `title` (iconography.md §6).
- **The primitive owns the ARIA.** `Select` is built on Radix, so listbox
  semantics, typeahead, keyboard navigation and focus management are the
  primitive's job; we supply appearance and tokens.
- **Motion is optional.** `prefers-reduced-motion` reduces all animation to
  nothing (motion-generative-patterns.md, §04 and Accessibility & performance).
- **Hit areas.** The default control height is 40px, the brand's desktop
  target; touch targets are 44px (iconography.md §3).

## Reporting

If a check fails, fix the source of truth, not the check. A contrast failure is
a token problem (`tokens/semantic.mjs`); an axe failure is a component problem.
The axe rule set is deliberately strict — only `color-contrast` (no layout in
jsdom) and `region` (a page-level rule that does not apply to a component
fragment) are disabled, both with a comment explaining why.
