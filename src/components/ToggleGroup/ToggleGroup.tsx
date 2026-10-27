/* =============================================================================
   ToggleGroup
   -----------------------------------------------------------------------------
   A set of Toggle-style pressed buttons sharing one state: `single` keeps a
   session view on exactly one layer (the pressed item mirrors `value`), `multi`
   keeps a set (array membership). It is a selection group for toolbars and
   filters — not a radio group over a form field, and not a Tabs row: the items
   do not reveal panels and every item toggles on its own face, so each is a
   real button with `aria-pressed`.

   The container renders `role="group"` named by the required `label` prop. The
   item's pressed state is a SELECTION (the validated selected pair — see
   Toggle); pressed and unpressed differ by tile AND tile-text, never color
   alone.

   Value semantics mirror the controlled/uncontrolled split the group needs:
   pass `value` to own the state (clicks call `onValueChange` only and
   `aria-pressed` reflects `value`), or pass `defaultValue` to let it manage
   itself (clicks update internally and also call `onValueChange`). In `single`
   mode one value is always pressed once chosen; in `multi` mode a pressed item
   leaves the set when clicked again. Items are disabled per item; for this
   pass they keep their natural tab order.

   Tokens consumed (component layer → semantic → primitive): the same slots as
   Toggle — --toggle-group-gap → --space-1 for the container, and on each item
   --button-height-{sm,md,lg}, --button-padding-x-{sm,md}, --button-font-size-*,
   --button-gap, --color-primary, --color-base-hover / -active,
   --color-selected-surface, --color-selected-text, --color-focus-ring,
   --focus-ring-width, --opacity-disabled, --duration-fast, --ease-standard,
   --border-width.
   ============================================================================= */

import {
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import type { ToggleSize, ToggleVariant } from "../Toggle/Toggle";
import "./ToggleGroup.css";

export type ToggleGroupType = "single" | "multi" | "multiple";

export interface ToggleGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "onChange"> {
  /** "single" keeps one layer pressed (the default); "multi" (or "multiple") keeps a set. */
  type?: ToggleGroupType;
  /** Visual variant. "default" is a ghost-like tile; "outline" adds a border. */
  variant?: ToggleVariant;
  /** Current selection. Controlled when given; a string for `single`, an array for `multi`. */
  value?: string | string[];
  /** Initial selection when uncontrolled. */
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  size?: ToggleSize;
  /** Accessible name for the group, announced as the group's label. */
  label: string;
  /** The ToggleGroupItem children. */
  children?: ReactNode;
  className?: string;
}

interface ToggleGroupContextValue {
  size: ToggleSize;
  variant: ToggleVariant;
  isPressed: (value: string) => boolean;
  onPress: (value: string) => void;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup(
    {
      type = "single",
      variant = "default",
      value,
      defaultValue,
      onValueChange,
      size = "md",
      label,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const isMultiMode = type === "multi" || type === "multiple";
    const [internal, setInternal] = useState<string | string[]>(
      defaultValue ?? (isMultiMode ? [] : ""),
    );

    const controlled = value !== undefined;
    const current = controlled ? value : internal;
    const currentValues = Array.isArray(current) ? current : current !== "" ? [current] : [];

    const isPressed = (itemValue: string) =>
      !isMultiMode ? currentValues[0] === itemValue : currentValues.includes(itemValue);

    const onPress = (itemValue: string) => {
      const values = Array.isArray(current) ? current : [];
      const next: string | string[] = isMultiMode
        ? values.includes(itemValue)
          ? values.filter((v) => v !== itemValue)
          : [...values, itemValue]
        : itemValue;
      if (!controlled) setInternal(next);
      onValueChange?.(next);
    };

    const classes = [
      "nise-toggle-group",
      `nise-toggle-group--${variant}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <ToggleGroupContext.Provider value={{ size, variant, isPressed, onPress }}>
        <div ref={ref} role="group" aria-label={label} className={classes} {...rest}>
          {children}
        </div>
      </ToggleGroupContext.Provider>
    );
  },
);

export interface ToggleGroupItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "className" | "aria-pressed"> {
  value: string;
  /** Visual variant. Defaults to the group's variant. */
  variant?: ToggleVariant;
  size?: ToggleSize;
  /** Visible content used when no children are given. */
  label?: string;
  children?: ReactNode;
  className?: string;
}

export const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  function ToggleGroupItem(
    {
      value,
      variant: itemVariantProp,
      size: itemSizeProp,
      label,
      disabled,
      type = "button",
      className,
      children,
      onClick,
      ...rest
    },
    ref,
  ) {
    const group = useContext(ToggleGroupContext);
    const isPressed = group ? group.isPressed(value) : false;
    const variant = itemVariantProp ?? group?.variant ?? "default";
    const size = itemSizeProp ?? group?.size ?? "md";
    const content = children ?? label;
    const isIconOnly =
      size === "icon" ||
      (isValidElement(content) && !Array.isArray(content));

    const classes = [
      "nise-toggle-group__item",
      `nise-toggle-group__item--${variant}`,
      `nise-toggle-group__item--${size === "icon" ? "md" : size}`,
      isIconOnly ? "nise-toggle-group__item--icon" : null,
      isPressed ? "nise-toggle-group__item--pressed" : null,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      group?.onPress(value);
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
        {children ?? label}
      </button>
    );
  },
);
