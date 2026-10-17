/* =============================================================================
   Button
   -----------------------------------------------------------------------------
   An action. The single affirmative action in a view is `primary`; everything
   else is `secondary` (a bordered alternative) or `ghost` (an in-place action
   such as a row toolbar).

   Tokens consumed (component layer → semantic → primitive):
     --button-height-{sm,md,lg}      → --control-height-* → literal px
     --button-padding-x-{sm,md,lg}   → --space-*          → literal px
     --button-font-size-{sm,md,lg}   → --font-size-*      → literal px
     --button-gap                    → --space-2
     --color-action / -hover / -active / -action-text, --color-surface,
     --color-surface-subtle, --color-selected-surface, --color-border-strong
     --opacity-disabled, --duration-fast, --ease-standard, --border-width

   Radius is declared at the point of use as `var(--button-radius,
   var(--radius-md))`, so a surface can re-round one button without a new token.

   Accessibility: a real <button>; disabled buttons are inert (native
   disabled); `loading` sets aria-busy and blocks re-activation, and its spinner
   is aria-hidden so the label stays the accessible name.
   ============================================================================= */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the width of the container. */
  fullWidth?: boolean;
  /** Show a spinner and prevent activation while keeping the label visible. */
  loading?: boolean;
  /** Decorative icon before the label. */
  leftIcon?: ReactNode;
  /** Decorative icon after the label. */
  rightIcon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    type = "button",
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [
    "nise-button",
    `nise-button--${variant}`,
    `nise-button--${size}`,
    fullWidth ? "nise-button--full" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span className="nise-button__spinner" aria-hidden="true" />
      ) : leftIcon ? (
        <span className="nise-button__icon" aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}
      <span className="nise-button__label">{children}</span>
      {!loading && rightIcon ? (
        <span className="nise-button__icon" aria-hidden="true">
          {rightIcon}
        </span>
      ) : null}
    </button>
  );
});
