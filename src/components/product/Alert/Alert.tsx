/* =============================================================================
   Alert
   -----------------------------------------------------------------------------
   A status banner for a machine state: neutral, info, success, warning, error.
   It reports what the system knows, never a verdict.

   Tokens consumed:
      --alert-padding, --alert-gap → --space-4, --space-3
      --color-base-100, --color-base-200, --color-base-content
      --color-success/-content, --color-warning, --color-error, --color-info,
      --color-border
   ============================================================================= */

import type { HTMLAttributes, ReactNode } from "react";
import { cva } from "class-variance-authority";
import { AlertIcon, InfoIcon } from "../../../icons";
import { cn } from "../../../lib/cn";

export type AlertVariant = "neutral" | "info" | "success" | "warning" | "error";

const alertVariants = cva(
  [
    "nise-alert",
    "flex items-start gap-[var(--alert-gap)] p-[var(--alert-padding)] font-sans text-base-content rounded-[var(--alert-radius,var(--radius-lg))] border border-solid",
  ],
  {
    variants: {
      variant: {
        neutral: "nise-alert--neutral bg-base-200 border-border",
        info: "nise-alert--info bg-[color-mix(in_srgb,var(--color-info)_10%,var(--color-base-100))] border-info [&_.nise-alert__icon]:text-info [&_.nise-alert__title]:text-info",
        success:
          "nise-alert--success bg-[color-mix(in_srgb,var(--color-success)_10%,var(--color-base-100))] border-success [&_.nise-alert__icon]:text-success [&_.nise-alert__title]:text-success",
        warning:
          "nise-alert--warning bg-[color-mix(in_srgb,var(--color-warning)_10%,var(--color-base-100))] border-warning [&_.nise-alert__icon]:text-warning [&_.nise-alert__title]:text-warning",
        error:
          "nise-alert--error bg-[color-mix(in_srgb,var(--color-error)_10%,var(--color-base-100))] border-[length:var(--border-width-strong)] border-error [&_.nise-alert__icon]:text-error [&_.nise-alert__title]:text-error",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** The machine state this banner reports. Not a clinical judgement. */
  variant?: AlertVariant;
  /** A short text summary of the state. */
  title?: ReactNode;
  /** Overrides the variant's default decorative icon. No icon renders for neutral. */
  icon?: ReactNode;
  /** The detail, rendered under the title; always `--color-base-content`. */
  children?: ReactNode;
  className?: string;
}

const DEFAULT_ICONS: Partial<Record<AlertVariant, ReactNode>> = {
  warning: <AlertIcon size={16} />,
  error: <AlertIcon size={16} />,
  info: <InfoIcon size={16} />,
  success: <InfoIcon size={16} />,
};

export function Alert({
  variant = "neutral",
  title,
  icon,
  children,
  className,
  ...rest
}: AlertProps) {
  const resolvedIcon = icon !== undefined ? icon : DEFAULT_ICONS[variant];

  return (
    <div {...rest} role="alert" className={cn(alertVariants({ variant }), className)}>
      {resolvedIcon ? (
        <span
          className="nise-alert__icon inline-flex items-center justify-center shrink-0 mt-[var(--control-label-gap)] text-base-content"
          aria-hidden="true"
        >
          {resolvedIcon}
        </span>
      ) : null}
      <span className="nise-alert__content flex flex-col gap-[var(--space-1)] min-w-0">
        {title != null ? (
          <p className="nise-alert__title m-0 text-[length:var(--font-size-sm)] font-[var(--font-weight-semibold)] leading-[var(--line-height-snug)] text-base-content">
            {title}
          </p>
        ) : null}
        {children != null ? (
          <p className="nise-alert__body m-0 text-[length:var(--font-size-sm)] leading-[var(--line-height-normal)] text-base-content">
            {children}
          </p>
        ) : null}
      </span>
    </div>
  );
}
