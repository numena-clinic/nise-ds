/* =============================================================================
   Toggle
   -----------------------------------------------------------------------------
   A two-state pressed button: a toolbar mode, a filter, a transcript layer that
   can be switched on and off. It is an `aria-pressed` button, not a checkbox
   and not a switch — the state it owns belongs to the surface it acts on, not
   to a form submission.

   The pressed state is a SELECTION, not a status: it draws the validated
   selected pair (`--color-selected-surface` under `--color-selected-text`) and
   nothing else — no glyph, no difference in weight. Pressed and unpressed
   differ by tile AND tile-text, never by color alone: the unpressed rest is a
   ghost-like tile (transparent fill, `--color-primary` label), so the two
   states remain distinguishable without color perception.

   Tokens consumed (component layer → semantic → primitive):
      --button-height-{sm,md,lg}      → --control-height-* → literal px
      --button-padding-x-{sm,md}      → --space-*
      --button-font-size-{sm,md,lg}   → --font-size-*
      --button-gap                    → --space-2
      --color-primary, --color-base-hover / -active,
      --color-selected-surface, --color-selected-text,
      --color-focus-ring, --focus-ring-width, --opacity-disabled,
      --duration-fast, --ease-standard, --border-width

   Radius is declared at the point of use as `var(--button-radius,
   var(--radius-md))`, so a surface can re-round one toggle without a new token.

   Accessibility: a real <button type="button">; `aria-pressed` always reflects
   the state (controlled or uncontrolled); the focus ring is drawn from
   `:focus-visible` only; disabled is inert (native disabled).
   ============================================================================= */

import {
  forwardRef,
  isValidElement,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import "./Toggle.css";

export type ToggleVariant = "default" | "outline";
export type ToggleSize = "sm" | "md" | "lg" | "icon";

export interface ToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "aria-pressed"> {
  /** Visual variant. "default" is a ghost-like tile; "outline" adds a border. */
  variant?: ToggleVariant;
  /** Controlled press state. Omit it to manage the state internally. */
  pressed?: boolean;
  /** Initial press state when the component is uncontrolled. */
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  size?: ToggleSize;
  /** Label text, or an icon followed by the text. */
  children?: ReactNode;
  className?: string;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    variant = "default",
    pressed,
    defaultPressed = false,
    onPressedChange,
    size = "md",
    disabled,
    type = "button",
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  const [internalPressed, setInternalPressed] = useState(defaultPressed);
  const controlled = pressed !== undefined;
  const isPressed = controlled ? pressed : internalPressed;

  const isIconOnly =
    size === "icon" ||
    (isValidElement(children) && !Array.isArray(children));

  const classes = [
    "nise-toggle",
    `nise-toggle--${variant}`,
    `nise-toggle--${size === "icon" ? "md" : size}`,
    isIconOnly ? "nise-toggle--icon" : null,
    isPressed ? "nise-toggle--pressed" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const next = !isPressed;
    if (!controlled) setInternalPressed(next);
    onPressedChange?.(next);
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      aria-pressed={isPressed}
      disabled={disabled}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
});
