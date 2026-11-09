/* =============================================================================
   TextField
   -----------------------------------------------------------------------------
   A single-line text control with a visible label, an optional hint and an
   optional error. The label is always visible — a placeholder is not a label
   (iconography.md §5, "label by default").

   Tokens consumed:
     --field-gap, --field-label-gap, --field-message-font-size
     --input-height, --input-padding-x, --input-font-size
     --color-base-100, --color-base-content, --color-text-muted, --color-border-strong,
     --color-border-hover, --color-border-error, --color-focus-ring, --focus-ring-width,
     --border-width-strong, --opacity-disabled
   ============================================================================= */

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertIcon } from "../../../icons";
import { cn } from "../../../lib/cn";

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

    const isInvalid = error != null ? true : rest["aria-invalid"];
    const hasErrorClass = error != null || isInvalid === true || isInvalid === "true";

    const showHint = hint != null && error == null;
    const describedBy =
      [rest["aria-describedby"], showHint ? hintId : null, error != null ? errorId : null]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div
        className={cn(
          "nise-field flex flex-col gap-[var(--field-gap)] font-sans text-base-content",
          hasErrorClass && "nise-field--error",
          disabled && "nise-field--disabled opacity-[var(--opacity-disabled)]",
          className,
        )}
      >
        <label
          className="nise-field__label inline-flex items-baseline gap-[var(--field-label-gap)] text-[length:var(--font-size-sm)] font-[var(--font-weight-medium)] leading-[var(--line-height-snug)] text-base-content"
          htmlFor={fieldId}
        >
          <span>{label}</span>
          {required ? (
            <span className="nise-field__required text-error" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>

        <input
          {...rest}
          ref={ref}
          id={fieldId}
          className={cn(
            "nise-field__control w-full h-[var(--input-height)] px-[var(--input-padding-x)] font-sans text-[length:var(--input-font-size)] text-base-content bg-base-100 rounded-[var(--input-radius,var(--radius-md))] border border-solid border-border-strong transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] placeholder:text-text-muted hover:not-disabled:border-border-hover focus-visible:outline-[length:var(--focus-ring-width)] focus-visible:outline-focus-ring focus-visible:outline-offset-0 disabled:cursor-not-allowed",
            hasErrorClass && "border-[length:var(--border-width-strong)] border-border-error hover:not-disabled:border-border-error",
          )}
          disabled={disabled}
          required={required}
          aria-invalid={isInvalid}
          aria-describedby={describedBy}
        />

        {showHint ? (
          <p
            id={hintId}
            className="nise-field__message nise-field__hint m-0 text-[length:var(--field-message-font-size)] leading-[var(--line-height-snug)] text-text-muted"
          >
            {hint}
          </p>
        ) : null}

        {error != null ? (
          <p
            id={errorId}
            className="nise-field__message nise-field__error m-0 inline-flex items-center gap-[var(--space-1)] text-[length:var(--field-message-font-size)] font-[var(--font-weight-medium)] leading-[var(--line-height-snug)] text-error"
          >
            <AlertIcon size={16} className="nise-field__message-icon shrink-0" />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    );
  },
);
