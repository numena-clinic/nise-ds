/* =============================================================================
   AspectRatio
   -----------------------------------------------------------------------------
   A frame that keeps its shape whatever the content inside does: a chart
   illustration, a scan, a video. The frame reserves the ratio up front
   (`aspect-ratio`), so the page does not jump while an asset streams in; the
   content wrapper fills the reserved box absolutely and the caller fits
   against it (`object-fit: cover` on an image is the usual move).

   Tokens consumed: none — geometry only (the ratio is a prop, not a themeable
   value). The tinted surface shown in stories is --color-tint-cyan.
   ============================================================================= */

import type { HTMLAttributes, ReactNode } from "react";
import "./AspectRatio.css";

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
      className={["nise-aspect-ratio", className].filter(Boolean).join(" ")}
    >
      <div className="nise-aspect-ratio__content">{children}</div>
    </div>
  );
}
