# Tooltip

`TooltipProvider` sets a default `delayDuration` (700ms). `TooltipRoot`,
`TooltipTrigger` and `TooltipContent` use React Aria TooltipTrigger, Button and
Tooltip for keyboard-focus and hover behavior, Escape and the trigger's
accessible description. `asChild` accepts a ref-forwarding Nise Button.

Content supports `container` for scoped themes and `sideOffset` for positioning.
A tooltip supplies supplemental information; visible labels and essential
instructions must not depend on hovering. Browser tests exercise keyboard
opening and Escape dismissal. Use component stories for the supported API.
