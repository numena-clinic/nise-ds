# Tokens

Every visual value in Nise comes from a token. There are no raw colors, no
off-scale spacing, and no magic numbers in component code — `npm run check:usage`
fails the build if one appears.

## Four layers

```
primitive   raw values          →   what value?
   ↓
semantic    interface roles     →   what role?
   ↓
themes      the same roles, re-pointed onto another ground
   ↓
component   per-component use   →   where used?
```

- **Primitive** tokens are values with no opinion about use: `--deep-purple`,
  `--purple-600`, `--space-4`, `--radius-md`, `--duration-fast`. Spacing, radii,
  and motion are authored literals in `tokens/primitives.mjs`. Color primitives
  are generated or authored in `tokens/palette.mjs`.
- **Semantic** tokens are interface roles: `--color-base-100`, `--color-primary`,
  `--color-border`. A semantic token references a primitive — never restates a raw
  value. Derived colors (such as scrim or edge) use `color-mix()` of primitives so
  the dependency remains explicit.
- **Themes** are not a second token set. `tokens/themes.mjs` re-points the *same*
  role names onto another ground (Light is base `:root`; Dark is `[data-theme="dark"]`).
- **Component** tokens are values a component reads: `--button-height-md`,
  `--input-padding-x`, `--card-gap`. They reference primitives, semantics, or shared
  control slots.

`tokens/validate.mjs` enforces layer direction: primitives may not contain `var()` or
`color-mix()`; semantics only reference primitives; component tokens reference primitives,
semantics, or other component tokens. The reference graph is proven acyclic
(`tokens/graph.mjs`).

---

## The Active Color System

Nise uses a compact, daisyUI-shaped role vocabulary with exactly **one name per role**
(decisions.md D20). Every role is mapped in both **Light** and **Dark** modes.

### 1. Surfaces & Layout

The structural ladder for page, cards, and panels:

| Token | Light Value | Dark Value | Purpose |
| --- | --- | --- | --- |
| `--color-base-100` | `var(--white)` | `var(--dark-ground)` | Page background canvas |
| `--color-base-200` | `var(--neutral-50)` (`#f4f1f8`) | `var(--ink-plum)` | Raised cards and containers |
| `--color-base-300` | `var(--neutral-200)` (`#dfd8e8`) | `var(--dark-panel)` | Nested panels and wells |
| `--color-base-content` | `var(--ink-plum)` | `var(--neutral-50)` | Primary text on base surfaces |
| `--color-base-hover` | `var(--neutral-100)` (`#eae5f1`) | `var(--neutral-800)` | Surface hover state |
| `--color-base-active` | `var(--neutral-200)` (`#dfd8e8`) | `var(--neutral-700)` | Surface pressed/active state |

### 2. Actions & Emphasis Fills

Primary, secondary, accent, and neutral action fills with their required content pairs:

| Token | Light Value | Dark Value | Purpose |
| --- | --- | --- | --- |
| `--color-primary` | `var(--deep-purple)` | `var(--purple-400)` | Primary action fill |
| `--color-primary-hover` | `var(--purple-900)` | `var(--purple-300)` | Primary action hover |
| `--color-primary-active` | `var(--purple-950)` | `var(--purple-200)` | Primary action pressed |
| `--color-primary-edge` | `color-mix(in srgb, var(--deep-purple) 85%, var(--ink-plum))` | `color-mix(in srgb, var(--purple-400) 85%, var(--ink-plum))` | Action boundary rim |
| `--color-primary-content` | `var(--white)` | `var(--neutral-950)` | Label text on primary fill |
| `--color-secondary` | `var(--vibrant-purple)` | `var(--purple-200)` | Secondary action fill |
| `--color-secondary-content` | `var(--white)` | `var(--neutral-950)` | Label text on secondary fill |
| `--color-accent` | `var(--accent-violet)` (`#AB62ED`) | `var(--accent-violet)` | Violet accent fill |
| `--color-accent-content` | `var(--ink-plum)` | `var(--ink-plum)` | Label text on accent fill (4.56:1) |
| `--color-neutral` | `var(--ink-plum)` | `var(--neutral-800)` | Neutral action fill |
| `--color-neutral-content` | `var(--white)` | `var(--neutral-50)` | Label text on neutral fill |

### 3. Operational Status Roles

Status colors report machine state, **never clinical judgements**, and are never the sole
signal (brand `color.md §4`):

| Token | Light Value | Dark Value | Status Meaning |
| --- | --- | --- | --- |
| `--color-success` | `var(--mint-700)` (`#147061`) | `var(--mint-500)` (`#20B098`) | Success, confirmed, saved |
| `--color-success-content` | `var(--white)` | `var(--mint-950)` (`#0A2823`) | Label text on success badge/pill |
| `--color-warning` | `var(--citron-800)` (`#873612`) | `var(--citron-500)` (`#DF6E39`) | Warning, attention, caution |
| `--color-warning-content` | `var(--white)` | `var(--citron-950)` (`#331204`) | Label text on warning badge/pill |
| `--color-error` | `var(--pink-700)` (`#D10057`) | `var(--pink-500)` (`#FF5CA8`) | Error, failure, rejected |
| `--color-error-content` | `var(--white)` | `var(--pink-950)` (`#351629`) | Label text on error badge/pill |
| `--color-info` | `var(--blue-700)` (`#1F6492`) | `var(--blue-500)` (`#4FA5E8`) | Informational, system notice |
| `--color-info-content` | `var(--white)` | `var(--blue-950)` (`#0C2345`) | Label text on info badge/pill |

### 4. Supporting, Boundaries & Selection

| Token | Light Value | Dark Value | Purpose |
| --- | --- | --- | --- |
| `--color-text-muted` | `var(--neutral-700)` | `var(--neutral-400)` | Secondary text, captions, hints |
| `--color-border` | `var(--neutral-200)` | `var(--neutral-800)` | Subtle decorative dividers |
| `--color-border-strong` | `var(--neutral-600)` | `var(--neutral-400)` | Form controls & boundary lines (≥3:1) |
| `--color-border-hover` | `var(--neutral-700)` | `var(--neutral-500)` | Control boundary on hover |
| `--color-border-error` | `var(--pink-700)` | `var(--pink-500)` | Invalid control boundary |
| `--color-focus-ring` | `var(--purple-600)` | `var(--purple-300)` | Keyboard focus indicator ring |
| `--color-scrim` | `color-mix(in srgb, var(--neutral-950) 40%, transparent)` | `color-mix(in srgb, var(--neutral-950) 60%, transparent)` | Modal/drawer backdrop overlay |
| `--color-selected-surface`| `var(--neutral-100)` | `var(--neutral-800)` | Selected item background |
| `--color-selected-text` | `var(--purple-800)` | `var(--purple-200)` | Selected item text |
| `--color-link` | `var(--purple-700)` | `var(--purple-300)` | Interactive hyperlink text |
| `--color-link-hover` | `var(--purple-900)` | `var(--purple-200)` | Hyperlink text hover |

### 5. Categorical Tints

Light washes for categories and visual grouping. Tints provide subtle emphasis, **never verdicts**:

| Token | Light Value | Dark Value | Role |
| --- | --- | --- | --- |
| `--color-tint-purple` | `var(--purple-100)` | `var(--purple-900)` | Category wash (purple) |
| `--color-tint-cyan` | `var(--cyan-100)` | `var(--cyan-900)` | Category wash (cyan) |
| `--color-tint-tangerine`| `var(--tangerine-100)` | `var(--tangerine-900)` | Category wash (tangerine) |

### 6. Elevation & Shadows

Depth and layering for floating components:

| Token | Light Value | Dark Value |
| --- | --- | --- |
| `--shadow-sm` | `0 1px 2px rgb(34 26 42 / 0.06)` | `0 2px 4px rgb(0 0 0 / 0.4)` |
| `--shadow-md` | `0 4px 16px rgb(34 26 42 / 0.08)` | `0 8px 24px rgb(0 0 0 / 0.55)` |

---

## Brand Anchors

The ten brand anchors (from `numena-brand color.md §2`) plus two dark ground anchors
are fixed and immutable. Several directly back core semantic roles (decisions.md D22):

| Anchor | Published Hex | Roles Driven |
| --- | --- | --- |
| `--white` | `#FFFFFF` | `--color-base-100` (Light), fill content labels |
| `--ink-plum` | `#221A2A` | `--color-base-content` (Light), `--color-neutral` (Light), `--color-base-200` (Dark) |
| `--deep-purple` | `#4C207F` | `--color-primary` (Light) |
| `--vibrant-purple` | `#8E36F4` | `--color-secondary` (Light) |
| `--pale-lavender` | `#EEE9F3` | Brand foundation anchor, identity background |
| `--vibrant-tangerine`| `#F57A44` | Brand anchor, tint source |
| `--dark-ground` | `#17121D` | `--color-base-100` (Dark) |
| `--dark-panel` | `#2D2238` | `--color-base-300` (Dark) |
| `--vibrant-cyan` | `#25E4F8` | Marketing & identity; tint source |
| `--soft-purple` | `#E8D7FD` | Artwork / supporting |
| `--soft-cyan` | `#D3FAFE` | Artwork / supporting |
| `--soft-tangerine` | `#FDE4DA` | Artwork / supporting |

---

## Key System Rules

1. **Product components use semantic roles only.** Never write a raw hex or a direct
   scale step like `var(--neutral-400)` in component code. `npm run check:usage` enforces
   this across all component files.
2. **Every pair is contrast-verified.** All foreground/background combinations used in
   components are asserted in `tokens/semantic.mjs` (`contrastChecks`) and verified
   automatically in both Light and Dark themes:
   - Body text on surfaces: ≥ 16.8:1 (WCAG AA floor: 4.5:1)
   - Muted text on surfaces: ≥ 5.6:1
   - Links on surfaces: ≥ 6.3:1
   - Text on action fills: ≥ 5.4:1
   - Control boundaries: ≥ 3.0:1
   - Focus ring: ≥ 4.0:1
3. **Color is never the only carrier of meaning.** An interface error or warning is text +
   an icon + a heavier boundary first, color last.
4. **Radius is declared at the point of use.** Components write
   `border-radius: var(--button-radius, var(--radius-md))` so instances can be adjusted
   locally while defaulting to the scale primitive:

   | Token | Value | Target Roles |
   | :--- | :--- | :--- |
   | `--radius-sm` | `2px` | Checkboxes, micro-controls, inner indicators |
   | `--radius-md` | `4px` | Buttons, inputs, toggles, selects, tabs |
   | `--radius-lg` | `8px` | Cards, alerts, popovers, surface containers |
   | `--radius-xl` | `12px` | Dialogs, drawers, large panels |
   | `--radius-full` | `9999px` | Pills, badges, circular avatars |

5. **Spacing builds on a 4px grid with step multipliers.**  
   Spacing tokens are named by their **4px grid multiplier**, following the formula:
   $$\mathbf{--space\text{-}N = N \times 4\text{px}}$$

   > **Naming rule**: The number suffix $N$ is the grid multiplier, **not** raw pixels.  
   > For instance, `--space-1` is **4px** ($1 \times 4\text{px}$), and `--space-4` is **16px** ($4 \times 4\text{px}$, not 4px).

   | Token | Multiplier | Value | `rem` (16px base) | Typical Use |
   | :--- | :--- | :--- | :--- | :--- |
   | `--space-1` | $1 \times 4\text{px}$ | `4px` | `0.25rem` | Hairline gaps, badge insets, micro alignments |
   | `--space-2` | $2 \times 4\text{px}$ | `8px` | `0.5rem` | Button gap, input vertical padding, icon insets |
   | `--space-3` | $3 \times 4\text{px}$ | `12px` | `0.75rem` | Input horizontal padding, compact card gaps |
   | `--space-4` | $4 \times 4\text{px}$ | `16px` | `1rem` | Standard page gutters, body padding, dialog gap |
   | `--space-5` | $5 \times 4\text{px}$ | `20px` | `1.25rem` | Large button horizontal padding, modal gaps |
   | `--space-6` | $6 \times 4\text{px}$ | `24px` | `1.5rem` | Card padding, content blocks, panel insets |
   | `--space-8` | $8 \times 4\text{px}$ | `32px` | `2rem` | Section gaps, header padding, empty states |
   | `--space-10` | $10 \times 4\text{px}$ | `40px` | `2.5rem` | Large section dividers, hero margins |
   | `--space-12` | $12 \times 4\text{px}$ | `48px` | `3rem` | Major landmark margins, rhythm blocks |
   | `--space-16` | $16 \times 4\text{px}$ | `64px` | `4rem` | Expansive page header gutters |
   | `--space-24` | $24 \times 4\text{px}$ | `96px` | `6rem` | Maximum layout boundaries, hero containers |

   #### Why a 4px Base Grid Instead of Alternative Models?

   Nise selects a **4px base grid** over alternative models (such as an 8px-only grid, a 5px/10px decimal system, or continuous rem scales) based on five deliberate system requirements:

   1. **Micro-Hierarchy for Dense Clinical Workspaces**:  
      Clinical diagnostic interfaces require high information density—compact form stacks, tight data table cells, subtle badge insets, and icon-to-label gaps. An **8px-only model** is too coarse: jumping directly from 8px to 16px forces excessive negative space or awkward 0px crowding. Intermediate 4px and 12px steps (`--space-1` and `--space-3`) allow fine-grained grouping without breaking the global grid.
   2. **Nested Compatibility with the 8px Layout Standard**:  
      4px is an exact integer factor of 8px ($4 \times 2 = 8$). It does not compete with standard 8px macro page rhythm; it refines it. Every standard 8px breakpoint and gutter (8, 16, 24, 32, 48, 64) is an exact step on the scale.
   3. **Typographic Baseline & Icon Grid Alignment**:  
      Our type scale line-heights (16px, 20px, 24px, 28px, 32px) and standard icon bounding boxes (16px, 20px, 24px) are all multiples of 4px. A 4px grid guarantees vertical rhythm and prevents fractional subpixel blur on high-density displays.
   4. **Superior to Decimal (5px / 10px) Systems**:  
      Decimal systems do not divide cleanly into powers of 2, standard 16px root font sizes, or 24px icon viewboxes ($24 / 5 = 4.8\text{px}$). 4px divides evenly into all three.
   5. **Exact Quarter-`rem` Accessibility Scaling**:  
      At the standard 16px root font size, 4px equals exactly **`0.25rem`** ($1/4\text{rem}$), 8px is `0.5rem`, 12px is `0.75rem`, and 16px is `1.0rem`. Every step maps to a clean two-digit decimal quarter fraction, allowing proportional browser font scaling and zoom (WCAG 1.4.4) without rounding jitter.


---

## Adding or Changing Tokens

1. Edit the source of truth in `tokens/*.mjs`:
   - Primitive values → `tokens/primitives.mjs` or `tokens/palette.mjs`
   - Semantic roles (Light) → `tokens/semantic.mjs`
   - Theme mappings (Dark) → `tokens/themes.mjs`
   - Component tokens → `tokens/component.mjs`
2. Run `npm run tokens:build` to regenerate `src/tokens/tokens.css` and the DTCG export.
3. Run `npm run verify` to check token validity, acyclicity, contrast promises, lint,
   typecheck, and tests.
4. Commit both the source changes and the regenerated `src/tokens/tokens.css`.

## DTCG Interchange Export

`npm run tokens:build` generates `tokens/dist/nise.tokens.json`, formatted to the
**DTCG 2025.10** Final Community Group Report. This file provides an interchange artifact
for external design token tools (e.g. Tokens Studio) without affecting the runtime library.
