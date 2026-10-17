/* =============================================================================
   TextField
   -----------------------------------------------------------------------------
   A single-line text control with a visible label, an optional hint and an
   optional error. The label is always visible — a placeholder is not a label
   (iconography.md §5, "label by default").

   Tokens consumed:
     --field-gap, --field-label-gap, --field-message-font-size
     --input-height, --input-padding-x, --input-font-size
       → --control-* → --space-3, --font-size-md
     --color-surface, --color-text, --color-text-muted, --color-border-strong,
     --color-focus-ring, --focus-ring-width, --border-width-strong, --opacity-disabled

   Error handling: there is no status colour in the brand palette — "the palette
   does not establish fixed colors for … system statuses" (color.md §4) and
   "semantic status colors are not defined yet … system-state icons such as
   warnings use Ink Plum, with their shape and a text label doing the work"
   (iconography.md §4). So an error is carried by text, an icon and a heavier
   boundary, never by colour alone. When an error is present the hint is removed
   from the DOM, and `aria-describedby` never points at an id that is not
   rendered. `required` maps to the native attribute and an aria-hidden marker,
   so the label reads cleanly.

   Radius is declared at the point of use: `var(--input-radius, var(--radius-md))`.
   ============================================================================= */

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertIcon } from "../../icons";
import "./TextField.css";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> {
  id?: string;
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ id, label, hint, error, disabled, required, className, ...rest }, ref) {
    const reactId = useId();
    const fieldId = id ?? `nise-textfield-${reactId}`;
    const hintId = `${fieldId}-hint`;
    const errorId = `${fieldId}-error`;

    const showHint = hint != null && error == null;
    const describedBy =
      [showHint ? hintId : null, error != null ? errorId : null]
        .filter(Boolean)
        .join(" ") || undefined;

    const classes = [
      "nise-field",
      error != null ? "nise-field--error" : null,
      disabled ? "nise-field--disabled" : null,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={classes}>
        <label className="nise-field__label" htmlFor={fieldId}>
          <span>{label}</span>
          {required ? (
            <span className="nise-field__required" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>

        <input
          {...rest}
          ref={ref}
          id={fieldId}
          className="nise-field__control"
          disabled={disabled}
          required={required}
          aria-invalid={error != null ? true : undefined}
          aria-describedby={describedBy}
        />

        {showHint ? (
          <p id={hintId} className="nise-field__message nise-field__hint">
            {hint}
          </p>
        ) : null}

        {error != null ? (
          <p id={errorId} className="nise-field__message nise-field__error">
            <AlertIcon size={16} className="nise-field__message-icon" />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    );
  },
);
