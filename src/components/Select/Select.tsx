/** Labelled React Aria Select. React Aria owns form semantics, typeahead,
 * focus and popup dismissal. Nise owns the value/options API and plain CSS.
 * Tokens: --select-*, --field-* and semantic color, border and focus roles. */
import { useId } from "react";
import type { ReactNode } from "react";
import {
  Select as AriaSelect,
  Label,
  Button,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
  Text,
  FieldError,
} from "react-aria-components";
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
  return (
    <AriaSelect
      id={id ?? `nise-select-${reactId}`}
      selectedKey={value}
      defaultSelectedKey={defaultValue}
      onSelectionChange={(key) => onValueChange?.(String(key))}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={error != null}
      name={name}
      placeholder={placeholder}
      className={[
        "nise-field",
        "nise-select",
        error != null && "nise-field--error",
        disabled && "nise-field--disabled",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Label className="nise-field__label">
        <span>{label}</span>
        {required && (
          <span className="nise-field__required" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      <Button className="nise-select__trigger">
        <SelectValue className="nise-select__value" />
        <span className="nise-select__chevron" aria-hidden="true">
          <ChevronDownIcon size={20} />
        </span>
      </Button>
      <Popover
        className="nise-select__content"
        placement="bottom start"
        offset={4}
        UNSTABLE_portalContainer={portalContainer ?? undefined}
      >
        <ListBox className="nise-select__viewport" items={options}>
          {(option) => (
            <ListBoxItem
              id={option.value}
              textValue={option.label}
              isDisabled={option.disabled}
              className="nise-select__item"
            >
              {({ isSelected }) => (
                <>
                  <span className="nise-select__indicator-slot">
                    {isSelected && <CheckIcon size={16} />}
                  </span>
                  {option.label}
                </>
              )}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
      {hint != null && error == null && (
        <Text
          slot="description"
          className="nise-field__message nise-field__hint"
        >
          {hint}
        </Text>
      )}
      {error != null && (
        <FieldError className="nise-field__message nise-field__error">
          <AlertIcon size={16} />
          <span>{error}</span>
        </FieldError>
      )}
    </AriaSelect>
  );
}
