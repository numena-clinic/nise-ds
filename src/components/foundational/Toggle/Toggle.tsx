/* =============================================================================
   Toggle
   -----------------------------------------------------------------------------
   A two-state pressed button: a toolbar mode, a filter, a transcript layer that
   can be switched on and off. Backed by Base UI (`Toggle`).

   Tokens consumed (component layer → semantic → primitive):
      --button-height-{sm,md,lg}      → --control-height-* → literal px
      --button-padding-x-{sm,md}      → --space-*
      --button-font-size-{sm,md,lg}   → --font-size-*
      --button-gap                    → --space-2
      --color-primary, --color-base-hover / -active,
      --color-selected-surface, --color-selected-text,
      --color-focus-ring, --focus-ring-width, --opacity-disabled,
      --duration-fast, --ease-standard, --border-width
   ============================================================================= */

import {
  Children,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { cva } from "class-variance-authority";
import { cn } from "../../../lib/cn";

export type ToggleVariant = "default" | "outline";
export type ToggleSize = "sm" | "md" | "lg" | "icon";

export const toggleVariants = cva(
  [
    "nise-toggle",
    "inline-flex items-center justify-center shrink-0 select-none cursor-pointer",
    "font-sans font-[var(--font-weight-medium)] leading-[var(--line-height-tight)] whitespace-nowrap",
    "gap-[var(--button-gap)] rounded-[var(--button-radius,var(--radius-md))]",
    "border border-solid border-transparent bg-transparent text-base-content",
    "transition-[background-color,border-color,color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
    "hover:not-disabled:bg-base-hover active:not-disabled:bg-base-active",
    "data-[pressed]:bg-selected-surface data-[pressed]:text-selected-text data-[pressed]:border-border-strong",
    "disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed",
  ],
  {
    variants: {
      variant: {
        default: "nise-toggle--default border-transparent",
        outline: "nise-toggle--outline border-border-strong bg-base-100",
      },
      size: {
        sm: "nise-toggle--sm h-[var(--button-height-sm)] px-[var(--button-padding-x-sm)] text-[length:var(--button-font-size-sm)]",
        md: "nise-toggle--md h-[var(--button-height-md)] px-[var(--button-padding-x-md)] text-[length:var(--button-font-size-md)]",
        lg: "nise-toggle--lg h-[var(--button-height-lg)] px-[var(--button-padding-x-lg)] text-[length:var(--button-font-size-lg)]",
        icon: "nise-toggle--icon size-[var(--button-height-md)] p-0",
      },
      iconOnly: {
        true: "nise-toggle--icon px-0 aspect-square",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      iconOnly: false,
    },
  },
);

/** Check if a node is an SVG or icon element rather than textual content */
export function isIconChild(node: ReactNode): boolean {
  if (!isValidElement(node)) return false;
  if (typeof node.type === "string") return node.type === "svg";
  const comp = node.type as { displayName?: string; name?: string };
  const name = comp.displayName || comp.name || "";
  if (name.endsWith("Icon") || name === "Icon") return true;
  const props = node.props as Record<string, unknown> | undefined;
  if (
    props?.["aria-hidden"] === true ||
    props?.["aria-hidden"] === "true" ||
    props?.role === "img"
  ) {
    return true;
  }
  return false;
}

export interface ToggleProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "className" | "onChange" | "value"
  > {
  value?: string;
  /** Visual variant. "default" is a ghost-like tile; "outline" adds a border. */
  variant?: ToggleVariant;
  /** Controlled press state. Omit it to manage the state internally. */
  pressed?: boolean;
  isSelected?: boolean;
  /** Initial press state when the component is uncontrolled. */
  defaultPressed?: boolean;
  defaultSelected?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  onChange?: (pressed: boolean) => void;
  size?: ToggleSize;
  /** Explicitly mark button as icon-only (renders square geometry). */
  iconOnly?: boolean;
  isDisabled?: boolean;
  /** Label text, or an icon followed by the text. */
  children?: ReactNode;
  className?: string;
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
  const controlledPressed = pressed !== undefined ? pressed : isSelected;
  const initialPressed =
    defaultSelected !== undefined ? defaultSelected : defaultPressed;
  const effectivelyDisabled = disabled ?? isDisabled;

  const childArray = Children.toArray(children);
  const autoIconOnly =
    iconOnly ??
    (size === "icon" ||
      (childArray.length === 1 && isIconChild(childArray[0])));

  return (
    <BaseToggle
      {...rest}
      ref={ref}
      pressed={controlledPressed}
      defaultPressed={initialPressed}
      disabled={effectivelyDisabled}
      onPressedChange={(next) => {
        onPressedChange?.(next);
        onChange?.(next);
      }}
      className={cn(
        toggleVariants({ variant, size, iconOnly: autoIconOnly }),
        className,
      )}
    >
      {children}
    </BaseToggle>
  );
});
