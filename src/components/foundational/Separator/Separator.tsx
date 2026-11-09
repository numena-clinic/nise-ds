/* =============================================================================
   Separator
   -----------------------------------------------------------------------------
   A hairline between groups of related content — sections of a note, toolbars,
   the parts of a session record.

   Tokens consumed:
     --separator-thickness
     --color-border
   ============================================================================= */

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

export type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "role" | "orientation" | "className"> {
  /** Which way the rule runs. Defaults to horizontal. */
  orientation?: SeparatorOrientation;
  /** True (default) when the rule is presentation only. */
  decorative?: boolean;
  className?: string;
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { orientation = "horizontal", decorative = true, className, ...rest },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      data-decorative={decorative || undefined}
      className={cn(
        "nise-separator shrink-0 bg-border",
        orientation === "horizontal"
          ? "nise-separator--horizontal w-full h-[var(--separator-thickness)]"
          : "nise-separator--vertical h-full w-[var(--separator-thickness)] self-stretch",
        className,
      )}
    />
  );
});
