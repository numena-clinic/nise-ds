/* =============================================================================
   Tooltip
   -----------------------------------------------------------------------------
   A Radix-backed tooltip for supplemental text. It must never be the only way
   to convey information (accessibility: prefer a visible label). Content portals
   so it is not clipped; `container` lets a scoped theme (the Theme Explorer
   preview) keep the popup inside its wrapper. Requires a `TooltipProvider`.

   Tokens consumed: --tooltip-padding-x, --tooltip-padding-y, --tooltip-font-size,
   plus --color-base-100, --color-base-content, --border-width, --color-border-strong
   and radius/shadow from primitives.
   ============================================================================= */

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import "./Tooltip.css";

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

export interface TooltipContentProps extends React.ComponentProps<typeof TooltipPrimitive.Content> {
  /** Where to mount the popup. Point it at a scoped theme wrapper, if any. */
  container?: React.ComponentProps<typeof TooltipPrimitive.Portal>["container"];
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 8, container, ...props }, ref) => (
  <TooltipPrimitive.Portal container={container}>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={["nise-tooltip__content", className].filter(Boolean).join(" ")}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent };
