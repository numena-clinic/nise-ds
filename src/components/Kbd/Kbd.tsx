/* =============================================================================
   Kbd
   -----------------------------------------------------------------------------
   A key cap: shows what a keyboard shortcut is, or what key the interface is
   waiting for. It labels, it never acts — a shortcut hint beside a menu item,
   not a control. The typeface is the house sans — the brand publishes no mono
   face, so the small, medium-weight size carries the key-cap look on its own.

   Tokens consumed:
      --kbd-height (24px), --kbd-padding-x → --space-2, --kbd-font-size → --font-size-xs
      --color-base-200, --color-base-content, --color-border, --border-width
      --font-weight-medium, --radius-sm (via --kbd-radius fallback)
   ============================================================================= */

import type { HTMLAttributes, ReactNode } from "react";
import "./Kbd.css";

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
}

export function Kbd({ className, children, ...rest }: KbdProps) {
  const classes = ["nise-kbd", className].filter(Boolean).join(" ");
  return (
    <kbd className={classes} {...rest}>
      {children}
    </kbd>
  );
}
