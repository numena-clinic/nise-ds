/* =============================================================================
   Progress
   -----------------------------------------------------------------------------
   A determinate or indeterminate meter: how far an upload, an export, a session
   capture has advanced. It is `role="progressbar"` — a reporter of machine
   state, never an interactive control (a Slider takes input; a Progress only
   reflects it).

   `value` is the only state: a number paints a determinate bar and exposes
   `aria-valuemin` / `aria-valuemax` / `aria-valuenow`; `null` means the amount
   is unknown — `aria-valuenow` is omitted and the fill runs an indeterminate
   sweep, marked with `data-state="indeterminate"`. A value outside `0…max` is
   clipped for the painted width only; the announced value is the one handed in.

   The meter is never bare: `aria-label` is required, because a painted bar has
   no text of its own and "colour must not carry state by itself" (color.md §4).

   Tokens consumed:
     --progress-height
       → the primitive space scale; lives in the component layer, pinned at 8px
     --color-base-200, --color-primary, --duration-medium, --duration-slow,
     --ease-standard
   ============================================================================= */

import { forwardRef, type HTMLAttributes } from "react";
import "./Progress.css";

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
      className={["nise-progress", className].filter(Boolean).join(" ")}
    >
      <span
        className="nise-progress__fill"
        style={value == null ? undefined : { width }}
      />
    </div>
  );
});
