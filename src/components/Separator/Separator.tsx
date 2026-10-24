/* =============================================================================
   Separator
   -----------------------------------------------------------------------------
   A hairline between groups of related content — sections of a note, toolbars,
   the parts of a session record. It is `role="separator"`; `orientation` maps
   to `aria-orientation` and to which dimension is cut. The rule itself carries
   no meaning and no interactivity — it splits structure by position alone,
   so it has no hover, focus or state treatment (motion-generative-patterns.md).

   `decorative` (default true) records the intent of the rule. A decorative
   separator is presentation machinery, reflected on `data-decorative`; a
   non-decorative one is expected to be named or described by its context.

   Tokens consumed:
     --separator-thickness
       → the primitive border scale; lives in the component layer, pinned at 1px
     --color-border
   ============================================================================= */

import { forwardRef, type HTMLAttributes } from "react";
import "./Separator.css";

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
      className={
        ["nise-separator", `nise-separator--${orientation}`, className]
          .filter(Boolean)
          .join(" ")
      }
    />
  );
});
