/* =============================================================================
   Badge
   -----------------------------------------------------------------------------
   A short, non-interactive label: a category, a source type, a count. It sits
   beside content; it never carries an action.

   Tokens consumed:
     --badge-height-{sm,md}, --badge-padding-x-{sm,md}, --badge-font-size-{sm,md},
     --badge-gap, --badge-radius
     --color-selected-surface, --color-base-content, --color-tint-{purple,cyan,tangerine}
   ============================================================================= */

import type { ReactNode } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../../lib/cn";

export type BadgeTone = "neutral" | "purple" | "cyan" | "tangerine";
export type BadgeSize = "sm" | "md";

const badgeVariants = cva(
  [
    "nise-badge",
    "inline-flex items-center justify-center shrink-0 gap-[var(--badge-gap)] rounded-[var(--badge-radius)] font-sans font-[var(--font-weight-medium)] leading-none text-base-content whitespace-nowrap select-none",
  ],
  {
    variants: {
      tone: {
        neutral: "nise-badge--neutral bg-selected-surface",
        purple: "nise-badge--purple bg-tint-purple",
        cyan: "nise-badge--cyan bg-tint-cyan",
        tangerine: "nise-badge--tangerine bg-tint-tangerine",
      },
      size: {
        sm: "nise-badge--sm h-[var(--badge-height-sm)] px-[var(--badge-padding-x-sm)] text-[length:var(--badge-font-size-sm)]",
        md: "nise-badge--md h-[var(--badge-height-md)] px-[var(--badge-padding-x-md)] text-[length:var(--badge-font-size-md)]",
      },
    },
    defaultVariants: {
      tone: "neutral",
      size: "md",
    },
  },
);

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
  return (
    <span className={cn(badgeVariants({ tone, size }), className)}>
      {icon ? (
        <span className="nise-badge__icon inline-flex items-center shrink-0" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="nise-badge__label">{children}</span>
    </span>
  );
}
