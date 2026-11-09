/* =============================================================================
   Progress
   -----------------------------------------------------------------------------
   A determinate or indeterminate meter: how far an upload, an export, a session
   capture has advanced.

   Tokens consumed:
     --progress-height
     --color-base-200, --color-primary, --duration-medium, --duration-slow,
     --ease-standard
   ============================================================================= */

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

export type ProgressState = "determinate" | "indeterminate";

export interface ProgressProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "role" | "children" | "className"> {
  /** Current reading, or `null` for an indeterminate meter. */
  value: number | null;
  /** Highest reading the scale reaches. Defaults to 100. */
  max?: number;
  /** Accessible name — required; a painted bar has no text of its own. */
  "aria-label": string;
  className?: string;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, className, ...rest },
  ref,
) {
  const state: ProgressState = value == null ? "indeterminate" : "determinate";
  const width = value == null ? undefined : `${Math.max(0, Math.min((value / max) * 100, 100))}%`;

  return (
    <div
      {...rest}
      ref={ref}
      role="progressbar"
      data-state={state}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value == null ? undefined : value}
      className={cn(
        "nise-progress relative w-full h-[var(--progress-height)] overflow-hidden bg-base-200 rounded-[var(--progress-radius,var(--radius-full))]",
        className,
      )}
    >
      <span
        className={cn(
          "nise-progress__fill block h-full bg-primary rounded-[var(--progress-radius,var(--radius-full))] transition-[width] duration-[var(--duration-medium)] ease-[var(--ease-standard)]",
          state === "indeterminate" &&
            "w-2/5 animate-[nise-indeterminate_calc(var(--duration-slow)*4)_var(--ease-standard)_infinite]",
        )}
        style={value == null ? undefined : { width }}
      />
    </div>
  );
});
