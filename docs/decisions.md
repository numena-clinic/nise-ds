# Decisions

A clear, authoritative record of architectural decisions settled in Nise Design System,
what was left provisional, and what was deliberately deferred — with the reasoning
so future contributors understand the design choices.

---

## Settled Architectural Decisions

### Architecture & System Foundations

**D1 — Nise is its own repository and consumes the brand.**  
Token and component decisions that the brand leaves open belong here; palette, typefaces,
icon grid, and core meaning-rules belong to `numena-brand` and are cited, not re-litigated.

**D2 — Plain CSS custom properties only: No Tailwind, no CSS-in-JS.**  
Matches the existing house system. Tokens are native CSS variables (`var(--token)`), ensuring
the runtime and the source agree without requiring a runtime CSS-in-JS library or build transforms.
Component styles live in standalone plain CSS files (`Component.css`).

**D3 — Tokens are authored in ESM (`tokens/*.mjs`) and generated CSS is committed.**  
The single source of truth is data in `tokens/*.mjs`. `npm run tokens:build` renders
`src/tokens/tokens.css`. Committing the generated CSS keeps the package consumable without
an upfront build step, while `npm run tokens:validate` diffs fresh generation against the commit
to prevent drift.

**D4 — Four strictly enforced layers with downward reference direction.**  
`primitive` $\rightarrow$ `semantic` $\rightarrow$ `themes` $\rightarrow$ `component`.  
The validator rejects any primitive referencing another token, any semantic token referencing
anything other than primitives, and any component token pointing upward. Themes are not a second
token set: they re-point the *same* semantic role names onto another ground (Light `:root`,
Dark `[data-theme="dark"]`). The token graph is proven strictly acyclic (`tokens/graph.mjs`).

**D5 — Status colours report machine states, never clinical judgements.**  
Status colours (`--color-success`, `--color-warning`, `--color-error`, `--color-info`) are
first-class system roles. In line with brand rules (`color.md §4`), colour is never the sole
indicator of state: an interface error or warning is text + an icon + a heavier boundary first,
colour last. Accents remain categorical emphasis, never verdicts.

**D6 — Radix primitives for complex ARIA; native HTML everywhere else.**  
Radix is adopted only when it solves genuinely difficult accessibility patterns: `Select`
(listbox semantics, typeahead, focus management, portals), `Slider` (range semantics, keyboard stepping),
`Tabs` (tablist/tabpanel roving tabindex), and `Dialog`/`Tooltip` (focus traps, dismissal, portals).
All other components use native HTML (`<button>`, `<input>`, `<table>`, etc.) to keep dependencies minimal.

**D7 — Storybook is the component documentation surface.**  
Component documentation and props are generated directly from TypeScript types
(`react-docgen-typescript`), preventing documentation drift. The Storybook a11y addon runs
axe-core audits per story in CI.

**D8 — Accessibility is verified two ways.**  
Mathematical contrast is proven analytically in the token validator (`tokens/validate.mjs` resolving
`color-mix` to sRGB); keyboard navigation, ARIA attributes, and roles are verified with axe-core
over rendered components in automated tests.

**D9 — Radius is declared at the point of use.**  
Components write `border-radius: var(--button-radius, var(--radius-md))` rather than a global
fixed radius, allowing individual component instances to be re-rounded locally while defaulting
to the design system primitive.

**D10 — Compositions test real UI with synthetic content.**  
Complex layout examples (like `InformationReview`) test how primitives and components compose on
clinical surfaces. Content is explicitly marked as synthetic; no actual clinical logic is executed.

---

### Explorer & Tooling

**D11 — Standalone Theme Explorer with local, safe promotion.**  
The Theme Explorer is an isolated Vite app (`npm run dev`), separate from Storybook. It reads
`tokens/*.mjs` directly so there is no duplicate token list. Overrides are scoped to preview
wrappers rather than `:root`. Browser exports produce versioned candidates, which are applied
locally via `npm run theme:apply`. Promotion validates contrast promises and rolls back changes
if any rule breaks.

**D12 & D13 — Zero external CSS frameworks: No Tailwind and no shadcn/ui.**  
The design system previews exclusively using Nise's own components. There are no external CSS
frameworks (Tailwind) or third-party vendored component trees (shadcn/ui). Every component is plain
CSS over tokens, with zero token-boundary exemptions.

**D14 — Standardized interaction state progressions.**  
Interactive states across controls follow coherent 3-step progressions:
- Surfaces: `--color-base-100` $\rightarrow$ `--color-base-hover` $\rightarrow$ `--color-base-active`
- Actions: `--color-primary` $\rightarrow$ `--color-primary-hover` $\rightarrow$ `--color-primary-active`
- Boundaries: `--color-border-strong` $\rightarrow$ `--color-border-hover` $\rightarrow$ `--color-focus-ring`

**D15 — Standard DTCG 2025.10 export.**  
`npm run tokens:build` automatically exports `tokens/dist/nise.tokens.json` in accordance with the
Design Tokens Community Group (DTCG) 2025.10 format, facilitating integration with external tooling
(like Figma / Tokens Studio) without imposing runtime overhead.

**D16 — Hardened verification pipeline.**  
Token boundary checks (`scripts/check-token-usage.mjs`) analyze full CSS declarations and JSX styles
(including multiline rules and `calc()` expressions) to guarantee zero off-token colours or raw pixels.
Acyclicity is mathematically proven across the entire token graph.

**D17 — Self-contained TypeScript build.**  
Type definitions and configurations are fully self-contained in the repository, ensuring `npm run typecheck`
and `npm run verify` pass consistently in clean CI environments without global dependency assumptions.

---

### Colour System & Active Palette

**D18 — OKLCH palette generation with immutable brand anchors.**  
The palette uses an OKLCH model (`tokens/palette.mjs`) to ensure perceptual uniformity. The ten published
brand hex values from `numena-brand` are preserved as immutable **anchors**. Surrounding scales
(neutral and purple tonal ladders) are generated with fixed lightness curves, while operational
status colors are authored and pinned.

**D19 — Two mappings of one semantic contract.**  
Light mode (`:root`) and Dark mode (`[data-theme="dark"]`) share identical role names. Dark mode is not
an inversion: it re-points the semantic roles onto dark surfaces (`--dark-ground`, `--dark-panel`) while
maintaining WCAG AA contrast compliance across every active role pair.

**D20 — DaisyUI-shaped role vocabulary: One name per role.**  
Nise settles on a clean, single set of semantic names:
- Surfaces: `--color-base-100`, `--color-base-200`, `--color-base-300`, `--color-base-content`, `--color-base-hover`, `--color-base-active`
- Actions: `--color-primary`, `--color-secondary`, `--color-accent`, `--color-neutral` (each with `-content`)
- Status: `--color-success`, `--color-warning`, `--color-error`, `--color-info` (each with `-content`)
- Supporting: `--color-text-muted`, `--color-border`, `--color-border-strong`, `--color-border-hover`, `--color-border-error`, `--color-focus-ring`, `--color-scrim`, `--color-link`
- Tints: `--color-tint-purple`, `--color-tint-cyan`, `--color-tint-tangerine`

There are no deprecated aliases (e.g. `--color-surface` or `--color-action`) to prevent dialect drift.

**D21 — Perceptual distinguishability guard (CIEDE2000 $\Delta E \ge 10$).**  
All fill and status roles are required to maintain a perceptual color distance of at least
$\Delta E_{2000} \ge 10$ from every other role in both Light and Dark themes. This mathematical guard
prevents functional color collisions (such as info cyan colliding with secondary violet).

**D22 — Semantic roles directly reflect active brand and lavender foundations.**  
- **Surfaces**: `--color-base-100` is pure `--white` (`#FFFFFF`). Raised surfaces and panels form a harmonious lavender ladder: `--color-base-200` (`#f4f1f8`), hover (`#eae5f1`), and panels/active (`#dfd8e8`). Dark ground reads `--dark-ground` (`#17121D`) and `--dark-panel` (`#2D2238`).
- **Body text**: `--color-base-content` reads `--ink-plum` (`#221A2A`) with a 16.8:1 contrast ratio against the page.
- **Primary & Secondary**: `--color-primary` reads `--deep-purple` (`#4C207F`) with white text (10.8:1); `--color-secondary` reads `--vibrant-purple` (`#8E36F4`).
- **Accent**: `--color-accent` reads `--accent-violet` (`#AB62ED`) with `--ink-plum` text (4.56:1 AA compliant).
- **Status roles**: Authored functional anchors:
  - Success: Mint (`#147061` / `#20B098`)
  - Warning: Citron / Orange (`#873612` / `#DF6E39`)
  - Error: Pink (`#D10057` / `#FF5CA8`)
  - Info: Blue (`#1F6492` / `#4FA5E8`)

**D23 — Primary button edge rim and elevation lip.**  
The primary solid button features a hairline darker boundary (`border-color: var(--color-primary-edge)`)
and a hard 1px ink shadow (`box-shadow: var(--shadow-lip)`), grounding the primary action without relying
on blurry drop shadows.

---

## Provisional

**P1 — Type scale, weights, and line heights.**  
Typography follows a standard `xs` to `4xl` ramp based on Inter. Brand guidelines leave sizing open for
real layout testing.

**P2 — Spacing and Radii scale.**  
A 4px spacing grid (`--space-1` = 4px up to `--space-24` = 96px) and five radius steps: `--radius-sm` (4px: checkboxes, compact controls), `--radius-md` (8px: buttons, inputs, cards, popovers), `--radius-lg` (12px: dialogs, drawers, larger panels), `--radius-xl` (16px: prominent containers, hero surfaces), and `--radius-full` (9999px: pills, badges, circular avatars).

**P3 — Iconography set.**  
A 24px grid with 1.5px stroke weight. Icons are added on demand as needed by clinical workflows.

---

## Deferred

- **Visual regression testing (Playwright / Chromatic)**: Deferred until multi-application consumption begins.
- **Package registry publishing**: Deferred while Nise is consumed within the primary monorepo/workspace.
- **Multi-brand theming**: Architecture supports third-party themes, but active implementation remains focused on Numena Light and Dark.
