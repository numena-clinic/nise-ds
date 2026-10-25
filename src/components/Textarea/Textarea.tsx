/* =============================================================================
   Textarea
   -----------------------------------------------------------------------------
   A multi-line text control with a visible label, an optional hint and an
   optional error. It is TextField as a <textarea>: the label is always visible,
   the control sizes on the same slots, and the field skeleton
   (src/styles/field.css) so a labelled control reads the same.

   Tokens consumed (component layer → semantic → primitive):
      --textarea-padding-y            → --space-2
      --textarea-min-height           → literal px
      --input-padding-x               → --control-* → --space-3
      --control-font-size             → --font-size-md
      --field-gap, --field-label-gap, --field-message-font-size
      --color-base-100, --color-base-content, --color-text-muted, --color-border-strong,
      --color-border-hover, --color-border-error, --color-focus-ring, --focus-ring-width,
      --border-width, --line-height-normal, --opacity-disabled, --duration-fast,
      --ease-standard

   Error handling matches TextField: text, an icon and a heavier boundary —
   never color alone (color.md §4). When an error is present the hint is
   removed from the DOM, and `aria-describedby` never points at an id that is
   not rendered. `required` maps to the native attribute and an aria-hidden
   marker, so the label reads cleanly.

   Radius is declared at the point of use: `var(--textarea-radius,
   var(--radius-md))`.
   ============================================================================= */

import {
  forwardRef,
  useId,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { AlertIcon } from "../../icons";
import "./Textarea.css";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className"> {
  id?: string;
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { id, label, hint, error, rows = 4, disabled, required, className, ...rest },
    ref,
  ) {
    const reactId = useId();
    const fieldId = id ?? `nise-textarea-${reactId}`;
    const hintId = `${fieldId}-hint`;
    const errorId = `${fieldId}-error`;

    const showHint = hint != null && error == null;
    const describedBy =
      [showHint ? hintId : null, error != null ? errorId : null]
        .filter(Boolean)
        .join(" ") || undefined;

    const classes = [
      "nise-field",
      "nise-textarea",
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

        <textarea
          {...rest}
          ref={ref}
          id={fieldId}
          rows={rows}
          className="nise-textarea__control"
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
