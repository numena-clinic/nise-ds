/* =============================================================================
   Slider
   -----------------------------------------------------------------------------
   Single-thumb Base UI slider. Tokens: --slider-track-height,
   --slider-thumb-size, --slider-gap and semantic roles. A native range input
   inside the thumb provides keyboard, form and accessible value semantics.
   ============================================================================= */

import { forwardRef, useId, type HTMLAttributes, type ReactNode } from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { cn } from "../../../lib/cn";

export interface SliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  label?: ReactNode;
  hint?: ReactNode;
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  isDisabled?: boolean;
  name?: string;
  onValueChange?: (value: number[]) => void;
  className?: string;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    label,
    hint,
    value,
    defaultValue = [0],
    min = 0,
    max = 100,
    step = 1,
    disabled,
    isDisabled,
    name,
    onValueChange,
    className,
    id,
    "aria-label": ariaLabel,
    "aria-describedby": externalDescription,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const rootId = id ?? `nise-slider-${generatedId}`;
  const labelId = `${rootId}-label`;
  const hintId = `${rootId}-hint`;
  const isSliderDisabled = disabled ?? isDisabled;

  const describedBy =
    [externalDescription, hint != null ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <BaseSlider.Root
      {...props}
      id={rootId}
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      disabled={isSliderDisabled}
      name={name}
      onValueChange={(next) => {
        const arr = Array.isArray(next) ? [...next] : [next];
        onValueChange?.(arr);
      }}
      className={cn(
        "nise-slider flex flex-col gap-[var(--field-gap)] w-full font-sans text-base-content",
        isSliderDisabled && "opacity-[var(--opacity-disabled)] cursor-not-allowed",
        className,
      )}
    >
      {label != null && (
        <label
          id={labelId}
          className="nise-slider__label text-[length:var(--font-size-sm)] font-[var(--font-weight-medium)] leading-[var(--line-height-snug)] text-base-content"
        >
          {label}
        </label>
      )}
      {hint != null && (
        <p
          id={hintId}
          className="nise-slider__hint m-0 text-[length:var(--font-size-xs)] leading-[var(--line-height-snug)] text-text-muted"
        >
          {hint}
        </p>
      )}
      <BaseSlider.Control className="nise-slider__root relative flex items-center w-full h-[var(--control-height-sm)] select-none touch-none cursor-pointer data-[disabled]:cursor-not-allowed">
        <BaseSlider.Track className="nise-slider__track relative w-full h-[var(--slider-track-height)] rounded-full bg-base-300">
          <BaseSlider.Indicator className="nise-slider__range h-full rounded-full bg-primary" />
          <BaseSlider.Thumb
            aria-label={label == null ? ariaLabel : undefined}
            aria-labelledby={label != null ? labelId : undefined}
            aria-describedby={describedBy}
            className="nise-slider__thumb block size-[var(--slider-thumb-size)] rounded-full bg-base-100 border-[length:var(--border-width-strong)] border-solid border-primary shadow-[var(--shadow-sm)] transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:not-data-[disabled]:scale-110 focus-visible:outline-[length:var(--focus-ring-width)] focus-visible:outline-focus-ring focus-visible:outline-offset-[var(--focus-ring-offset)]"
          />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
});
