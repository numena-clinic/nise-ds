/* =============================================================================
   Accordion
   -----------------------------------------------------------------------------
   A vertically stacked set of interactive headings that each reveal a section
   of content. Backed by React Aria Components (DisclosureGroup, Disclosure,
   Button slot="trigger", DisclosurePanel) as the headless foundation.

   Supports both `single` (one panel open at a time, optionally collapsible) and
   `multiple` (any number of panels open simultaneously) modes.

   Tokens consumed (component layer → semantic → primitive):
     --color-base-content, --color-text-muted, --color-border,
     --color-focus-ring, --focus-ring-width, --focus-ring-offset,
     --font-sans, --font-weight-medium, --font-size-sm,
     --space-2, --space-4, --border-width,
     --duration-fast, --ease-standard

   Accessibility:
     - Each trigger is an audited <button> contained within a heading role.
     - `aria-expanded` and `aria-controls` explicitly connect the trigger to the content panel.
     - The panel has `role="region"` and `aria-labelledby` referencing the trigger.
     - Chevron icon is decorative (`aria-hidden`).
     - Keyboard navigation: ArrowDown / ArrowUp moves focus between headers,
       Home moves to the first header, End moves to the last header.
   ============================================================================= */

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  DisclosureGroup as RACDisclosureGroup,
  Disclosure as RACDisclosure,
  DisclosurePanel as RACDisclosurePanel,
  Button as RACButton,
  DisclosureStateContext,
  type ButtonProps as RACButtonProps,
  type Key,
} from "react-aria-components";
import { ChevronDownIcon } from "../../icons";
import "./Accordion.css";

export type AccordionType = "single" | "multiple";

export interface AccordionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "className"> {
  /** "single" allows one section open; "multiple" allows multiple sections open. */
  type?: AccordionType;
  /** When type is "single", allows closing the open item by clicking it again. Defaults to true. */
  collapsible?: boolean;
  /** Controlled value (string for single, string[] for multiple). */
  value?: string | string[];
  /** Initial value when uncontrolled. */
  defaultValue?: string | string[];
  /** Callback fired when the selection changes. */
  onValueChange?: (value: string | string[]) => void;
  /** Disables interaction for the entire accordion. */
  disabled?: boolean;
  isDisabled?: boolean;
  children?: ReactNode;
  className?: string;
}

interface AccordionMetaContextValue {
  type: AccordionType;
  collapsible: boolean;
}

const AccordionMetaContext = createContext<AccordionMetaContextValue>({
  type: "single",
  collapsible: true,
});

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  {
    type = "single",
    collapsible = true,
    value,
    defaultValue,
    onValueChange,
    disabled,
    isDisabled,
    className,
    children,
    ...rest
  },
  ref,
) {
  const isMultiple = type === "multiple";
  const effectivelyDisabled = disabled ?? isDisabled;

  const toKeySet = (v: string | string[] | undefined): Set<Key> | undefined => {
    if (v === undefined) return undefined;
    if (Array.isArray(v)) return new Set(v);
    return v ? new Set([v]) : new Set();
  };

  const controlled = value !== undefined;
  const [internalKeys, setInternalKeys] = useState<Set<Key>>(() => {
    return toKeySet(defaultValue) ?? (isMultiple ? new Set() : new Set());
  });

  const activeKeys = controlled ? toKeySet(value) : internalKeys;

  const handleExpandedChange = useCallback(
    (keys: Set<Key>) => {
      let nextKeys = keys;
      if (!isMultiple && !collapsible && keys.size === 0) {
        // In single non-collapsible mode, prevent uncollapsing the active item
        nextKeys = activeKeys ?? new Set();
      }

      if (!controlled) {
        setInternalKeys(nextKeys);
      }

      const keyArray = Array.from(nextKeys).map(String);
      if (isMultiple) {
        onValueChange?.(keyArray);
      } else {
        onValueChange?.(keyArray[0] ?? "");
      }
    },
    [isMultiple, collapsible, controlled, activeKeys, onValueChange],
  );

  const classes = ["nise-accordion", className].filter(Boolean).join(" ");

  return (
    <AccordionMetaContext.Provider value={{ type, collapsible }}>
      <RACDisclosureGroup
        ref={ref}
        allowsMultipleExpanded={isMultiple}
        expandedKeys={activeKeys}
        onExpandedChange={handleExpandedChange}
        isDisabled={effectivelyDisabled}
        className={classes}
        {...rest}
      >
        {children}
      </RACDisclosureGroup>
    </AccordionMetaContext.Provider>
  );
});

/* -----------------------------------------------------------------------------
   AccordionItem
   ----------------------------------------------------------------------------- */

export interface AccordionItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  /** Unique value identifying this item within the accordion. */
  value: string;
  /** Disables interaction with this item. */
  disabled?: boolean;
  isDisabled?: boolean;
  children?: ReactNode;
  className?: string;
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem(
    { value, disabled, isDisabled, className, children, ...rest },
    ref,
  ) {
    const effectivelyDisabled = disabled ?? isDisabled;

    return (
      <RACDisclosure
        ref={ref}
        id={value}
        isDisabled={effectivelyDisabled}
        className={({ isExpanded, isDisabled: itemDisabled }) =>
          [
            "nise-accordion__item",
            isExpanded ? "nise-accordion__item--open" : null,
            itemDisabled ? "nise-accordion__item--disabled" : null,
            className,
          ]
            .filter(Boolean)
            .join(" ")
        }
        {...rest}
      >
        {children}
      </RACDisclosure>
    );
  },
);

/* -----------------------------------------------------------------------------
   AccordionTrigger
   ----------------------------------------------------------------------------- */

export interface AccordionTriggerProps
  extends Omit<RACButtonProps, "className" | "children"> {
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger(
    { children, className, disabled, isDisabled, onKeyDown, ...rest },
    ref,
  ) {
    const disclosureState = useContext(DisclosureStateContext);
    const isExpanded = disclosureState?.isExpanded ?? false;
    const effectivelyDisabled = disabled ?? isDisabled;

    const handleKeyDown: RACButtonProps["onKeyDown"] = (e) => {
      const target = e.currentTarget as HTMLElement;
      const accordion = target.closest(".nise-accordion");
      if (accordion) {
        const triggers = Array.from(
          accordion.querySelectorAll<HTMLButtonElement>(
            ".nise-accordion__trigger:not(:disabled)",
          ),
        ).filter((btn) => {
          // Must be directly owned by this accordion, not an inner nested accordion
          if (btn.closest(".nise-accordion") !== accordion) return false;
          // Must not be disabled or inside a hidden container
          if (btn.disabled || btn.getAttribute("aria-disabled") === "true") return false;
          if (btn.closest("[hidden]")) return false;
          return true;
        });
        const index = triggers.indexOf(target as HTMLButtonElement);

        if (triggers.length > 0 && index !== -1) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            const nextIndex = (index + 1) % triggers.length;
            triggers[nextIndex]?.focus();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const prevIndex = (index - 1 + triggers.length) % triggers.length;
            triggers[prevIndex]?.focus();
          } else if (e.key === "Home") {
            e.preventDefault();
            triggers[0]?.focus();
          } else if (e.key === "End") {
            e.preventDefault();
            triggers[triggers.length - 1]?.focus();
          }
        }
      }
      onKeyDown?.(e);
    };

    const classes = [
      "nise-accordion__trigger",
      isExpanded ? "nise-accordion__trigger--open" : null,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <h3 className="nise-accordion__header">
        <RACButton
          ref={ref}
          slot="trigger"
          isDisabled={effectivelyDisabled}
          className={classes}
          data-state={isExpanded ? "open" : "closed"}
          onKeyDown={handleKeyDown}
          {...rest}
        >
          <span className="nise-accordion__title">{children}</span>
          <ChevronDownIcon size={16} className="nise-accordion__chevron" />
        </RACButton>
      </h3>
    );
  },
);

/* -----------------------------------------------------------------------------
   AccordionContent
   ----------------------------------------------------------------------------- */

export interface AccordionContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  role?: "region" | "group";
  children?: ReactNode;
  className?: string;
}

export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent({ children, className, role = "region", ...rest }, ref) {
    const disclosureState = useContext(DisclosureStateContext);
    const isExpanded = disclosureState?.isExpanded ?? false;

    const classes = [
      "nise-accordion__content",
      isExpanded ? "nise-accordion__content--open" : null,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <RACDisclosurePanel
        ref={ref}
        role={role}
        className={classes}
        data-state={isExpanded ? "open" : "closed"}
        {...rest}
      >
        <div className="nise-accordion__inner">{children}</div>
      </RACDisclosurePanel>
    );
  },
);
