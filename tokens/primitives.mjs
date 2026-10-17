// ─────────────────────────────────────────────────────────────────────────────
// token source: same objects as src/tokens/tokens.css, as data.
//
// This module is the CANONICAL SOURCE for the primitive layer. `npm run
// tokens:build` renders it into src/tokens/tokens.css (the artifact the app
// ships). Never edit the CSS by hand — it is overwritten.
//
// PRIMITIVE = a raw value with no opinion about where it is used. This is the
// only file that authors a literal (hex, px, ms). Every other layer references
// these through `var(...)`. See docs/tokens.md.
//
// Colour provenance: numena-brand docs/visual-identity/color.md §2 — the ten
// brand colours, values unchanged. The type scale, spacing scale, radii,
// shadows and durations are the design system's own contribution and are
// PROVISIONAL (the brand leaves them to the design system).
// ─────────────────────────────────────────────────────────────────────────────

/** @typedef {{ label: string, note?: string, tokens: Record<string, string> }} Group */

/** Brand palette — foundation, expression, supporting tints (color.md §2). */
export const color = {
  "--white": "#FFFFFF",
  "--deep-purple": "#4C207F",
  "--ink-plum": "#221A2A",
  "--pale-lavender": "#EEE9F3",
  "--vibrant-purple": "#8E36F4",
  "--vibrant-cyan": "#25E4F8",
  "--vibrant-tangerine": "#F57A44",
  "--soft-purple": "#E8D7FD",
  "--soft-cyan": "#D3FAFE",
  "--soft-tangerine": "#FDE4DA",
};

/** Type families (typography.md §3) plus a provisional scale and weights. */
export const typography = {
  "--font-sans":
    '"Albert Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  "--font-serif": '"Tiempos Text", Georgia, "Times New Roman", serif',
  "--font-size-xs": "12px",
  "--font-size-sm": "14px",
  "--font-size-md": "16px",
  "--font-size-lg": "18px",
  "--font-size-xl": "20px",
  "--font-size-2xl": "24px",
  "--font-size-3xl": "30px",
  "--font-size-4xl": "36px",
  "--line-height-tight": "1.15",
  "--line-height-snug": "1.3",
  "--line-height-normal": "1.5",
  "--line-height-relaxed": "1.65",
  "--font-weight-regular": "400",
  "--font-weight-medium": "500",
  "--font-weight-semibold": "600",
  "--font-weight-bold": "700",
  "--letter-spacing-tight": "-0.01em",
  "--letter-spacing-wide": "0.02em",
};

/** 4px base spacing scale. */
export const space = {
  "--space-1": "4px",
  "--space-2": "8px",
  "--space-3": "12px",
  "--space-4": "16px",
  "--space-5": "20px",
  "--space-6": "24px",
  "--space-8": "32px",
  "--space-10": "40px",
  "--space-12": "48px",
  "--space-16": "64px",
  "--space-24": "96px",
};

export const radii = {
  "--radius-sm": "4px",
  "--radius-md": "8px",
  "--radius-lg": "12px",
  "--radius-xl": "16px",
  "--radius-full": "9999px",
};

/** Reading/measure widths for content columns (typography.md §8, line length;
 * the exact value is determined by testing in the real layout). */
export const layout = {
  "--measure-prose": "68ch",
  "--measure-form": "32rem",
};

export const border = {
  "--border-width": "1px",
  "--border-width-strong": "2px",
};

/** One elevation for cards, one for floating surfaces. */
export const elevation = {
  "--shadow-sm": "0 1px 2px rgb(34 26 42 / 0.06)",
  "--shadow-md": "0 4px 16px rgb(34 26 42 / 0.08)",
};

/** Temporal restraint (motion-generative-patterns.md, Motion principles §04). */
export const motion = {
  "--duration-fast": "120ms",
  "--duration-medium": "200ms",
  "--duration-slow": "320ms",
  "--ease-standard": "cubic-bezier(0.2, 0, 0, 1)",
  "--ease-entrance": "cubic-bezier(0.16, 1, 0.3, 1)",
};

/** @type {Group[]} Output order follows this array. */
export const primitiveGroups = [
  {
    label: "colour",
    note: "Brand palette (color.md §2) — the only place hex values are authored.",
    tokens: color,
  },
  {
    label: "typography",
    note: "Families from typography.md §3; scale and weights are provisional.",
    tokens: typography,
  },
  { label: "spacing", note: "4px base.", tokens: space },
  { label: "radius", tokens: radii },
  { label: "layout", tokens: layout },
  { label: "border", tokens: border },
  { label: "elevation", tokens: elevation },
  { label: "motion", tokens: motion },
];

/** Flattened primitive values, for reference resolution and validation. */
export const primitives = Object.assign({}, ...primitiveGroups.map((g) => g.tokens));
