# Typography

The type scale is **provisional**. The brand selects the families and the
direction (typography.md §3–§4); it leaves the scale, weights and line heights to
the design system, to be validated in real layouts. Treat every size below as a
starting point, not a settled decision.

## Families

| Token | Family | Source | Role |
| --- | --- | --- | --- |
| `--font-serif` | Tiempos Text | Commercial (Klim) | Reading and headlines (typography.md §4) |
| `--font-sans` | Albert Sans | Google Fonts, SIL OFL 1.1 | Interface, labels, data |

Tiempos Text is licensed and is **not committed** — the same rule the brand
follows (typography.md §11). Until a consuming application supplies the files,
the serif falls back to Georgia via the token stack. Albert Sans loads from
Google Fonts (`src/styles/fonts.css`), matching the brand's web setup.

**The division of labour is a rule, not a preference:** the serif does the
reading (headings, long-form note text), the sans does the interface (labels,
controls, data). A control is never set in the serif.

## Scale

Sizes (`--font-size-*`), weights (`--font-weight-*`), line heights
(`--line-height-*`) and letter spacing (`--letter-spacing-*`) are primitives.
Component and semantic layers reference them; nothing sets a raw `px`
(`check:usage` enforces this).

- Sizes run `xs` 12 → `4xl` 36.
- Weights: regular 400, medium 500, semibold 600, bold 700. The sans uses
  medium/semibold for emphasis; the serif carries the headline weight.
- Line heights are named by intent (`tight`, `snug`, `normal`, `relaxed`), not by
  number, so a heading and a paragraph do not share one universal value
  (typography.md §8).
- Measure is a token: `--measure-prose` (68ch) for reading columns,
  `--measure-form` (32rem) for form width. The exact values are to be validated
  in the layout (typography.md §8, line length).

## Headings

The baseline (`src/styles/globals.css`) sets `h1`–`h6` to the serif, tight
leading and tight tracking, at the size scale above. A component that needs a
heading asks for the right level rather than restyling a heading — for example
`Card` renders its heading as an `<h3>` by default and takes a `headingLevel`
prop for a deeper position in the page outline.
