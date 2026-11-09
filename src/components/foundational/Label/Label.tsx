/* =============================================================================
   Label
   -----------------------------------------------------------------------------
   The standalone form label — the same control labels that TextField and
   Textarea render, for when the labelled control is composed by hand.

   Tokens consumed (component layer → semantic → primitive):
      --field-label-gap               → --space-1
      --font-size-{xs,sm}, --font-weight-*, --line-height-snug
      --color-base-content, --color-text-muted, --color-link
   ============================================================================= */

import type { HTMLAttributes, ReactNode } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../../lib/cn";

export type LabelSize = "sm" | "md";

const labelVariants = cva(
  [
    "nise-label",
    "inline-flex items-baseline gap-[var(--field-label-gap)] font-sans font-[var(--font-weight-medium)] leading-[var(--line-height-snug)] text-base-content",
  ],
  {
    variants: {
      size: {
        sm: "nise-label--sm text-[length:var(--font-size-xs)]",
        md: "nise-label--md text-[length:var(--font-size-sm)]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface LabelProps extends Omit<HTMLAttributes<HTMLLabelElement>, "className"> {
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
  /** Short supporting text, rendered muted after the label. */
  hint?: string;
  size?: LabelSize;
  className?: string;
}

export function Label({
  htmlFor,
  children,
  required,
  hint,
  size = "md",
  className,
  ...rest
}: LabelProps) {
  return (
    <label className={cn(labelVariants({ size }), className)} htmlFor={htmlFor} {...rest}>
      <span>{children}</span>
      {hint != null ? (
        <span className="nise-label__hint font-[var(--font-weight-regular)] text-text-muted">
          {hint}
        </span>
      ) : null}
      {required ? (
        <span className="nise-label__required text-error" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}
