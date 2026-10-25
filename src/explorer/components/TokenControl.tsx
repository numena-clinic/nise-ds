// A single theme control in the left panel. One row per editable token: its
// name, its current value, and the right input for its kind —
//   · a color swatch + hex + picker for color literals,
//   · a native <select> for color ROLES (retarget which primitive a role uses),
//   · a text input with inline validation for lengths, numbers, durations,
//   · a constrained <select> for font families (the policy keeps us to the
//     families already in the repo).
// A changed row shows a "changed" marker and an inline reset. Everything is a
// native control with a real label, so keyboard + screen-reader use comes free.

import { ALL_TOKENS, type EditableToken } from "../theme/tokens";
import {
  isChanged,
  validateValue,
  fontFamilyOptions,
  fontStackParts,
  withFontFamily,
  type Override,
} from "../theme/theme";

/** The color picker needs a valid hex even while the text field is mid-edit. */
const PICKER_FALLBACK = ALL_TOKENS["--ink-plum"] ?? "";

interface Props {
  editable: EditableToken;
  override: Override | undefined;
  onChange: (o: Override) => void;
  onReset: () => void;
}

export function TokenControl({ editable, override, onChange, onReset }: Props) {
  const id = `tok-${editable.name.replace(/^--/, "")}`;
  const changed = isChanged(editable.name, override);

  const aliasRef =
    editable.kind === "alias"
      ? override?.kind === "alias"
        ? override.ref
        : editable.canonicalRef
      : undefined;

  const value =
    editable.kind === "value"
      ? override?.kind === "value"
        ? override.value
        : editable.canonical
      : "";

  const problem = editable.kind === "value" ? validateValue(editable, value) : null;

  return (
    <div className="nise-explorer__row" data-changed={changed || undefined}>
      <div className="nise-explorer__rowhead">
        <label className="nise-explorer__label" htmlFor={id} title={editable.name}>
          {editable.name.replace(/^--/, "")}
        </label>
        {changed ? (
          <button
            type="button"
            className="nise-explorer__reset"
            onClick={onReset}
            aria-label={`Reset ${editable.name} to its default`}
          >
            reset
          </button>
        ) : null}
      </div>

      {editable.kind === "alias" ? (
        <div className="nise-explorer__field">
          <span className="nise-explorer__swatch" style={{ background: `var(${aliasRef})` }} aria-hidden="true" />
          <select
            id={id}
            className="nise-explorer__select"
            value={aliasRef}
            onChange={(e) => onChange({ kind: "alias", ref: e.target.value })}
          >
            {editable.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt.replace(/^--/, "")}
              </option>
            ))}
          </select>
        </div>
      ) : editable.control === "fontFamily" ? (
        <select
          id={id}
          className="nise-explorer__select"
          value={fontStackParts(value).first}
          onChange={(e) => onChange({ kind: "value", value: withFontFamily(value, e.target.value) })}
        >
          {fontFamilyOptions(editable).map((fam) => (
            <option key={fam} value={fam}>
              {fam}
            </option>
          ))}
        </select>
      ) : editable.control === "color" ? (
        <div className="nise-explorer__field">
          <span className="nise-explorer__swatch" style={{ background: value }} aria-hidden="true" />
          <input
            id={id}
            className="nise-explorer__input nise-explorer__input--hex"
            value={value}
            spellCheck={false}
            onChange={(e) => onChange({ kind: "value", value: e.target.value })}
            aria-invalid={problem ? true : undefined}
          />
          <input
            type="color"
            className="nise-explorer__color"
            aria-label={`${editable.name} color picker`}
            value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : PICKER_FALLBACK}
            onChange={(e) => onChange({ kind: "value", value: e.target.value.toUpperCase() })}
          />
        </div>
      ) : (
        <input
          id={id}
          className="nise-explorer__input"
          value={value}
          spellCheck={false}
          inputMode="decimal"
          onChange={(e) => onChange({ kind: "value", value: e.target.value })}
          aria-invalid={problem ? true : undefined}
        />
      )}

      {problem ? <p className="nise-explorer__error">{problem}</p> : null}
    </div>
  );
}
