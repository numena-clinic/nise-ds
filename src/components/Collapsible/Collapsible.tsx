/* =============================================================================
   Collapsible
   -----------------------------------------------------------------------------
   A disclosure region — release notes, advanced options — built on the native
   <details>/<summary> pair. The disclosure is accessible natively: the name
   comes from the summary text, the toggle from the summary itself; the
   component adds styling, a trailing chevron and nothing else.

   The chevron is decorative (aria-hidden) and rotates a quarter turn when the
   region is open. Content of a closed region stays in the DOM (native
   details hides it) rather than unmounting. `open`, when passed, is one-way:
   the component re-applies it on render, so native user toggles are corrected
   back on the next re-render — prefer `defaultOpen` for initial state only.
   Animation is native and therefore instant; an open/close transition would
   need To Do JS and looks intentional in its absence here for now.

   Tokens consumed:
     --color-base-content, --color-base-hover, --color-focus-ring,
     --focus-ring-width, --focus-ring-offset
     --font-sans, --font-weight-medium, --radius-sm --space-{1,2}
     (point of use: var(--collapsible-radius, var(--radius-sm)))
     --duration-fast, --ease-standard
   ============================================================================= */

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChevronRightIcon } from "../../icons";
import "./Collapsible.css";

export interface CollapsibleProps extends HTMLAttributes<HTMLDetailsElement> {
  /** Open on render, then left to the user. */
  defaultOpen?: boolean;
  /** One-way controlled state: re-applied against user toggles on re-render. */
  open?: boolean;
  children?: ReactNode;
}

export const Collapsible = forwardRef<HTMLDetailsElement, CollapsibleProps>(
  function Collapsible(
    { defaultOpen, open, children, className, ...rest },
    ref,
  ) {
    const initial = defaultOpen ? true : undefined;
    return (
      <details
        {...rest}
        ref={ref}
        className={["nise-collapsible", className].filter(Boolean).join(" ")}
        open={open !== undefined ? open : initial}
      >
        {children}
      </details>
    );
  },
);

export interface CollapsibleTriggerProps
  extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export const CollapsibleTrigger = forwardRef<HTMLElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger({ children, className, ...rest }, ref) {
    return (
      <summary
        {...rest}
        ref={ref}
        className={["nise-collapsible__trigger", className]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
        <ChevronRightIcon size={16} className="nise-collapsible__chevron" />
      </summary>
    );
  },
);

export interface CollapsibleContentProps
  extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent({ className, ...rest }, ref) {
    return (
      <div
        {...rest}
        ref={ref}
        className={["nise-collapsible__content", className].filter(Boolean).join(" ")}
      />
    );
  },
);
