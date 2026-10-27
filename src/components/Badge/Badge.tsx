/* =============================================================================
   Badge
   -----------------------------------------------------------------------------
   A short, non-interactive label: a category, a source type, a count. It sits
   beside content; it never carries an action.

   `tone` is categorical emphasis, drawn from the brand's support tints. It is
   NOT a status or verdict: "the palette does not establish fixed colors for
   clinical observations, evidence, hypotheses, decisions, or system statuses"
   (color.md §4), and an icon or label must not "deliver a verdict"
   (iconography.md §5). If a badge needs to mean something, the words in it
   carry the meaning, not the color. The operational roles added by
   decisions.md P4 cover machine states (saved, failed) and are deliberately
   not `tone` options — a clinical reading of a tint is what both rules prevent.

   Tokens consumed:
     --badge-height-{sm,md}, --badge-padding-x-{sm,md}, --badge-font-size-{sm,md},
     --badge-gap, --badge-radius
       → --space-*, --font-size-*, --radius-full
     --color-selected-surface, --color-base-content, --color-tint-{purple,cyan,tangerine}
   ============================================================================= */

import type { ReactNode } from "react";
import "./Badge.css";

export type BadgeTone = "neutral" | "purple" | "cyan" | "tangerine";
export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  tone?: BadgeTone;
  size?: BadgeSize;
  /** Decorative leading icon. */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Badge({
  tone = "neutral",
  size = "md",
  icon,
  children,
  className,
}: BadgeProps) {
  const classes = ["nise-badge", `nise-badge--${tone}`, `nise-badge--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      {icon ? (
        <span className="nise-badge__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="nise-badge__label">{children}</span>
    </span>
  );
}
