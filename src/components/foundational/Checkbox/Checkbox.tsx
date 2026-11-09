/* =============================================================================
   Checkbox
   -----------------------------------------------------------------------------
   A binary choice. It is a real `<input type="checkbox">` inside its own
   `<label>`, so the hit area, the keyboard behaviour and the form semantics are
   native — the visuals are a sibling span the input paints over.

   Tokens consumed (component layer → semantic → primitive):
     --choice-size, --choice-gap, --choice-group-gap
     --color-primary, --color-primary-content, --color-primary-hover,
     --color-base-100, --color-base-content, --color-border-strong, --color-border-hover,
     --color-text-muted, --color-focus-ring, --focus-ring-width
   ============================================================================= */

import { forwardRef, useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../../lib/cn";

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

  useEffect(() => {
    if (localRef.current) localRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const setRefs = (node: HTMLInputElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const describedBy = [rest["aria-describedby"], hint != null ? hintId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <label
      className={cn(
        "nise-checkbox inline-flex items-start gap-[var(--choice-gap)] min-h-[var(--control-height-sm)] py-[var(--space-1)] cursor-pointer select-none font-sans text-base-content",
        disabled && "nise-checkbox--disabled opacity-[var(--opacity-disabled)] cursor-not-allowed",
        className,
      )}
      htmlFor={fieldId}
    >
      <span className="nise-checkbox__control relative inline-flex items-center justify-center shrink-0 size-[var(--choice-size)] mt-[var(--control-label-gap)]">
        <input
          {...rest}
          ref={setRefs}
          id={fieldId}
          type="checkbox"
          disabled={disabled}
          aria-describedby={describedBy}
          className="nise-checkbox__input peer absolute inset-0 m-0 size-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <span
          className={cn(
            "nise-checkbox__box relative inline-flex items-center justify-center size-[var(--choice-size)] rounded-[var(--checkbox-radius,var(--radius-sm))] bg-base-100 border border-solid border-border-strong text-primary-content transition-[background-color,border-color,color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
            "peer-hover:not-peer-disabled:border-border-hover",
            "peer-checked:bg-primary peer-checked:border-primary peer-indeterminate:bg-primary peer-indeterminate:border-primary",
            "peer-focus-visible:outline-[length:var(--focus-ring-width)] peer-focus-visible:outline-focus-ring peer-focus-visible:outline-offset-[var(--focus-ring-offset)]",
            "after:content-[''] after:hidden peer-checked:after:block peer-checked:after:w-[var(--space-1)] peer-checked:after:h-[var(--space-2)] peer-checked:after:border-r-[length:var(--border-width-strong)] peer-checked:after:border-b-[length:var(--border-width-strong)] peer-checked:after:border-primary-content peer-checked:after:rotate-45 peer-checked:after:-translate-y-px",
            "peer-indeterminate:after:block peer-indeterminate:after:w-[var(--space-2)] peer-indeterminate:after:h-0 peer-indeterminate:after:border-b-[length:var(--border-width-strong)] peer-indeterminate:after:border-primary-content peer-indeterminate:after:rotate-0 peer-indeterminate:after:translate-y-0",
          )}
          aria-hidden="true"
        />
      </span>

      <span className="nise-checkbox__text flex flex-col gap-[var(--control-label-gap)]">
        <span className="nise-checkbox__label text-[length:var(--font-size-sm)] font-[var(--font-weight-medium)] leading-[var(--line-height-snug)] text-base-content">
          {label}
        </span>
        {hint != null ? (
          <span
            id={hintId}
            className="nise-checkbox__hint text-[length:var(--font-size-xs)] leading-[var(--line-height-snug)] text-text-muted"
          >
            {hint}
          </span>
        ) : null}
      </span>
    </label>
  );
});
