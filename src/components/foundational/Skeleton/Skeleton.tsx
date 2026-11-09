/* =============================================================================
   Skeleton
   -----------------------------------------------------------------------------
   A loading placeholder: a painted shape that stands where content is about to
   appear.

   Tokens consumed:
     --control-height-md, --opacity-disabled
     --color-base-200, --duration-slow, --ease-standard
     --skeleton-radius (component layer; falls back to var(--radius-md) here)
   ============================================================================= */

import type { HTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

export interface SkeletonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "role" | "children" | "aria-hidden"> {
  className?: string;
}

export function Skeleton({ className, ...rest }: SkeletonProps) {
  return (
    <div
      {...rest}
      aria-hidden="true"
      className={cn(
        "nise-skeleton block w-full h-[var(--control-height-md)] bg-base-200 rounded-[var(--skeleton-radius,var(--radius-md))] animate-[nise-pulse_calc(var(--duration-slow)*4)_var(--ease-standard)_infinite]",
        className,
      )}
    />
  );
}
