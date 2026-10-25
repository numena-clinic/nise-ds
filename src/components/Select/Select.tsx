/* =============================================================================
   Select
   -----------------------------------------------------------------------------
   A single-choice control for a short, known list. Use it when the options are
   mutually exclusive and the list is short (roughly 5–15); for two or three
   options prefer radio tiles, for long or free-form sets prefer a combobox.
   The visible label is required.

   Built on Radix Select. The trigger is a real button that owns the listbox
   role, so the ARIA wiring, typeahead, keyboard navigation and focus
   management are the primitive's, not ours. We supply the appearance and map
   the control's tokens onto it; there is no native <select> because it cannot
   be styled consistently.

   Tokens consumed:
     --select-height, --select-padding-x, --select-font-size, --select-item-height
       → --control-* → --space-*, --font-size-*
     --field-gap, --field-label-gap, --field-message-font-size
      --color-base-100, --color-base-200, --color-base-hover, --color-base-content,
      --color-text-muted, --color-border-strong, --color-border-hover, --color-focus-ring,
      --color-border-error,
      --color-primary, --color-selected-surface, --color-selected-text, --shadow-md, --radius-xl, --radius-sm, --border-width,
      --focus-ring-width, --opacity-disabled, --duration-fast, --ease-standard

   Error handling matches TextField: text + icon + a heavier boundary, never
   color alone (color.md §4; iconography.md §4). Since decisions.md P4 the
   heavier boundary also reads from `--color-border-error` — the operational
   error accent, not a verdict color — and the hint leaves the DOM when an
   error shows.

   `portalContainer` (optional) mounts the popup somewhere other than
   document.body, so a Select inside a themed subtree keeps that subtree's CSS
   custom properties. Default behaviour is unchanged.
   ============================================================================= */

import * as SelectPrimitive from "@radix-ui/react-select";
import { useId, type ReactNode } from "react";
import { AlertIcon, CheckIcon, ChevronDownIcon } from "../../icons";
import "./Select.css";

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
   * Where to mount the popup. Defaults to the document body. Supply a container
   * when the Select lives inside a scoped theme (e.g. the Theme Explorer's
   * preview), so the popup inherits the same CSS custom properties as the
   * trigger instead of the document root.
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
  const labelId = `${fieldId}-label`;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;

  const showHint = hint != null && error == null;
  const describedBy =
    [showHint ? hintId : null, error != null ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const classes = [
    "nise-field",
    "nise-select",
    error != null ? "nise-field--error" : null,
    disabled ? "nise-field--disabled" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <span id={labelId} className="nise-field__label">
        <span>{label}</span>
        {required ? (
          <span className="nise-field__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>

      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
        name={name}
      >
        <SelectPrimitive.Trigger
          id={fieldId}
          className="nise-select__trigger"
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          aria-invalid={error != null ? true : undefined}
        >
          <SelectPrimitive.Value
            placeholder={<span className="nise-select__placeholder">{placeholder}</span>}
          />
          <SelectPrimitive.Icon className="nise-select__chevron">
            <ChevronDownIcon size={20} />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal container={portalContainer ?? undefined}>
          <SelectPrimitive.Content
            className="nise-select__content"
            position="popper"
            sideOffset={4}
            align="start"
          >
            <SelectPrimitive.Viewport className="nise-select__viewport">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="nise-select__item"
                >
                  <span className="nise-select__indicator-slot">
                    <SelectPrimitive.ItemIndicator className="nise-select__indicator">
                      <CheckIcon size={16} />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

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
}
