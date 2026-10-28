/* =============================================================================
   Collapsible
   -----------------------------------------------------------------------------
   An interactive component that expands/collapses a panel.
   Backed by React Aria Components (`Disclosure`).

   Supports controlled (`open`/`isExpanded`, `onOpenChange`/`onExpandedChange`)
   and uncontrolled (`defaultOpen`/`defaultExpanded`) states, disabled state,
   and clean trigger composition.

   Tokens consumed (component layer → semantic → primitive):
     --color-base-content, --color-base-hover, --color-focus-ring,
     --focus-ring-width, --focus-ring-offset,
     --font-sans, --font-weight-medium, --font-size-sm,
     --radius-sm, --space-1, --space-2,
     --duration-fast, --ease-standard

   Accessibility:
     - Backed by React Aria Components `Disclosure`.
     - `CollapsibleTrigger` receives `aria-expanded` and `aria-controls`.
     - `CollapsibleContent` receives `role="region"` and `aria-labelledby`.
     - Full keyboard navigation (Space, Enter), focus ring, and disabled handling.
   ============================================================================= */

import {
  forwardRef,
  useContext,
  type ReactNode,
} from "react";
import {
  Disclosure as RACDisclosure,
  DisclosurePanel as RACDisclosurePanel,
  DisclosureStateContext,
  Button as RACButton,
  type DisclosureProps as RACDisclosureProps,
  type DisclosurePanelProps as RACDisclosurePanelProps,
  type ButtonProps as RACButtonProps,
} from "react-aria-components";
import type { ButtonSize, ButtonVariant } from "../Button";
import "./Collapsible.css";

export interface CollapsibleProps
  extends Omit<RACDisclosureProps, "children" | "className"> {
  /** Controlled open state (alias for `isExpanded`). */
  open?: boolean;
  /** Initial open state when uncontrolled (alias for `defaultExpanded`). */
  defaultOpen?: boolean;
  /** Callback fired when the open state changes (alias for `onExpandedChange`). */
  onOpenChange?: (open: boolean) => void;
  /** When true, disables interaction (alias for `isDisabled`). */
  disabled?: boolean;
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
    const isExpanded = open !== undefined ? open : controlledExpanded;
    const initialExpanded = defaultOpen !== undefined ? defaultOpen : defaultExpanded;
    const isComponentDisabled = disabled !== undefined ? disabled : isDisabled;

    const handleExpandedChange = (expanded: boolean) => {
      onOpenChange?.(expanded);
      onExpandedChange?.(expanded);
    };

    return (
      <RACDisclosure
        {...rest}
        ref={ref}
        isExpanded={isExpanded}
        defaultExpanded={initialExpanded}
        onExpandedChange={handleExpandedChange}
        isDisabled={isComponentDisabled}
        className={["nise-collapsible", className].filter(Boolean).join(" ")}
        data-state={isExpanded !== undefined ? (isExpanded ? "open" : "closed") : undefined}
      >
        {children}
      </RACDisclosure>
    );
  },
);

export interface CollapsibleTriggerProps
  extends Omit<RACButtonProps, "className" | "children"> {
  /** Optional Nise Button variant if styled as an action button (e.g. "ghost", "secondary"). */
  variant?: ButtonVariant;
  /** Optional Nise Button size ("sm", "md", "lg"). */
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
}

export const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger(
    { variant, size, className, children, ...rest },
    ref,
  ) {
    const classNames = [
      variant ? "nise-button" : "nise-collapsible__trigger",
      variant ? `nise-button--${variant}` : null,
      size ? `nise-button--${size}` : null,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <RACButton
        {...rest}
        ref={ref}
        slot="trigger"
        className={classNames}
      >
        {children}
      </RACButton>
    );
  },
);

export interface CollapsibleContentProps
  extends Omit<RACDisclosurePanelProps, "className" | "children"> {
  className?: string;
  children?: ReactNode;
}

export const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent({ role = "region", className, children, ...rest }, ref) {
    return (
      <RACDisclosurePanel
        {...rest}
        ref={ref}
        role={role}
        className={["nise-collapsible__content", className].filter(Boolean).join(" ")}
      >
        {children}
      </RACDisclosurePanel>
    );
  },
);

export function useCollapsible() {
  const state = useContext(DisclosureStateContext);
  if (!state) {
    throw new Error("Collapsible compound components must be used within a Collapsible");
  }
  return {
    open: state.isExpanded,
    isExpanded: state.isExpanded,
    toggle: state.toggle,
  };
}
