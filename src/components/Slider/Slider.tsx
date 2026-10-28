/** Single-thumb React Aria slider. Tokens: --slider-track-height,
 * --slider-thumb-size, --slider-gap and semantic roles. A native range input
 * inside the thumb provides keyboard, form and accessible value semantics. */
import { forwardRef, useId, type ReactNode } from "react";
import {
  Slider as AriaSlider,
  Label,
  SliderTrack,
  SliderThumb,
  Text,
  type SliderProps as AriaSliderProps,
} from "react-aria-components";
import "./Slider.css";
export interface SliderProps extends Omit<
  AriaSliderProps<number[]>,
  "className" | "children" | "minValue" | "maxValue" | "onChange"
> {
  label?: ReactNode;
  hint?: ReactNode;
  className?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  onValueChange?: (value: number[]) => void;
}
export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    label,
    hint,
    min = 0,
    max = 100,
    disabled,
    onValueChange,
    className,
    id,
    "aria-describedby": externalDescription,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const hintId = `${id ?? generatedId}-hint`;
  const describedBy =
    [externalDescription, hint != null ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <AriaSlider
      {...props}
      id={id}
      ref={ref}
      minValue={min}
      maxValue={max}
      isDisabled={disabled ?? props.isDisabled}
      onChange={onValueChange}
      className={["nise-slider", className].filter(Boolean).join(" ")}
    >
      {label != null && <Label className="nise-slider__label">{label}</Label>}
      {hint != null && (
        <Text id={hintId} slot="description" className="nise-slider__hint">
          {hint}
        </Text>
      )}
      <SliderTrack className="nise-slider__root">
        {({ state }) => (
          <>
            <div className="nise-slider__track">
              <div
                className="nise-slider__range"
                style={{ width: `${state.getThumbPercent(0) * 100}%` }}
              />
            </div>
            <SliderThumb
              className="nise-slider__thumb"
              aria-label={label == null ? props["aria-label"] : undefined}
              aria-describedby={describedBy}
            />
          </>
        )}
      </SliderTrack>
    </AriaSlider>
  );
});
