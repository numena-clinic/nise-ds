/* =============================================================================
   Kbd
   -----------------------------------------------------------------------------
   A key cap: shows what a keyboard shortcut is, or what key the interface is
   waiting for.

   Tokens consumed:
      --kbd-height (24px), --kbd-padding-x → --space-2, --kbd-font-size → --font-size-xs
      --color-base-200, --color-base-content, --color-border, --border-width
      --font-weight-medium, --radius-sm (via --kbd-radius fallback)
   ============================================================================= */

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../lib/cn";

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
}

export function Kbd({ className, children, ...rest }: KbdProps) {
  return (
    <kbd
      className={cn(
        "nise-kbd inline-flex items-center justify-center h-[var(--kbd-height)] px-[var(--kbd-padding-x)] font-sans text-[length:var(--kbd-font-size)] font-[var(--font-weight-medium)] leading-none text-base-content bg-base-200 border border-solid border-border rounded-[var(--kbd-radius,var(--radius-sm))] shadow-[var(--shadow-sm)] whitespace-nowrap",
        className,
      )}
      {...rest}
    >
      {children}
    </kbd>
  );
}
