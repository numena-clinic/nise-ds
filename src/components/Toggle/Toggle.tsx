/* =============================================================================
   Toggle
   -----------------------------------------------------------------------------
   A two-state pressed button: a toolbar mode, a filter, a transcript layer that
   can be switched on and off. Backed by React Aria Components (ToggleButton)
   as the headless foundation.

   It is an `aria-pressed` button, not a checkbox and not a switch — the state
   it owns belongs to the surface it acts on, not to a form submission.

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
  type ReactNode,
} from "react";
import {
  ToggleButton as RACToggleButton,
  type ToggleButtonProps as RACToggleButtonProps,
} from "react-aria-components";
import "./Toggle.css";

export type ToggleVariant = "default" | "outline";
export type ToggleSize = "sm" | "md" | "lg" | "icon";

export interface ToggleProps
  extends Omit<RACToggleButtonProps, "className" | "children"> {
  /** Visual variant. "default" is a ghost-like tile; "outline" adds a border. */
  variant?: ToggleVariant;
  /** Controlled press state. Omit it to manage the state internally. */
  pressed?: boolean;
  /** Initial press state when the component is uncontrolled. */
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  size?: ToggleSize;
  /** Explicitly mark button as icon-only (renders square geometry). */
  iconOnly?: boolean;
  /** Label text, or an icon followed by the text. */
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}

/** Check if a node is an SVG or icon element rather than textual content */
function isIconChild(node: ReactNode): boolean {
  if (!isValidElement(node)) return false;
  if (typeof node.type === "string") return node.type === "svg";
  const comp = node.type as { displayName?: string; name?: string };
  const name = comp.displayName || comp.name || "";
  if (name.endsWith("Icon") || name === "Icon") return true;
  const props = node.props as Record<string, unknown> | undefined;
  if (props?.["aria-hidden"] === true || props?.["aria-hidden"] === "true" || props?.role === "img") {
    return true;
  }
  return false;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    variant = "default",
    pressed,
    isSelected,
    defaultPressed = false,
    defaultSelected,
    onPressedChange,
    onChange,
    size = "md",
    iconOnly,
    disabled,
    isDisabled,
    className,
    children,
    ...rest
  },
  ref,
) {
  const effectivelyDisabled = disabled ?? isDisabled;
  const controlledSelected = pressed !== undefined ? pressed : isSelected;
  const initialSelected = defaultSelected !== undefined ? defaultSelected : defaultPressed;

  const handleChange = (selected: boolean) => {
    onPressedChange?.(selected);
    onChange?.(selected);
  };

  const isIconOnly =
    iconOnly !== undefined
      ? iconOnly
      : size === "icon" ||
        (isValidElement(children) && !Array.isArray(children) && isIconChild(children));

  return (
    <RACToggleButton
      ref={ref}
      isSelected={controlledSelected}
      defaultSelected={initialSelected}
      onChange={handleChange}
      isDisabled={effectivelyDisabled}
      className={({ isSelected: activeSelected, isDisabled: buttonDisabled }) =>
        [
          "nise-toggle",
          `nise-toggle--${variant}`,
          `nise-toggle--${size === "icon" ? "md" : size}`,
          isIconOnly ? "nise-toggle--icon" : null,
          activeSelected ? "nise-toggle--pressed" : null,
          buttonDisabled ? "nise-toggle--disabled" : null,
          className,
        ]
          .filter(Boolean)
          .join(" ")
      }
      {...rest}
    >
      {children}
    </RACToggleButton>
  );
});
