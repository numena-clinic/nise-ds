/* =============================================================================
   ToggleGroup
   -----------------------------------------------------------------------------
   A set of Toggle-style pressed buttons sharing one state: `single` keeps a
   session view on exactly one layer, `multi` keeps a set. Backed by Base UI
   (`ToggleGroup` and `Toggle`).
   ============================================================================= */

import {
  Children,
  createContext,
  forwardRef,
  useContext,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { isIconChild, type ToggleSize, type ToggleVariant } from "../Toggle/Toggle";
import { cn } from "../../../lib/cn";

export type ToggleGroupType = "single" | "multi" | "multiple";

export interface ToggleGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "onChange" | "defaultValue"> {
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
  /** Disables the entire toggle group. */
  disabled?: boolean;
  isDisabled?: boolean;
  /** The ToggleGroupItem children. */
  children?: ReactNode;
  className?: string;
}

interface ToggleGroupContextValue {
  size: ToggleSize;
  variant: ToggleVariant;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue>({
  size: "md",
  variant: "default",
});

function toArray(val: string | string[] | undefined): string[] | undefined {
  if (val === undefined) return undefined;
  if (Array.isArray(val)) return val;
  return val ? [val] : [];
}

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
      disabled,
      isDisabled,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const isMultiMode = type === "multi" || type === "multiple";
    const effectivelyDisabled = disabled ?? isDisabled;

    return (
      <ToggleGroupContext.Provider value={{ size, variant }}>
        <BaseToggleGroup
          {...rest}
          ref={ref}
          aria-label={label}
          multiple={isMultiMode}
          disabled={effectivelyDisabled}
          value={toArray(value)}
          defaultValue={toArray(defaultValue)}
          onValueChange={(nextValues) => {
            if (isMultiMode) {
              onValueChange?.(nextValues);
            } else {
              onValueChange?.(nextValues[0] ?? "");
            }
          }}
          className={cn(
            "nise-toggle-group inline-flex items-center gap-[var(--toggle-group-gap)] font-sans",
            variant === "outline" && "nise-toggle-group--outline",
            className,
          )}
        >
          {children}
        </BaseToggleGroup>
      </ToggleGroupContext.Provider>
    );
  },
);

export interface ToggleGroupItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "value"> {
  value: string;
  size?: ToggleSize;
  variant?: ToggleVariant;
  iconOnly?: boolean;
  isDisabled?: boolean;
  children?: ReactNode;
  className?: string;
}

export const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  function ToggleGroupItem(
    {
      value,
      size: itemSize,
      variant: itemVariant,
      iconOnly,
      disabled,
      isDisabled,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const ctx = useContext(ToggleGroupContext);
    const size = itemSize ?? ctx.size;
    const variant = itemVariant ?? ctx.variant;
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
        value={value}
        disabled={effectivelyDisabled}
        className={cn(
          "nise-toggle-group__item inline-flex items-center justify-center shrink-0 select-none cursor-pointer font-sans font-[var(--font-weight-medium)] leading-[var(--line-height-tight)] whitespace-nowrap gap-[var(--button-gap)] rounded-[var(--button-radius,var(--radius-md))] border border-solid border-transparent bg-transparent text-base-content transition-[background-color,border-color,color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:not-disabled:bg-base-hover active:not-disabled:bg-base-active data-[pressed]:bg-selected-surface data-[pressed]:text-selected-text data-[pressed]:border-border-strong disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed",
          variant === "outline"
            ? "nise-toggle-group__item--outline border-border-strong bg-base-100"
            : "nise-toggle-group__item--default",
          size === "sm" &&
            "nise-toggle-group__item--sm h-[var(--button-height-sm)] px-[var(--button-padding-x-sm)] text-[length:var(--button-font-size-sm)]",
          size === "md" &&
            "nise-toggle-group__item--md h-[var(--button-height-md)] px-[var(--button-padding-x-md)] text-[length:var(--button-font-size-md)]",
          size === "lg" &&
            "nise-toggle-group__item--lg h-[var(--button-height-lg)] px-[var(--button-padding-x-lg)] text-[length:var(--button-font-size-lg)]",
          size === "icon" &&
            "nise-toggle-group__item--icon size-[var(--button-height-md)] p-0",
          autoIconOnly && "nise-toggle-group__item--icon px-0 aspect-square",
          className,
        )}
      >
        {children}
      </BaseToggle>
    );
  },
);
