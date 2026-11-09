/* =============================================================================
   Radio
   -----------------------------------------------------------------------------
   A single choice from a group. The control is a real `<input type="radio">`
   inside its label; grouping is handled via the `name` attribute, as in HTML.

   Tokens consumed: the same `--choice-*` and surface/focus tokens as Checkbox.
   ============================================================================= */

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../../lib/cn";

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
  const describedBy = [rest["aria-describedby"], hint != null ? hintId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <label
      className={cn(
        "nise-radio inline-flex items-start gap-[var(--choice-gap)] min-h-[var(--control-height-sm)] py-[var(--space-1)] cursor-pointer select-none font-sans text-base-content",
        disabled && "nise-radio--disabled opacity-[var(--opacity-disabled)] cursor-not-allowed",
        className,
      )}
      htmlFor={fieldId}
    >
      <span className="nise-radio__control relative inline-flex items-center justify-center shrink-0 size-[var(--choice-size)] mt-[var(--control-label-gap)]">
        <input
          {...rest}
          ref={ref}
          id={fieldId}
          type="radio"
          disabled={disabled}
          aria-describedby={describedBy}
          className="nise-radio__input peer absolute inset-0 m-0 size-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <span
          className={cn(
            "nise-radio__box relative inline-flex items-center justify-center size-[var(--choice-size)] rounded-full bg-base-100 border border-solid border-border-strong transition-[border-color,background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
            "peer-hover:not-peer-disabled:border-border-hover",
            "peer-checked:border-primary",
            "peer-focus-visible:outline-[length:var(--focus-ring-width)] peer-focus-visible:outline-focus-ring peer-focus-visible:outline-offset-[var(--focus-ring-offset)]",
            "after:content-[''] after:hidden peer-checked:after:block peer-checked:after:size-[var(--space-2)] peer-checked:after:rounded-full peer-checked:after:bg-primary",
          )}
          aria-hidden="true"
        />
      </span>

      <span className="nise-radio__text flex flex-col gap-[var(--control-label-gap)]">
        <span className="nise-radio__label text-[length:var(--font-size-sm)] font-[var(--font-weight-medium)] leading-[var(--line-height-snug)] text-base-content">
          {label}
        </span>
        {hint != null ? (
          <span
            id={hintId}
            className="nise-radio__hint text-[length:var(--font-size-xs)] leading-[var(--line-height-snug)] text-text-muted"
          >
            {hint}
          </span>
        ) : null}
      </span>
    </label>
  );
});
