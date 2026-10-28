/* =============================================================================
   ToggleGroup
   -----------------------------------------------------------------------------
   A set of Toggle-style pressed buttons sharing one state: `single` keeps a
   session view on exactly one layer (the pressed item mirrors `value`), `multi`
   keeps a set (array membership). Backed by React Aria Components
   (ToggleButtonGroup, ToggleButton) as the headless foundation.

   It is a selection group for toolbars and filters — not a radio group over a
   form field, and not a Tabs row: the items do not reveal panels and every item
   toggles on its own face, so each is a real button with `aria-pressed`.

   The container renders `role="toolbar"` (or `role="group"`) named by the required
   `label` prop. The item's pressed state is a SELECTION (the validated selected
   pair — see Toggle); pressed and unpressed differ by tile AND tile-text, never
   color alone.

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
  useCallback,
  useContext,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  ToggleButtonGroup as RACToggleButtonGroup,
  ToggleButton as RACToggleButton,
  type ToggleButtonProps as RACToggleButtonProps,
  type Key,
} from "react-aria-components";
import type { ToggleSize, ToggleVariant } from "../Toggle/Toggle";
import "./ToggleGroup.css";

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

    const toKeySet = (v: string | string[] | undefined): Set<Key> => {
      if (v === undefined || v === "") return new Set();
      if (Array.isArray(v)) return new Set(v);
      return new Set([v]);
    };

    const controlled = value !== undefined;
    const [internalKeys, setInternalKeys] = useState<Set<Key>>(() => toKeySet(defaultValue));

    const activeKeys = controlled ? toKeySet(value) : internalKeys;

    const handleSelectionChange = useCallback(
      (keys: Set<Key>) => {
        let nextKeys: Set<Key>;

        if (!isMultiMode) {
          // Single mode: find newly added key
          const keyArray = Array.from(keys);
          const added = keyArray.find((k) => !activeKeys.has(k));
          if (added) {
            nextKeys = new Set([added]);
          } else if (keyArray.length === 0) {
            // Clicking the active item again in single mode: keep it pressed
            nextKeys = activeKeys.size > 0 ? activeKeys : new Set();
          } else {
            nextKeys = keyArray[0] !== undefined ? new Set([keyArray[0]]) : new Set();
          }
        } else {
          nextKeys = new Set(keys);
        }

        if (!controlled) {
          setInternalKeys(nextKeys);
        }

        const stringKeys = Array.from(nextKeys).map(String);
        if (isMultiMode) {
          onValueChange?.(stringKeys);
        } else {
          onValueChange?.(stringKeys[0] ?? "");
        }
      },
      [isMultiMode, activeKeys, controlled, onValueChange],
    );

    const classes = [
      "nise-toggle-group",
      `nise-toggle-group--${variant}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const contextValue = useMemo(() => ({ size, variant }), [size, variant]);

    return (
      <ToggleGroupContext.Provider value={contextValue}>
        <RACToggleButtonGroup
          ref={ref}
          aria-label={label}
          selectionMode="multiple"
          selectedKeys={activeKeys}
          onSelectionChange={handleSelectionChange}
          isDisabled={effectivelyDisabled}
          className={classes}
          {...rest}
        >
          {children}
        </RACToggleButtonGroup>
      </ToggleGroupContext.Provider>
    );
  },
);

/* -----------------------------------------------------------------------------
   ToggleGroupItem
   ----------------------------------------------------------------------------- */

export interface ToggleGroupItemProps
  extends Omit<RACToggleButtonProps, "className" | "children" | "id"> {
  value: string;
  /** Visual variant. Defaults to the group's variant. */
  variant?: ToggleVariant;
  size?: ToggleSize;
  /** Explicitly mark item as icon-only (renders square geometry). */
  iconOnly?: boolean;
  /** Visible content used when no children are given. */
  label?: string;
  /** Disables this item. */
  disabled?: boolean;
  isDisabled?: boolean;
  children?: ReactNode;
  className?: string;
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

export const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  function ToggleGroupItem(
    {
      value,
      variant: itemVariantProp,
      size: itemSizeProp,
      iconOnly,
      label,
      disabled,
      isDisabled,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const group = useContext(ToggleGroupContext);
    const variant = itemVariantProp ?? group?.variant ?? "default";
    const size = itemSizeProp ?? group?.size ?? "md";
    const effectivelyDisabled = disabled ?? isDisabled;

    const content = children ?? label;
    const isIconOnly =
      iconOnly !== undefined
        ? iconOnly
        : size === "icon" ||
          (isValidElement(content) && !Array.isArray(content) && isIconChild(content));

    return (
      <RACToggleButton
        ref={ref}
        id={value}
        isDisabled={effectivelyDisabled}
        className={({ isSelected, isDisabled: buttonDisabled }) =>
          [
            "nise-toggle-group__item",
            `nise-toggle-group__item--${variant}`,
            `nise-toggle-group__item--${size === "icon" ? "md" : size}`,
            isIconOnly ? "nise-toggle-group__item--icon" : null,
            isSelected ? "nise-toggle-group__item--pressed" : null,
            buttonDisabled ? "nise-toggle-group__item--disabled" : null,
            className,
          ]
            .filter(Boolean)
            .join(" ")
        }
        {...rest}
      >
        {content}
      </RACToggleButton>
    );
  },
);
