/* =============================================================================
   AspectRatio
   -----------------------------------------------------------------------------
   A frame that keeps its shape whatever the content inside does: a chart
   illustration, a scan, a video.
   ============================================================================= */

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../lib/cn";

export interface AspectRatioProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
  /** Width ÷ height to reserve. Defaults to 16/9. */
  ratio?: number;
  children: ReactNode;
  className?: string;
}

export function AspectRatio({
  ratio = 16 / 9,
  children,
  className,
  style,
  ...rest
}: AspectRatioProps) {
  return (
    <div
      {...rest}
      style={{ ...style, aspectRatio: String(ratio) }}
      className={cn("nise-aspect-ratio relative w-full overflow-hidden", className)}
    >
      <div className="nise-aspect-ratio__content absolute inset-0 flex items-center justify-center [&>img]:size-full [&>img]:object-cover [&>video]:size-full [&>video]:object-cover">
        {children}
      </div>
    </div>
  );
}
