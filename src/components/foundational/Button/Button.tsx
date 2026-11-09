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
     --color-primary / -hover / -active / -content,
     --color-base-100 / -hover / -active, --color-border-strong, --color-border-hover,
     --opacity-disabled, --duration-fast, --ease-standard, --border-width

   Radius is declared at the point of use as `var(--button-radius,
   var(--radius-md))`, so a surface can re-round one button without a new token.

   Accessibility: a real <button>; disabled buttons are inert (native
   disabled); `loading` sets aria-busy and blocks re-activation, and its spinner
   is aria-hidden so the label stays the accessible name.
   ============================================================================= */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export const buttonVariants = cva(
  [
    "nise-button",
    "inline-flex items-center justify-center shrink-0 select-none cursor-pointer",
    "font-sans font-[var(--font-weight-medium)] leading-[var(--line-height-tight)] whitespace-nowrap",
    "gap-[var(--button-gap)] rounded-[var(--button-radius,var(--radius-md))]",
    "border border-solid border-transparent",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
    "active:not-disabled:translate-y-px",
    "disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed",
  ],
  {
    variants: {
      variant: {
        primary: [
          "nise-button--primary",
          "bg-primary text-primary-content border-primary-edge shadow-[var(--shadow-lip)]",
          "hover:not-disabled:bg-primary-hover hover:not-disabled:border-primary-hover",
          "active:not-disabled:bg-primary-active active:not-disabled:border-primary-active active:not-disabled:shadow-none",
        ],
        secondary: [
          "nise-button--secondary",
          "bg-base-100 text-base-content border-border-strong",
          "hover:not-disabled:bg-base-hover hover:not-disabled:border-border-hover",
          "active:not-disabled:bg-base-active",
        ],
        ghost: [
          "nise-button--ghost",
          "bg-transparent text-base-content border-transparent",
          "hover:not-disabled:bg-base-hover",
          "active:not-disabled:bg-base-active",
        ],
      },
      size: {
        sm: [
          "nise-button--sm",
          "h-[var(--button-height-sm)] px-[var(--button-padding-x-sm)] text-[length:var(--button-font-size-sm)]",
        ],
        md: [
          "nise-button--md",
          "h-[var(--button-height-md)] px-[var(--button-padding-x-md)] text-[length:var(--button-font-size-md)]",
        ],
        lg: [
          "nise-button--lg",
          "h-[var(--button-height-lg)] px-[var(--button-padding-x-lg)] text-[length:var(--button-font-size-lg)]",
        ],
      },
      fullWidth: {
        true: "nise-button--full w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

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
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span
          className="nise-button__spinner inline-block size-[1em] rounded-full border-[length:var(--border-width-strong)] border-current border-r-transparent animate-[nise-spin_var(--duration-slow)_linear_infinite]"
          aria-hidden="true"
        />
      ) : leftIcon ? (
        <span className="nise-button__icon inline-flex items-center justify-center shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}
      <span className="nise-button__label">{children}</span>
      {!loading && rightIcon ? (
        <span className="nise-button__icon inline-flex items-center justify-center shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      ) : null}
    </button>
  );
});
