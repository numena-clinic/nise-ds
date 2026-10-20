// The parameter pane — a visual editor over the real token graph.
//
// Colour is split the way a designer thinks about it: the PALETTE (primitive
// colours — the ten brand anchors shown fixed, plus the generated scale steps
// you author) and the ROLES (semantic tokens that point at them).
// Everything else — type, space, shape, motion — is a labelled row with the
// input that matches its kind. Derived colours are listed read-only so the
// dependency stays visible.
//
// Edits emit an override; the token source is untouched until a candidate is
// promoted from the command line.

import { useMemo, useState } from "react";
import {
  DERIVED_TOKENS,
  EDITABLES,
  IMMUTABLE_TOKENS,
  editablesBySection,
  type EditableToken,
  type Section,
} from "../theme/tokens";
import {
  experimentalTokens,
  isChanged,
  resolve,
  type Override,
  type Overrides,
} from "../theme/theme";
import { LockedAnchorCard, PrimitiveColorEditor, RoleColorEditor } from "./ColorControls";
import { TokenControl } from "./TokenControl";

interface Props {
  overrides: Overrides;
  onChange: (name: string, o: Override) => void;
  onReset: (name: string) => void;
}

const TABS: { id: Section; label: string }[] = [
  { id: "color", label: "Colour" },
  { id: "typography", label: "Type" },
  { id: "space", label: "Space" },
  { id: "shape", label: "Shape" },
  { id: "motion", label: "Motion" },
];

const matches = (e: { name: string; group: string }, q: string) =>
  q === "" || e.name.toLowerCase().includes(q) || e.group.toLowerCase().includes(q);

export function TokenPanel({ overrides, onChange, onReset }: Props) {
  const [tab, setTab] = useState<Section>("color");
  const [query, setQuery] = useState("");
  const bySection = useMemo(() => editablesBySection(), []);
  const tokens = experimentalTokens(overrides);

  const colourTokens = bySection.color ?? {};
  const palette = Object.values(colourTokens).flat().filter((e) => e.kind === "value");
  const roles = Object.values(colourTokens).flat().filter((e) => e.kind === "alias");
  const locked = IMMUTABLE_TOKENS;

  const visible = query.trim().toLowerCase();

  const valueOf = (e: EditableToken): string => {
    const o = overrides[e.name];
    if (e.kind === "alias") {
      if (o && o.kind === "alias") return `var(${o.ref})`;
      return `var(${e.canonicalRef})`;
    }
    if (o && o.kind === "value") return o.value;
    return e.canonical;
  };

  return (
    <div className="nise-panel">
      <div className="nise-panel__search">
        <label htmlFor="token-search" className="nise-explorer__visually-hidden">
          Search tokens
        </label>
        <input
          id="token-search"
          type="search"
          placeholder="Search tokens…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="nise-panel__search-input"
        />
      </div>

      <div className="nise-panel__tabs" role="tablist" aria-label="Token sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            className={`nise-panel__tab ${tab === t.id ? "nise-panel__tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="nise-panel__body"
      >
        {tab === "color" ? (
          <div className="nise-panel__stack">
            <section aria-labelledby="grp-palette">
              <h2 id="grp-palette" className="nise-panel__group-title">
                Palette
                <span className="nise-panel__group-note">
                  authored primitives · {locked.length} brand anchors fixed
                </span>
              </h2>
              <div className="nise-panel__cards">
                {locked.filter((t) => matches(t, visible)).map((t) => (
                  <LockedAnchorCard
                    key={t.name}
                    name={t.name}
                    raw={t.raw}
                    resolved={resolve(t.name, tokens)}
                  />
                ))}
                {palette.filter((e) => matches(e, visible)).map((e) => (
                  <PrimitiveColorEditor
                    key={e.name}
                    editable={e}
                    value={valueOf(e)}
                    resolved={resolve(e.name, tokens)}
                    changed={isChanged(e.name, overrides[e.name])}
                    onChange={(value) => onChange(e.name, { kind: "value", value })}
                    onReset={() => onReset(e.name)}
                  />
                ))}
              </div>
            </section>

            <section aria-labelledby="grp-roles">
              <h2 id="grp-roles" className="nise-panel__group-title">
                Roles
                <span className="nise-panel__group-note">point at a primitive</span>
              </h2>
              <div className="nise-panel__cards">
                {roles.filter((e) => matches(e, visible)).map((e) => (
                  <RoleColorEditor
                    key={e.name}
                    editable={e}
                    value={valueOf(e)}
                    resolved={resolve(e.name, tokens)}
                    changed={isChanged(e.name, overrides[e.name])}
                    onChange={(ref) => onChange(e.name, { kind: "alias", ref })}
                    onReset={() => onReset(e.name)}
                  />
                ))}
              </div>
            </section>

            <details className="nise-panel__derived">
              <summary>{DERIVED_TOKENS.length} derived colours (read-only)</summary>
              <p className="nise-panel__hint">
                Mixed from the palette — they follow it. Edit the palette or a role to change them.
              </p>
              <ul className="nise-panel__derived-list">
                {DERIVED_TOKENS.map((t) => (
                  <li key={t.name} className="nise-panel__derived-row">
                    <span
                      className="nise-panel__swatch"
                      style={{ background: resolve(t.name, tokens) }}
                      aria-hidden="true"
                    />
                    <span className="nise-panel__derived-name">{t.name.replace(/^--/, "")}</span>
                    <code className="nise-panel__derived-value">
                      {resolve(t.name, tokens)}
                    </code>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        ) : (
          <div className="nise-panel__stack">
            {Object.entries(bySection[tab] ?? {}).map(([group, list]) => {
              const shown = list.filter((e) => matches(e, visible));
              if (shown.length === 0) return null;
              return (
                <section key={group} aria-labelledby={`grp-${group}`}>
                  <h2 id={`grp-${group}`} className="nise-panel__group-title">
                    {group}
                  </h2>
                  <div className="nise-panel__rows">
                    {shown.map((e) => (
                      <TokenControl
                        key={e.name}
                        editable={e}
                        override={overrides[e.name]}
                        onChange={(o) => onChange(e.name, o)}
                        onReset={() => onReset(e.name)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <p className="nise-panel__foot">
        {EDITABLES.length} editable tokens. The {locked.length} brand anchors are fixed by
        numena-brand and cannot be edited here. Changes stay local until you promote a candidate
        with <code>theme:apply</code>.
      </p>
    </div>
  );
}
