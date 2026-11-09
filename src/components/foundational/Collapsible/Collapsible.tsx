/* =============================================================================
   Collapsible
   -----------------------------------------------------------------------------
   An interactive component that expands/collapses a panel.
   Backed by Base UI (`Collapsible`).

   Supports controlled (`open`/`isExpanded`, `onOpenChange`/`onExpandedChange`)
   and uncontrolled (`defaultOpen`/`defaultExpanded`) states, disabled state,
   and clean trigger composition.
   ============================================================================= */

import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import {
  buttonVariants,
  type ButtonSize,
  type ButtonVariant,
} from "../Button";
import { cn } from "../../../lib/cn";

interface CollapsibleStateContextValue {
  open: boolean;
  isExpanded: boolean;
  toggle: () => void;
  triggerId: string;
  panelId: string;
}

const CollapsibleStateContext = createContext<CollapsibleStateContextValue | null>(
  null,
);

export interface CollapsibleProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "onChange"> {
  /** Controlled open state (alias for `isExpanded`). */
  open?: boolean;
  isExpanded?: boolean;
  /** Initial open state when uncontrolled (alias for `defaultExpanded`). */
  defaultOpen?: boolean;
  defaultExpanded?: boolean;
  /** Callback fired when the open state changes (alias for `onExpandedChange`). */
  onOpenChange?: (open: boolean) => void;
  onExpandedChange?: (open: boolean) => void;
  /** When true, disables interaction (alias for `isDisabled`). */
  disabled?: boolean;
  isDisabled?: boolean;
  className?: string;
  children?: ReactNode;
}

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(
  function Collapsible(
    {
      open,
      isExpanded: controlledExpanded,
      defaultOpen,
      defaultExpanded,
      onOpenChange,
      onExpandedChange,
      disabled,
      isDisabled,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const reactId = useId();
    const triggerId = `nise-collapsible-trigger-${reactId}`;
    const panelId = `nise-collapsible-panel-${reactId}`;

    const controlled = open !== undefined ? open : controlledExpanded;
    const initial =
      defaultOpen !== undefined ? defaultOpen : (defaultExpanded ?? false);
    const isComponentDisabled = disabled !== undefined ? disabled : isDisabled;

    const [internalOpen, setInternalOpen] = useState(initial);
    const isOpen = controlled !== undefined ? controlled : internalOpen;

    const handleOpenChange = (next: boolean) => {
      if (controlled === undefined) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
      onExpandedChange?.(next);
    };

    const toggle = () => {
      if (!isComponentDisabled) {
        handleOpenChange(!isOpen);
      }
    };

    return (
      <CollapsibleStateContext.Provider
        value={{
          open: isOpen,
          isExpanded: isOpen,
          toggle,
          triggerId,
          panelId,
        }}
      >
        <BaseCollapsible.Root
          {...rest}
          ref={ref}
          open={isOpen}
          onOpenChange={(next) => handleOpenChange(next)}
          disabled={isComponentDisabled}
          className={cn("nise-collapsible flex flex-col font-sans", className)}
          data-state={isOpen ? "open" : "closed"}
        >
          {children}
        </BaseCollapsible.Root>
      </CollapsibleStateContext.Provider>
    );
  },
);

export interface CollapsibleTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  /** Optional Nise Button variant if styled as an action button (e.g. "ghost", "secondary"). */
  variant?: ButtonVariant;
  /** Optional Nise Button size ("sm", "md", "lg"). */
  size?: ButtonSize;
  isDisabled?: boolean;
  className?: string;
  children?: ReactNode;
}

export const CollapsibleTrigger = forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps
>(function CollapsibleTrigger(
  { variant, size, disabled, isDisabled, className, children, id, ...rest },
  ref,
) {
  const ctx = useContext(CollapsibleStateContext);
  const resolvedId = id ?? ctx?.triggerId;
  const effectivelyDisabled = disabled ?? isDisabled;

  return (
    <BaseCollapsible.Trigger
      {...rest}
      ref={ref}
      id={resolvedId}
      disabled={effectivelyDisabled}
      aria-controls={ctx?.panelId}
      className={cn(
        variant
          ? buttonVariants({ variant, size: size ?? "md" })
          : "nise-collapsible__trigger inline-flex items-center justify-between gap-[var(--space-2)] py-[var(--space-1)] px-[var(--space-2)] font-sans text-[length:var(--font-size-sm)] font-[var(--font-weight-medium)] text-base-content bg-transparent border-none rounded-[var(--radius-sm)] cursor-pointer select-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:not-disabled:bg-base-hover disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed",
        className,
      )}
    >
      {children}
    </BaseCollapsible.Trigger>
  );
});

export interface CollapsibleContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  className?: string;
  children?: ReactNode;
}

export const CollapsibleContent = forwardRef<
  HTMLDivElement,
  CollapsibleContentProps
>(function CollapsibleContent(
  { role = "region", className, children, id, style, ...rest },
  ref,
) {
  const ctx = useContext(CollapsibleStateContext);
  const resolvedId = id ?? ctx?.panelId;
  const isOpen = ctx?.open ?? false;

  return (
    <BaseCollapsible.Panel
      {...rest}
      ref={ref}
      id={resolvedId}
      keepMounted
      role={role}
      aria-labelledby={ctx?.triggerId}
      data-state={isOpen ? "open" : "closed"}
      style={isOpen ? style : { ...style, display: "none" }}
      className={cn(
        "nise-collapsible__content overflow-hidden text-[length:var(--font-size-sm)] text-base-content transition-[height,opacity] duration-[var(--duration-medium)] ease-[var(--ease-standard)] motion-reduce:transition-none data-[closed]:hidden",
        className,
      )}
    >
      {children}
    </BaseCollapsible.Panel>
  );
});

export function useCollapsible() {
  const state = useContext(CollapsibleStateContext);
  if (!state) {
    throw new Error(
      "Collapsible compound components must be used within a Collapsible",
    );
  }
  return {
    open: state.open,
    isExpanded: state.isExpanded,
    toggle: state.toggle,
  };
}
