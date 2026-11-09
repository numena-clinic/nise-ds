/* =============================================================================
   Switch
   -----------------------------------------------------------------------------
   An on/off toggle (a binary state that takes effect immediately in the UI, as
   opposed to a checkbox that belongs in a form submission). It is a real checkbox
   visually styled as a track+knob so keyboard and form semantics remain native.

   Tokens consumed: --switch-width, --switch-height, --switch-knob,
   --switch-inset, plus surface/action/border/focus tokens.
   ============================================================================= */

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../../lib/cn";

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

  return (
    <label
      className={cn(
        "nise-switch inline-flex items-start gap-[var(--choice-gap)] min-h-[var(--control-height-sm)] py-[var(--space-1)] cursor-pointer select-none font-sans text-base-content",
        disabled && "nise-switch--disabled opacity-[var(--opacity-disabled)] cursor-not-allowed",
        className,
      )}
      htmlFor={fieldId}
    >
      <span className="nise-switch__control relative inline-flex items-center shrink-0 w-[var(--switch-width)] h-[var(--switch-height)]">
        <input
          {...rest}
          ref={ref}
          id={fieldId}
          type="checkbox"
          disabled={disabled}
          aria-describedby={describedBy}
          className="nise-switch__input peer absolute inset-0 m-0 size-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <span
          className={cn(
            "nise-switch__track relative inline-block w-[var(--switch-width)] h-[var(--switch-height)] rounded-full bg-border-strong transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
            "peer-hover:not-peer-disabled:bg-border-hover",
            "peer-checked:bg-primary peer-checked:peer-hover:not-peer-disabled:bg-primary-hover",
            "peer-focus-visible:outline-[length:var(--focus-ring-width)] peer-focus-visible:outline-focus-ring peer-focus-visible:outline-offset-[var(--focus-ring-offset)]",
            "peer-checked:[&_.nise-switch__knob]:translate-x-[calc(var(--switch-width)-var(--switch-knob)-2*var(--switch-inset))]",
          )}
          aria-hidden="true"
        >
          <span className="nise-switch__knob absolute left-[var(--switch-inset)] top-[calc((var(--switch-height)-var(--switch-knob))/2)] size-[var(--switch-knob)] rounded-full bg-base-100 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)]" />
        </span>
      </span>

      <span className="nise-switch__text flex flex-col gap-[var(--control-label-gap)]">
        <span className="nise-switch__label text-[length:var(--font-size-sm)] font-[var(--font-weight-medium)] leading-[var(--line-height-snug)] text-base-content">
          {label}
        </span>
        {hint != null ? (
          <span
            id={hintId}
            className="nise-switch__hint text-[length:var(--font-size-xs)] leading-[var(--line-height-snug)] text-text-muted"
          >
            {hint}
          </span>
        ) : null}
      </span>
    </label>
  );
});
