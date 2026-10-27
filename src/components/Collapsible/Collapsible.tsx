/* =============================================================================
   Collapsible
   -----------------------------------------------------------------------------
   An interactive component which expands/collapses a panel. Matches the
   shadcn/ui and Radix Collapsible API and design pattern.

   Supports both controlled (`open`, `onOpenChange`) and uncontrolled
   (`defaultOpen`) states, disabled state, and flexible trigger composition
   with `asChild` (e.g. delegating behavior to a custom Button or icon trigger).

   Tokens consumed (component layer → semantic → primitive):
     --color-base-content, --color-base-hover, --color-focus-ring,
     --focus-ring-width, --focus-ring-offset,
     --font-sans, --font-weight-medium, --font-size-sm,
     --radius-sm, --space-1, --space-2,
     --duration-fast, --ease-standard

   Accessibility:
     - `CollapsibleTrigger` renders a real <button> with `aria-expanded` and `aria-controls`.
     - `CollapsibleContent` renders with `role="region"` and `aria-labelledby`.
     - When closed, the content panel is hidden (`hidden`, `data-state="closed"`).
   ============================================================================= */

import {
  createContext,
  forwardRef,
  isValidElement,
  cloneElement,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import "./Collapsible.css";

export interface CollapsibleContextValue {
  open: boolean;
  disabled?: boolean;
  contentId: string;
  triggerId: string;
  toggle: () => void;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

export function useCollapsible() {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error("Collapsible compound components must be used within a Collapsible");
  }
  return context;
}

export interface CollapsibleProps extends HTMLAttributes<HTMLDivElement> {
  /** The controlled open state of the collapsible. */
  open?: boolean;
  /** The open state of the collapsible when it is initially rendered (uncontrolled). */
  defaultOpen?: boolean;
  /** Event handler called when the open state of the collapsible changes. */
  onOpenChange?: (open: boolean) => void;
  /** When true, prevents the user from interacting with the collapsible. */
  disabled?: boolean;
  /** Change the default rendered element for the one passed as a child, merging their props and behavior. */
  asChild?: boolean;
  children?: ReactNode;
}

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(
  function Collapsible(
    {
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      disabled = false,
      asChild = false,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const isControlled = controlledOpen !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

    const id = useId();
    const contentId = `${id}-content`;
    const triggerId = `${id}-trigger`;

    const toggle = () => {
      if (disabled) return;
      const next = !isOpen;
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    };

    const sharedProps = {
      ref,
      className: ["nise-collapsible", className].filter(Boolean).join(" "),
      "data-state": isOpen ? "open" : "closed",
      "data-disabled": disabled ? "" : undefined,
    };

    return (
      <CollapsibleContext.Provider
        value={{
          open: isOpen,
          disabled,
          contentId,
          triggerId,
          toggle,
        }}
      >
        {asChild && isValidElement(children) ? (
          (cloneElement as (elem: ReactElement, props: Record<string, unknown>) => ReactElement)(
            children as ReactElement<HTMLAttributes<HTMLDivElement>>,
            {
              ...sharedProps,
              className: [
                (children as ReactElement<{ className?: string }>).props.className,
                sharedProps.className,
              ]
                .filter(Boolean)
                .join(" "),
            },
          )
        ) : (
          <div {...rest} {...sharedProps}>
            {children}
          </div>
        )}
      </CollapsibleContext.Provider>
    );
  },
);

export interface CollapsibleTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Change the default rendered element for the one passed as a child, merging their props and behavior. */
  asChild?: boolean;
  children?: ReactNode;
}

export const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger(
    { asChild = false, children, className, onClick, ...rest },
    ref,
  ) {
    const { open, disabled, contentId, triggerId, toggle } = useCollapsible();

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        toggle();
      }
      onClick?.(e);
    };

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
      return (cloneElement as (elem: ReactElement, props: Record<string, unknown>) => ReactElement)(
        child,
        {
          ref,
          id: triggerId,
          type: child.props.type ?? "button",
          "aria-expanded": open,
          "aria-controls": contentId,
          "data-state": open ? "open" : "closed",
          "data-disabled": disabled ? "" : undefined,
          disabled: disabled || child.props.disabled,
          onClick: (e: MouseEvent<HTMLButtonElement>) => {
            child.props.onClick?.(e);
            if (!e.defaultPrevented) {
              handleClick(e);
            }
          },
        },
      );
    }

    return (
      <button
        {...rest}
        ref={ref}
        type="button"
        id={triggerId}
        aria-expanded={open}
        aria-controls={contentId}
        data-state={open ? "open" : "closed"}
        data-disabled={disabled ? "" : undefined}
        disabled={disabled}
        onClick={handleClick}
        className={["nise-collapsible__trigger", className]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </button>
    );
  },
);

export interface CollapsibleContentProps
  extends HTMLAttributes<HTMLDivElement> {
  /** Change the default rendered element for the one passed as a child, merging their props and behavior. */
  asChild?: boolean;
  children?: ReactNode;
}

export const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent({ asChild = false, className, children, ...rest }, ref) {
    const { open, disabled, contentId, triggerId } = useCollapsible();

    const sharedProps = {
      ref,
      id: contentId,
      role: "region",
      "aria-labelledby": triggerId,
      "aria-hidden": !open,
      hidden: !open,
      "data-state": open ? "open" : "closed",
      "data-disabled": disabled ? "" : undefined,
      className: ["nise-collapsible__content", className].filter(Boolean).join(" "),
    };

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<HTMLAttributes<HTMLDivElement>>;
      return (cloneElement as (elem: ReactElement, props: Record<string, unknown>) => ReactElement)(
        child,
        {
          ...sharedProps,
          className: [child.props.className, sharedProps.className].filter(Boolean).join(" "),
        },
      );
    }

    return (
      <div {...rest} {...sharedProps}>
        {children}
      </div>
    );
  },
);
