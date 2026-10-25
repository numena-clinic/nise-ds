/* =============================================================================
   Alert
   -----------------------------------------------------------------------------
   A status banner for a machine state: none, info, success, warning, error.
   It reports what the system knows, never a verdict — "the palette does not
   establish fixed colors for clinical observations, evidence, hypotheses,
   decisions, or system statuses" (color.md §4), so the words in it must carry
   the meaning on their own.

   Color is never the only signal (color.md §4): each status variant carries
   the state in text (the title), a default icon drawn per variant, and a
   status-colored hairline boundary — remove any one channel and the banner
   still reads as its state. Body text always stays `--color-base-content`
   so the copy stays readable over the surface.

   Tokens consumed:
      --alert-padding, --alert-gap → --space-4, --space-3
      --color-base-100, --color-base-200, --color-base-content
      --color-success/-content, --color-warning, --color-error, --color-info,
      --color-border
   ============================================================================= */

import type { HTMLAttributes, ReactNode } from "react";
import { AlertIcon, InfoIcon } from "../../icons";
import "./Alert.css";

export type AlertVariant = "neutral" | "info" | "success" | "warning" | "error";

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
  const classes = ["nise-alert", `nise-alert--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div {...rest} role="alert" className={classes}>
      <span className="nise-alert__icon" aria-hidden="true">
        {icon ?? DEFAULT_ICONS[variant]}
      </span>
      <span className="nise-alert__content">
        {title != null ? <p className="nise-alert__title">{title}</p> : null}
        {children != null ? <p className="nise-alert__body">{children}</p> : null}
      </span>
    </div>
  );
}
