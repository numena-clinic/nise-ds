/* =============================================================================
   Tabs
   -----------------------------------------------------------------------------
   A Radix-backed tabs control (horizontal). ARIA semantics, roving tabindex and
   keyboard navigation come from Radix (D6). The tablist and panels are
   straightforward, with tokens for gap and padding.

   Tokens consumed: --tabs-gap, --tab-padding-x, --tab-height, plus focus ring,
   surface/border/text/action tokens.
   ============================================================================= */

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import "./Tabs.css";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentProps<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={["nise-tabs__list", className].filter(Boolean).join(" ")}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentProps<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={["nise-tabs__trigger", className].filter(Boolean).join(" ")}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentProps<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={["nise-tabs__content", className].filter(Boolean).join(" ")}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
