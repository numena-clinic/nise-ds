/* =============================================================================
   Select
   -----------------------------------------------------------------------------
   Labelled Base UI Select. Base UI owns form semantics, typeahead, focus and
   popup dismissal. Nise owns the value/options API and Tailwind v4 token styling.
   Tokens: --select-*, --field-* and semantic color, border and focus roles.
   ============================================================================= */

import { useId, type ReactNode } from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { AlertIcon, CheckIcon, ChevronDownIcon } from "../../../icons";
import { cn } from "../../../lib/cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  id?: string;
  label: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
  /**
   * Where to mount the popup. Defaults to the document body.
   */
  portalContainer?: HTMLElement | null;
}

export function Select({
  id,
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select an option",
  hint,
  error,
  disabled,
  required,
  name,
  className,
  portalContainer,
}: SelectProps) {
  const reactId = useId();
  const fieldId = id ?? `nise-select-${reactId}`;
  const valueId = `${fieldId}-value`;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;

  const showHint = hint != null && error == null;
  const describedBy =
    [showHint ? hintId : null, error != null ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const items = Object.fromEntries(options.map((opt) => [opt.value, opt.label]));

  return (
    <div
      className={cn(
        "nise-field nise-select flex flex-col gap-[var(--field-gap)] font-sans text-base-content",
        error != null && "nise-field--error",
        disabled && "nise-field--disabled opacity-[var(--opacity-disabled)]",
        className,
      )}
    >
      <BaseSelect.Root
        id={fieldId}
        items={items}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(val) => {
          if (val != null) onValueChange?.(String(val));
        }}
        disabled={disabled}
        required={required}
        name={name}
      >
        <BaseSelect.Label
          className="nise-field__label inline-flex items-baseline gap-[var(--field-label-gap)] text-[length:var(--font-size-sm)] font-[var(--font-weight-medium)] leading-[var(--line-height-snug)] text-base-content cursor-default"
        >
          <span>{label}</span>
          {required && (
            <span className="nise-field__required text-error" aria-hidden="true">
              *
            </span>
          )}
        </BaseSelect.Label>

        <BaseSelect.Trigger
          render={(props) => (
            <button
              {...props}
              role="button"
              aria-labelledby={[props["aria-labelledby"], valueId]
                .filter(Boolean)
                .join(" ")}
            />
          )}
          aria-describedby={describedBy}
          aria-invalid={error != null ? true : undefined}
          className={cn(
            "nise-select__trigger inline-flex items-center justify-between gap-[var(--space-2)] w-full h-[var(--select-height)] px-[var(--select-padding-x)] font-sans text-[length:var(--select-font-size)] text-left text-base-content bg-base-100 rounded-[var(--select-radius,var(--radius-md))] border border-solid border-border-strong cursor-pointer select-none transition-[border-color,background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:not-disabled:border-border-hover focus-visible:outline-[length:var(--focus-ring-width)] focus-visible:outline-focus-ring focus-visible:outline-offset-0 disabled:cursor-not-allowed",
            error != null &&
              "border-[length:var(--border-width-strong)] border-border-error hover:not-disabled:border-border-error",
          )}
        >
          <BaseSelect.Value
            id={valueId}
            placeholder={placeholder}
            className="nise-select__value truncate data-[placeholder]:text-text-muted"
          />
          <BaseSelect.Icon className="nise-select__chevron inline-flex items-center shrink-0 text-text-muted">
            <ChevronDownIcon size={20} />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>

        <BaseSelect.Portal container={portalContainer}>
          <BaseSelect.Positioner
            sideOffset={4}
            alignItemWithTrigger={false}
            className="z-50 outline-none"
          >
            <BaseSelect.Popup className="nise-select__popover min-w-[var(--anchor-width)] p-[var(--space-1)] bg-base-100 text-base-content border border-solid border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] outline-none origin-[var(--transform-origin)] transition-[opacity,scale] duration-[var(--duration-fast)] ease-[var(--ease-entrance)] data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95">
              <BaseSelect.List
                aria-label={label}
                className="nise-select__viewport flex flex-col gap-[var(--space-1)] outline-none"
              >
                {options.map((option) => (
                  <BaseSelect.Item
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    disabled={option.disabled}
                    className="nise-select__item relative flex items-center justify-between gap-[var(--space-2)] min-h-[var(--select-item-height)] px-[var(--space-3)] font-sans text-[length:var(--select-font-size)] text-base-content rounded-[var(--radius-md)] cursor-pointer select-none outline-none data-[highlighted]:bg-base-hover data-[selected]:bg-selected-surface data-[selected]:text-selected-text data-[selected]:font-[var(--font-weight-medium)] data-[disabled]:opacity-[var(--opacity-disabled)] data-[disabled]:cursor-not-allowed"
                  >
                    <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                    <BaseSelect.ItemIndicator
                      className="nise-select__indicator inline-flex items-center shrink-0 text-selected-text"
                      aria-hidden="true"
                    >
                      <CheckIcon size={16} />
                    </BaseSelect.ItemIndicator>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>

      {showHint && (
        <p
          id={hintId}
          className="nise-field__message nise-field__hint m-0 text-[length:var(--field-message-font-size)] leading-[var(--line-height-snug)] text-text-muted"
        >
          {hint}
        </p>
      )}
      {error != null && (
        <p
          id={errorId}
          className="nise-field__message nise-field__error m-0 inline-flex items-center gap-[var(--space-1)] text-[length:var(--field-message-font-size)] font-[var(--font-weight-medium)] leading-[var(--line-height-snug)] text-error"
        >
          <AlertIcon size={16} className="nise-field__message-icon shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
