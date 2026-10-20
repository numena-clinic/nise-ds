// The live preview canvas.
//
// Three things happen here:
//   1. the REAL Nise components render inside a wrapper carrying the experimental
//      values as scoped CSS custom properties — never on :root, so the explorer's
//      own chrome is untouched;
//   2. the same wrapper hosts the Nise catalogue, which reads those values
//      through the scoped custom properties;
//   3. a token-reference view lays out the whole graph with live values.
//
// A device toggle constrains the canvas width so a theme can be judged at
// phone, tablet and desktop size without leaving the page, and a theme toggle
// switches the preview between the light mapping and the dark mapping of the
// same edits (the wrapper pins the theme's own values — see previewStyle).
//
// The Select popup portals to document.body by default, which would escape the
// wrapper and lose the scoped variables; it is pointed at the wrapper instead.

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ALL_TOKENS } from "../theme/tokens";
import {
  experimentalTokens,
  previewStyle,
  resolve,
  type Overrides,
  type ThemeMode,
} from "../theme/theme";
import { Catalogue } from "./Catalogue";
import { TokenReference } from "./TokenReference";

interface Props {
  overrides: Overrides;
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
}

type View = "catalogue" | "tokens";
type Device = "mobile" | "tablet" | "desktop";

const ROLE_SWATCHES: string[] = [
  "--color-surface",
  "--color-surface-subtle",
  "--color-surface-hover",
  "--color-surface-active",
  "--color-base-100",
  "--color-base-200",
  "--color-base-300",
  "--color-base-content",
  "--color-border",
  "--color-border-strong",
  "--color-border-hover",
  "--color-border-error",
  "--color-text",
  "--color-text-muted",
  "--color-text-inverted",
  "--color-action",
  "--color-action-hover",
  "--color-action-active",
  "--color-secondary",
  "--color-secondary-content",
  "--color-neutral",
  "--color-neutral-content",
  "--color-link",
  "--color-focus-ring",
  "--color-selected-surface",
  "--color-selected-text",
  "--color-accent-purple-surface",
  "--color-accent-purple-text",
  "--color-accent-cyan-surface",
  "--color-accent-cyan-text",
  "--color-accent-tangerine-surface",
  "--color-accent-tangerine-text",
  "--color-tint-purple",
  "--color-tint-cyan",
  "--color-tint-tangerine",
  "--color-tint-text",
  "--color-success-surface",
  "--color-success",
  "--color-success-content",
  "--color-warning-surface",
  "--color-warning",
  "--color-warning-content",
  "--color-error-surface",
  "--color-error",
  "--color-error-content",
  "--color-info-surface",
  "--color-info",
  "--color-info-content",
].filter((name) => name in ALL_TOKENS);

const DEVICES: { id: Device; label: string; width: string }[] = [
  { id: "mobile", label: "Phone", width: "390px" },
  { id: "tablet", label: "Tablet", width: "768px" },
  { id: "desktop", label: "Desktop", width: "100%" },
];

const MODES: { id: ThemeMode; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

export function Preview({ overrides, mode, onModeChange }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [view, setView] = useState<View>("catalogue");
  const [device, setDevice] = useState<Device>("desktop");
  useEffect(() => setPortalContainer(wrapperRef.current), []);

  const map = experimentalTokens(overrides, mode);
  const style = previewStyle(overrides, mode) as CSSProperties;
  const width = DEVICES.find((d) => d.id === device)?.width ?? "100%";

  return (
    <div className="nise-preview">
      <div className="nise-preview__toolbar">
        <div className="nise-preview__group" role="group" aria-label="Preview view">
          <button
            type="button"
            aria-pressed={view === "catalogue"}
            className={`nise-preview__seg ${view === "catalogue" ? "nise-preview__seg--on" : ""}`}
            onClick={() => setView("catalogue")}
          >
            Catalogue
          </button>
          <button
            type="button"
            aria-pressed={view === "tokens"}
            className={`nise-preview__seg ${view === "tokens" ? "nise-preview__seg--on" : ""}`}
            onClick={() => setView("tokens")}
          >
            Tokens
          </button>
        </div>

        <div className="nise-preview__group" role="group" aria-label="Preview theme">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={mode === m.id}
              className={`nise-preview__seg ${mode === m.id ? "nise-preview__seg--on" : ""}`}
              onClick={() => onModeChange(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="nise-preview__group" role="group" aria-label="Preview width">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={device === d.id}
              className={`nise-preview__seg ${device === d.id ? "nise-preview__seg--on" : ""}`}
              onClick={() => setDevice(d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="nise-explorer__preview"
        ref={wrapperRef}
        style={{ ...style, maxWidth: width }}
        data-nise-theme={mode}
      >
        {view === "tokens" ? (
          <TokenReference overrides={overrides} query="" mode={mode} />
        ) : (
          <>
            <section className="nise-explorer__specimen" aria-labelledby="pv-type">
              <h2 id="pv-type" className="nise-explorer__specimen-title">
                Typography sample
              </h2>
              <h3 className="nise-pv__display">Session review</h3>
              <p className="nise-pv__lead">
                The serif does the reading and the sans does the interface — headings, reading and
                data each have their own voice.
              </p>
              <p className="nise-pv__body">
                Body copy uses the sans at the base size. A paragraph can hold an{" "}
                <a href="#pv-type" onClick={(e) => e.preventDefault()}>
                  inline link
                </a>{" "}
                and still keep the reading rhythm. Captions and hints step down a size.
              </p>
              <p className="nise-pv__caption">Caption · synthetic sample data — not a real client.</p>
            </section>

            <section className="nise-explorer__specimen" aria-labelledby="pv-roles">
              <h2 id="pv-roles" className="nise-explorer__specimen-title">
                Colour roles
              </h2>
              <ul className="nise-pv__swatches">
                {ROLE_SWATCHES.map((name) => (
                  <li key={name} className="nise-pv__swatch">
                    <span
                      className="nise-explorer__swatch nise-pv__swatch-chip"
                      style={{ background: `var(${name})` }}
                      aria-hidden="true"
                    />
                    <span className="nise-pv__swatch-name">{name.replace(/^--color-/, "")}</span>
                    <code className="nise-pv__swatch-value">{resolve(name, map)}</code>
                  </li>
                ))}
              </ul>
            </section>

            <Catalogue portalContainer={portalContainer} />
          </>
        )}
      </div>
    </div>
  );
}
