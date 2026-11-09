/* =============================================================================
   Accordion
   -----------------------------------------------------------------------------
   A vertically stacked set of interactive headings that each reveal a section
   of content. Backed by Base UI (`Accordion`).

   Supports both `single` (one panel open at a time, optionally collapsible) and
   `multiple` (any number of panels open simultaneously) modes.
   ============================================================================= */

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { ChevronDownIcon } from "../../../icons";
import { cn } from "../../../lib/cn";

export type AccordionType = "single" | "multiple";

export interface AccordionProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "defaultValue" | "onChange" | "className"
  > {
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

interface AccordionContextValue {
  activeValues: string[];
}

const AccordionContext = createContext<AccordionContextValue>({
  activeValues: [],
});

interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
  disabled: boolean;
  triggerId: string;
  panelId: string;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(
  null,
);

function toValueArray(v: string | string[] | undefined): string[] {
  if (v === undefined) return [];
  if (Array.isArray(v)) return v;
  return v ? [v] : [];
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(
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
    const controlled = value !== undefined;

    const [internalValues, setInternalValues] = useState<string[]>(() =>
      toValueArray(defaultValue),
    );

    const activeValues = controlled ? toValueArray(value) : internalValues;

    const handleValueChange = useCallback(
      (nextRaw: unknown[]) => {
        let next = nextRaw.map(String);
        if (!isMultiple && !collapsible && next.length === 0) {
          next = activeValues;
        }
        if (!controlled) {
          setInternalValues(next);
        }
        if (isMultiple) {
          onValueChange?.(next);
        } else {
          onValueChange?.(next[0] ?? "");
        }
      },
      [isMultiple, collapsible, controlled, activeValues, onValueChange],
    );

    return (
      <AccordionContext.Provider value={{ activeValues }}>
        <BaseAccordion.Root
          {...rest}
          ref={ref}
          multiple={isMultiple}
          value={activeValues}
          onValueChange={handleValueChange}
          disabled={effectivelyDisabled}
          className={cn(
            "nise-accordion flex flex-col w-full font-sans text-base-content divide-y divide-border border-b border-solid border-border",
            className,
          )}
        >
          {children}
        </BaseAccordion.Root>
      </AccordionContext.Provider>
    );
  },
);

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
    const reactId = useId();
    const { activeValues } = useContext(AccordionContext);
    const isOpen = activeValues.includes(value);
    const effectivelyDisabled = Boolean(disabled ?? isDisabled);
    const triggerId = `nise-accordion-trigger-${reactId}`;
    const panelId = `nise-accordion-panel-${reactId}`;

    return (
      <AccordionItemContext.Provider
        value={{
          value,
          isOpen,
          disabled: effectivelyDisabled,
          triggerId,
          panelId,
        }}
      >
        <BaseAccordion.Item
          {...rest}
          ref={ref}
          value={value}
          disabled={effectivelyDisabled}
          className={cn(
            "nise-accordion__item flex flex-col",
            isOpen && "nise-accordion__item--open",
            effectivelyDisabled &&
              "nise-accordion__item--disabled opacity-[var(--opacity-disabled)]",
            className,
          )}
        >
          {children}
        </BaseAccordion.Item>
      </AccordionItemContext.Provider>
    );
  },
);

export interface AccordionTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  disabled?: boolean;
  isDisabled?: boolean;
  children?: ReactNode;
  className?: string;
}

export const AccordionTrigger = forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(function AccordionTrigger(
  { children, className, disabled, isDisabled, onKeyDown, id, ...rest },
  ref,
) {
  const itemCtx = useContext(AccordionItemContext);
  const isExpanded = itemCtx?.isOpen ?? false;
  const effectivelyDisabled = disabled ?? isDisabled ?? itemCtx?.disabled;
  const resolvedId = id ?? itemCtx?.triggerId;

  const handleKeyDown: ButtonHTMLAttributes<HTMLButtonElement>["onKeyDown"] = (
    e,
  ) => {
    const target = e.currentTarget as HTMLElement;
    const accordion = target.closest(".nise-accordion");
    if (accordion) {
      const triggers = Array.from(
        accordion.querySelectorAll<HTMLButtonElement>(
          ".nise-accordion__trigger:not(:disabled)",
        ),
      ).filter((btn) => {
        if (btn.closest(".nise-accordion") !== accordion) return false;
        if (btn.disabled || btn.getAttribute("aria-disabled") === "true")
          return false;
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

  return (
    <BaseAccordion.Header className="nise-accordion__header m-0 flex">
      <BaseAccordion.Trigger
        {...rest}
        ref={ref}
        id={resolvedId}
        disabled={effectivelyDisabled}
        aria-controls={itemCtx?.panelId}
        data-state={isExpanded ? "open" : "closed"}
        onKeyDown={handleKeyDown}
        className={cn(
          "nise-accordion__trigger flex flex-1 items-center justify-between gap-[var(--space-3)] py-[var(--space-4)] font-sans text-[length:var(--font-size-sm)] font-[var(--font-weight-medium)] text-left text-base-content bg-transparent border-none cursor-pointer select-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:not-disabled:text-primary disabled:cursor-not-allowed",
          isExpanded && "nise-accordion__trigger--open",
          className,
        )}
      >
        <span className="nise-accordion__title">{children}</span>
        <ChevronDownIcon
          size={16}
          className={cn(
            "nise-accordion__chevron shrink-0 text-text-muted transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
            isExpanded && "rotate-180",
          )}
        />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  );
});

export interface AccordionContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  role?: "region" | "group";
  children?: ReactNode;
  className?: string;
}

export const AccordionContent = forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(function AccordionContent(
  { children, className, role = "region", id, style, ...rest },
  ref,
) {
  const itemCtx = useContext(AccordionItemContext);
  const isExpanded = itemCtx?.isOpen ?? false;
  const resolvedId = id ?? itemCtx?.panelId;

  return (
    <BaseAccordion.Panel
      {...rest}
      ref={ref}
      id={resolvedId}
      keepMounted
      role={role}
      aria-labelledby={itemCtx?.triggerId}
      data-state={isExpanded ? "open" : "closed"}
      style={isExpanded ? style : { ...style, display: "none" }}
      className={cn(
        "nise-accordion__content overflow-hidden text-[length:var(--font-size-sm)] leading-[var(--line-height-normal)] text-base-content transition-[height,opacity] duration-[var(--duration-medium)] ease-[var(--ease-standard)] motion-reduce:transition-none data-[closed]:hidden",
        isExpanded && "nise-accordion__content--open",
        className,
      )}
    >
      <div className="nise-accordion__inner pb-[var(--space-4)]">{children}</div>
    </BaseAccordion.Panel>
  );
});
