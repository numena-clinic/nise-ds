/* =============================================================================
   Skeleton
   -----------------------------------------------------------------------------
   A loading placeholder: a painted shape that stands where content is about to
   appear. It holds no meaning — not a status, not a verdict — so it is rendered
   `aria-hidden="true"` and must never be the only sign that a region is
   loading; the assistive announcement belongs to the actual state, not the
   shimmer.

   Tokens consumed:
     --control-height-md, --opacity-disabled
     --color-base-200, --duration-slow, --ease-standard
     --skeleton-radius (component layer; falls back to var(--radius-md) here)
   ============================================================================= */

import type { HTMLAttributes } from "react";
import "./Skeleton.css";

export interface SkeletonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "role" | "children" | "aria-hidden"> {
  className?: string;
}

export function Skeleton({ className, ...rest }: SkeletonProps) {
  return (
    <div
      {...rest}
      aria-hidden="true"
      className={["nise-skeleton", className].filter(Boolean).join(" ")}
    />
  );
}
