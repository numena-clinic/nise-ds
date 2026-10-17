/* =============================================================================
   Radio
   -----------------------------------------------------------------------------
   A single choice from a group. The control is a real `<input type="radio">`
   inside its label; grouping is handled via the `name` attribute, as in HTML.
   Visuals follow the same box logic as Checkbox but with a round indicator.

   Tokens consumed: the same `--choice-*` and surface/focus tokens as Checkbox.
   Accessibility: the label is visible and wraps the input. Colour is not the
   only signal — the selected state fills a disc. No ARIA role is asserted that
   duplicates the native control.
   ============================================================================= */

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import "./Radio.css";

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
  label: ReactNode;
  hint?: ReactNode;
  className?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, hint, id, disabled, className, ...rest },
  ref,
) {
  const reactId = useId();
  const fieldId = id ?? `nise-radio-${reactId}`;
  const hintId = `${fieldId}-hint`;

  const classes = ["nise-radio", disabled ? "nise-radio--disabled" : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={classes} htmlFor={fieldId}>
      <span className="nise-radio__control">
        <input
          {...rest}
          ref={ref}
          id={fieldId}
          type="radio"
          disabled={disabled}
          aria-describedby={hint != null ? hintId : undefined}
          className="nise-radio__input"
        />
        <span className="nise-radio__box" aria-hidden="true" />
      </span>

      <span className="nise-radio__text">
        <span className="nise-radio__label">{label}</span>
        {hint != null ? (
          <span id={hintId} className="nise-radio__hint">
            {hint}
          </span>
        ) : null}
      </span>
    </label>
  );
});
