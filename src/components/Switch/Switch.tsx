/* =============================================================================
   Switch
   -----------------------------------------------------------------------------
   An on/off toggle (a binary state that takes effect immediately in the UI, as
   opposed to a checkbox that belongs in a form submission). It is a real checkbox
   visually styled as a track+knob so keyboard and form semantics remain native;
   the painted switch is a sibling. "No color alone" (iconography.md §5): the
   on/off is announced by the input's checked state and the visual contrast is
   structural (track vs knob), not a new verdict color.

   Tokens consumed: --switch-width, --switch-height, --switch-knob,
   --switch-inset, plus surface/action/border/focus tokens.
   ============================================================================= */

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import "./Switch.css";

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
  label: ReactNode;
  hint?: ReactNode;
  className?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, hint, id, disabled, className, ...rest },
  ref,
) {
  const reactId = useId();
  const fieldId = id ?? `nise-switch-${reactId}`;
  const hintId = `${fieldId}-hint`;
  const describedBy = [rest["aria-describedby"], hint != null ? hintId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  const classes = ["nise-switch", disabled ? "nise-switch--disabled" : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={classes} htmlFor={fieldId}>
      <span className="nise-switch__control">
        <input
          {...rest}
          ref={ref}
          id={fieldId}
          type="checkbox"
          disabled={disabled}
          aria-describedby={describedBy}
          className="nise-switch__input"
        />
        <span className="nise-switch__track" aria-hidden="true">
          <span className="nise-switch__knob" />
        </span>
      </span>

      <span className="nise-switch__text">
        <span className="nise-switch__label">{label}</span>
        {hint != null ? (
          <span id={hintId} className="nise-switch__hint">
            {hint}
          </span>
        ) : null}
      </span>
    </label>
  );
});
