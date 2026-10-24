/* =============================================================================
   Checkbox
   -----------------------------------------------------------------------------
   A binary choice. It is a real `<input type="checkbox">` inside its own
   `<label>`, so the hit area, the keyboard behaviour and the form semantics are
   native — the visuals are a sibling span the input paints over. The box is
   never an ARIA stand-in.

   `indeterminate` is a distinct state (a partial selection), not a third value:
   it is set on the DOM node the way the HTML API intends, so assistive
   technology announces "partially checked".

   Tokens consumed (component layer → semantic → primitive):
     --choice-size, --choice-gap, --choice-group-gap
       → --space-*, literal px
     --color-primary, --color-primary-content, --color-primary-hover,
     --color-base-100, --color-base-content, --color-border-strong, --color-border-hover,
     --color-text-muted, --color-focus-ring, --focus-ring-width,
     --border-width-strong, --radius-xl, --opacity-disabled, --duration-fast,
     --ease-standard

   Radius is declared at the point of use: `var(--checkbox-radius,
   var(--radius-xl))`, so a surface can re-round one control without a token.

   Accessibility: a visible label is required and wraps the input, so clicking
   the text toggles the control. The focus ring is drawn on the painted box from
   `:focus-visible` on the input, never from `:focus`, so a mouse click does not
   ring. Colour is never the only signal — the checked state draws a glyph.
   ============================================================================= */

import { forwardRef, useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode } from "react";
import "./Checkbox.css";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "className"> {
  /** Visible label. Always rendered — a checkbox without one is not usable. */
  label: ReactNode;
  /** Supporting line under the label. */
  hint?: ReactNode;
  /** Partially selected: a dash instead of a tick, and a distinct announcement. */
  indeterminate?: boolean;
  className?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hint, indeterminate = false, id, disabled, className, ...rest },
  forwardedRef,
) {
  const reactId = useId();
  const fieldId = id ?? `nise-checkbox-${reactId}`;
  const hintId = `${fieldId}-hint`;
  const localRef = useRef<HTMLInputElement | null>(null);

  // `indeterminate` has no HTML attribute; it only exists as a DOM property.
  useEffect(() => {
    if (localRef.current) localRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const setRefs = (node: HTMLInputElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const classes = ["nise-checkbox", disabled ? "nise-checkbox--disabled" : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={classes} htmlFor={fieldId}>
      <span className="nise-checkbox__control">
        <input
          {...rest}
          ref={setRefs}
          id={fieldId}
          type="checkbox"
          disabled={disabled}
          aria-describedby={hint != null ? hintId : undefined}
          className="nise-checkbox__input"
        />
        <span className="nise-checkbox__box" aria-hidden="true" />
      </span>

      <span className="nise-checkbox__text">
        <span className="nise-checkbox__label">{label}</span>
        {hint != null ? (
          <span id={hintId} className="nise-checkbox__hint">
            {hint}
          </span>
        ) : null}
      </span>
    </label>
  );
});
