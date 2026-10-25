// Visual color editing for the parameter pane.
//
// Three shapes, matching the three ways a color appears in the palette:
//   · a PRIMITIVE (kind "value") is authored directly — hue/sat/light sliders,
//     a hex field and the native color well all write the same hex literal.
//   · a ROLE (kind "alias") is never authored — it points at a primitive. You
//     retarget it by clicking a palette swatch or picking from the list.
//   · a BRAND ANCHOR is shown read-only: numena-brand owns its value
//     (color.md §2), so there is no control to write with.
// Nothing here writes to the token source; it only emits an override.

import { useState } from "react";
import {
  COLOR_PRIMITIVES,
  INFO_BY_NAME,
  isAnchorRole,
  type AnchorRoles,
  type EditableToken,
} from "../theme/tokens";
import { hexToHsl, hslToHex, isHex, normalizeHex } from "../theme/color";

export interface ColorEditorProps {
  editable: EditableToken;
  /** Current raw value (override or canonical). */
  value: string;
  /** Resolved color, for the swatch. */
  resolved: string;
  changed: boolean;
  onChange: (value: string) => void;
  onReset: () => void;
}

const pretty = (name: string) => name.replace(/^--/, "");

/* token-boundary: waive — a hue slider must show the full spectrum; this is
   control chrome, not a themeable color, and nothing here feeds a token. */
const HUE_SPECTRUM = "linear-gradient(to right, hsl(0,80%,50%), hsl(60,80%,50%), hsl(120,80%,50%), hsl(180,80%,50%), hsl(240,80%,50%), hsl(300,80%,50%), hsl(360,80%,50%))"; /* token-boundary: waive */

function Swatch({ hex, size = 40 }: { hex: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="nise-color__swatch"
      style={{ background: hex, width: size, height: size }}
    />
  );
}

/** A brand anchor (numena-brand color.md §2): the published value, shown
 * read-only. The explorer can point roles at it; it can never change it — the
 * badge says so in words, not color.
 *
 *  When the anchor is load-bearing it also names the roles it drives: since
 *  D22 the page, the body text, the secondary and the accent all read an
 *  anchor, and "immutable" alone would not say why that matters. */
export function LockedAnchorCard({
  name,
  raw,
  resolved,
  roles,
}: {
  name: string;
  raw: string;
  resolved: string;
  roles?: AnchorRoles;
}) {
  const bare = pretty(name);
  const drives = roles?.drives ?? [];
  const textOn = roles?.textOn ?? [];
  return (
    <div className="nise-swatch-card nise-swatch-card--locked">
      <div className="nise-color__head">
        <div className="nise-color__id">
          <Swatch hex={resolved} size={44} />
          <div className="nise-color__names">
            <p className="nise-color__name">{bare}</p>
            <p className="nise-color__meta">brand anchor · color.md §2</p>
          </div>
        </div>
        <span className="nise-color__badge">Immutable</span>
      </div>
      <div className="nise-color__row">
        <code className="nise-color__canonical">{raw}</code>
      </div>
      {drives.length > 0 ? (
        <p className="nise-color__drives">
          drives{" "}
          <span className="nise-color__drives-list">
            {drives.map((role) => pretty(role.replace(/^--color-/, ""))).join(" · ")}
          </span>
        </p>
      ) : null}
      {textOn.length > 0 ? (
        <p className="nise-color__drives">
          text on{" "}
          <span className="nise-color__drives-list">{textOn.map(pretty).join(" · ")}</span>
        </p>
      ) : null}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  gradient,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  gradient?: string;
  onChange: (next: number) => void;
  suffix?: string;
}) {
  return (
    <label className="nise-color__slider">
      <span className="nise-color__slider-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        aria-label={`${label} (0–${max}${suffix ?? ""})`}
        onChange={(e) => onChange(Number(e.target.value))}
        className="nise-color__slider-input"
        style={gradient ? { background: gradient } : undefined}
      />
      <span className="nise-color__slider-value">
        {value}
        {suffix}
      </span>
    </label>
  );
}

/** A directly-authored color: sliders + hex + color well. */
export function PrimitiveColorEditor({
  editable,
  value,
  resolved,
  changed,
  onChange,
  onReset,
}: ColorEditorProps) {
  const bare = pretty(editable.name);
  const safe = isHex(value) ? normalizeHex(value) : normalizeHex(resolved);
  const [hsl, setHsl] = useState(() => hexToHsl(safe));
  const [hexDraft, setHexDraft] = useState(safe);

  const applyHsl = (next: Partial<typeof hsl>) => {
    const merged = { ...hsl, ...next };
    setHsl(merged);
    const hex = hslToHex(merged);
    setHexDraft(hex);
    onChange(hex);
  };

  return (
    <div className={`nise-swatch-card ${changed ? "nise-swatch-card--changed" : ""}`}>
      <div className="nise-color__head">
        <div className="nise-color__id">
          <Swatch hex={resolved} size={44} />
          <div className="nise-color__names">
            <label htmlFor={`hex-${bare}`} className="nise-color__name">
              {bare}
            </label>
            <p className="nise-color__meta">{editable.group}</p>
          </div>
        </div>
        <button
          type="button"
          className="nise-reset-btn"
          onClick={onReset}
          disabled={!changed}
          aria-label={`Reset ${editable.name} to its default`}
        >
          Reset
        </button>
      </div>

      <div className="nise-color__row">
        <input
          type="color"
          aria-label={`${bare} color well`}
          value={safe}
          onChange={(e) => {
            const hex = normalizeHex(e.target.value);
            setHexDraft(hex);
            setHsl(hexToHsl(hex));
            onChange(hex);
          }}
          className="nise-color__well"
        />
        <input
          id={`hex-${bare}`}
          type="text"
          value={hexDraft}
          spellCheck={false}
          onChange={(e) => {
            const raw = e.target.value;
            setHexDraft(raw);
            if (isHex(raw)) {
              const hex = normalizeHex(raw);
              setHsl(hexToHsl(hex));
              onChange(hex);
            }
          }}
          className="nise-color__hex"
        />
        <code className="nise-color__canonical">{editable.canonical}</code>
      </div>

      <div className="nise-color__sliders">
        <Slider
          label="H"
          value={hsl.h}
          min={0}
          max={360}
          suffix="°"
          onChange={(h) => applyHsl({ h })}
          gradient={HUE_SPECTRUM}
        />
        <Slider
          label="S"
          value={hsl.s}
          min={0}
          max={100}
          suffix="%"
          onChange={(s) => applyHsl({ s })}
          gradient={`linear-gradient(to right, ${hslToHex({ ...hsl, s: 0 })}, ${hslToHex({ ...hsl, s: 100 })})`}
        />
        <Slider
          label="L"
          value={hsl.l}
          min={0}
          max={100}
          suffix="%"
          onChange={(l) => applyHsl({ l })}
          gradient={`linear-gradient(to right, ${hslToHex({ ...hsl, l: 0 })}, ${hslToHex({ ...hsl, l: 50 })}, ${hslToHex({ ...hsl, l: 100 })})`}
        />
      </div>
    </div>
  );
}

/** A color role: retarget which primitive it points at. */
export function RoleColorEditor({
  editable,
  value,
  resolved,
  changed,
  onChange,
  onReset,
  dark,
}: ColorEditorProps & { dark?: { ref: string; resolved: string } | null }) {
  const bare = pretty(editable.name);
  const currentRef = value.startsWith("var(")
    ? value.replace(/^var\(\s*|\s*\)$/g, "")
    : (editable.canonicalRef ?? "");
  const onAnchor = isAnchorRole(editable.name, currentRef);

  return (
    <div className={`nise-swatch-card ${changed ? "nise-swatch-card--changed" : ""}`}>
      <div className="nise-color__head">
        <div className="nise-color__id">
          <Swatch hex={resolved} size={44} />
          <div className="nise-color__names">
            <p className="nise-color__name">{bare}</p>
            <p className="nise-color__meta">
              points at {pretty(currentRef)}
              {onAnchor ? <span className="nise-color__meta-flag"> · brand anchor</span> : null}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="nise-reset-btn"
          onClick={onReset}
          disabled={!changed}
          aria-label={`Reset ${editable.name} to its default`}
        >
          Reset
        </button>
      </div>

      {dark ? (
        <p className="nise-color__drives">
          dark mapping{" "}
          <span className="nise-color__drives-list">{pretty(dark.ref)}</span>
          {dark.resolved ? <code className="nise-color__canonical"> {dark.resolved}</code> : null}
        </p>
      ) : null}

      <div className="nise-color__palette" role="group" aria-label={`${bare} palette`}>
        {COLOR_PRIMITIVES.map((primitive) => {
          const hex = INFO_BY_NAME[primitive]?.raw ?? "";
          const selected = primitive === currentRef;
          return (
            <button
              key={primitive}
              type="button"
              aria-pressed={selected}
              title={pretty(primitive)}
              aria-label={`${bare} points at ${pretty(primitive)}`}
              onClick={() => onChange(primitive)}
              className={`nise-color__palette-swatch ${selected ? "nise-color__palette-swatch--selected" : ""}`}
              style={{ background: hex }}
            />
          );
        })}
      </div>

      <select
        aria-label={bare}
        value={currentRef}
        onChange={(e) => onChange(e.target.value)}
        className="nise-color__select"
      >
        {COLOR_PRIMITIVES.map((p) => (
          <option key={p} value={p}>
            {pretty(p)}
          </option>
        ))}
      </select>
    </div>
  );
}
