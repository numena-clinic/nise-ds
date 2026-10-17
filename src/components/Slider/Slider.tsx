/* =============================================================================
   Slider
   -----------------------------------------------------------------------------
   A Radix-backed single-value slider for range selection. ARIA semantics are
   provided by Radix; this wrapper forwards `aria-label` / `aria-labelledby` to
   the thumb (via Radix props) and adds a visible label/hint when you pass them
   so the control reads well. Per D6, Radix is used where the ARIA is hard.

   Tokens consumed: --slider-track-height, --slider-thumb-size, plus focus ring,
   action/surface/border tokens.
   ============================================================================= */

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import "./Slider.css";

export interface SliderProps
  extends React.ComponentProps<typeof SliderPrimitive.Root> {
  /** Visible label, shown above the track. */
  label?: React.ReactNode;
  /** Supporting hint below the label. */
  hint?: React.ReactNode;
  /** Accessible name; falls through to the thumb when not using a label id. */
  "aria-label"?: string;
  /** IDs of the element that labels this slider. */
  "aria-labelledby"?: string;
  className?: string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(function Slider({ className, label, hint, ...props }, ref) {
  const reactId = React.useId();
  const baseId = props.id ?? `nise-slider-${reactId}`;
  const described = [hint ? `${baseId}-hint` : null, props["aria-describedby"] || null]
    .filter(Boolean)
    .join(" ") || undefined;

  const rootProps = {
    ...props,
    id: baseId,
    "aria-describedby": described || props["aria-describedby"],
  };

  return (
    <div className={["nise-slider", className].filter(Boolean).join(" ")}>
      {label ? (
        <span className="nise-slider__label" id={`${baseId}-label`}>
          {label}
        </span>
      ) : null}
      {hint ? (
        <span className="nise-slider__hint" id={`${baseId}-hint`}>
          {hint}
        </span>
      ) : null}
      <SliderPrimitive.Root
        ref={ref}
        className="nise-slider__root"
        {...rootProps}
        aria-labelledby={label ? `${baseId}-label` : props["aria-labelledby"]}
      >
        <SliderPrimitive.Track className="nise-slider__track">
          <SliderPrimitive.Range className="nise-slider__range" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="nise-slider__thumb"
          aria-label={props["aria-label"]}
          aria-labelledby={label ? `${baseId}-label` : props["aria-labelledby"]}
        />
      </SliderPrimitive.Root>
    </div>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
