/* =============================================================================
   Accordion
   -----------------------------------------------------------------------------
   A vertically stacked set of interactive headings that each reveal a section
   of content. Built on the W3C WAI-ARIA Accordion pattern with keyboard roving
   navigation (ArrowUp, ArrowDown, Home, End).

   Supports both `single` (one panel open at a time, optionally collapsible) and
   `multiple` (any number of panels open simultaneously) modes, matching the
   shadcn/ui and Radix Accordion API.

   Tokens consumed (component layer → semantic → primitive):
     --color-base-content, --color-text-muted, --color-border,
     --color-focus-ring, --focus-ring-width, --focus-ring-offset,
     --font-sans, --font-weight-medium, --font-size-sm,
     --space-2, --space-4, --border-width,
     --duration-fast, --ease-standard

   Accessibility:
     - Each trigger is a real <button> contained within a heading role.
     - `aria-expanded` and `aria-controls` explicitly connect the trigger to the content panel.
     - The panel has `role="region"` and `aria-labelledby` referencing the trigger.
     - Chevron icon is decorative (`aria-hidden`).
     - Keyboard navigation: ArrowDown / ArrowUp moves focus between headers,
       Home moves to the first header, End moves to the last header.
   ============================================================================= */

import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDownIcon } from "../../icons";
import "./Accordion.css";

export type AccordionType = "single" | "multiple";

export interface AccordionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
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
  children?: ReactNode;
  className?: string;
}

interface AccordionContextValue {
  type: AccordionType;
  collapsible: boolean;
  isOpen: (value: string) => boolean;
  toggleItem: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  {
    type = "single",
    collapsible = true,
    value,
    defaultValue,
    onValueChange,
    className,
    children,
    ...rest
  },
  ref,
) {
  const isMultiple = type === "multiple";
  const [internalValue, setInternalValue] = useState<string | string[]>(
    defaultValue ?? (isMultiple ? [] : ""),
  );

  const controlled = value !== undefined;
  const current = controlled ? value : internalValue;
  const activeItems = Array.isArray(current) ? current : current ? [current] : [];

  const isOpen = (itemValue: string) => activeItems.includes(itemValue);

  const toggleItem = (itemValue: string) => {
    let next: string | string[];
    if (isMultiple) {
      const items = Array.isArray(current) ? current : [];
      next = items.includes(itemValue)
        ? items.filter((v) => v !== itemValue)
        : [...items, itemValue];
    } else {
      const isCurrentlyOpen = activeItems[0] === itemValue;
      if (isCurrentlyOpen) {
        next = collapsible ? "" : itemValue;
      } else {
        next = itemValue;
      }
    }

    if (!controlled) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  const classes = ["nise-accordion", className].filter(Boolean).join(" ");

  return (
    <AccordionContext.Provider value={{ type, collapsible, isOpen, toggleItem }}>
      <div ref={ref} className={classes} {...rest}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
});

/* -----------------------------------------------------------------------------
   AccordionItem
   ----------------------------------------------------------------------------- */

interface AccordionItemContextValue {
  value: string;
  triggerId: string;
  contentId: string;
  isOpen: boolean;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Unique value identifying this item within the accordion. */
  value: string;
  /** Disables interaction with this item. */
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem({ value, disabled, className, children, ...rest }, ref) {
    const root = useContext(AccordionContext);
    const idPrefix = useId();
    const triggerId = `${idPrefix}-trigger`;
    const contentId = `${idPrefix}-content`;
    const itemOpen = root ? root.isOpen(value) : false;

    const classes = [
      "nise-accordion__item",
      itemOpen ? "nise-accordion__item--open" : null,
      disabled ? "nise-accordion__item--disabled" : null,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <AccordionItemContext.Provider
        value={{ value, triggerId, contentId, isOpen: itemOpen }}
      >
        <div ref={ref} className={classes} data-state={itemOpen ? "open" : "closed"} {...rest}>
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  },
);

/* -----------------------------------------------------------------------------
   AccordionTrigger
   ----------------------------------------------------------------------------- */

export interface AccordionTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "aria-expanded"> {
  children?: ReactNode;
  className?: string;
}

export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger({ children, className, onClick, onKeyDown, ...rest }, ref) {
    const root = useContext(AccordionContext);
    const item = useContext(AccordionItemContext);

    const isOpen = item?.isOpen ?? false;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (item && root) {
        root.toggleItem(item.value);
      }
      onClick?.(e);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      const target = e.currentTarget;
      const accordion = target.closest(".nise-accordion");
      if (accordion) {
        const triggers = Array.from(
          accordion.querySelectorAll<HTMLButtonElement>(
            ".nise-accordion__trigger:not(:disabled)",
          ),
        );
        const index = triggers.indexOf(target);

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
      onKeyDown?.(e);
    };

    const classes = [
      "nise-accordion__trigger",
      isOpen ? "nise-accordion__trigger--open" : null,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <h3 className="nise-accordion__header">
        <button
          ref={ref}
          type="button"
          id={item?.triggerId}
          aria-expanded={isOpen}
          aria-controls={item?.contentId}
          className={classes}
          data-state={isOpen ? "open" : "closed"}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          {...rest}
        >
          <span className="nise-accordion__title">{children}</span>
          <ChevronDownIcon size={16} className="nise-accordion__chevron" />
        </button>
      </h3>
    );
  },
);

/* -----------------------------------------------------------------------------
   AccordionContent
   ----------------------------------------------------------------------------- */

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent({ children, className, ...rest }, ref) {
    const item = useContext(AccordionItemContext);
    const isOpen = item?.isOpen ?? false;

    const classes = [
      "nise-accordion__content",
      isOpen ? "nise-accordion__content--open" : null,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        ref={ref}
        id={item?.contentId}
        role="region"
        aria-labelledby={item?.triggerId}
        hidden={!isOpen}
        data-state={isOpen ? "open" : "closed"}
        className={classes}
        {...rest}
      >
        <div className="nise-accordion__inner">{children}</div>
      </div>
    );
  },
);
