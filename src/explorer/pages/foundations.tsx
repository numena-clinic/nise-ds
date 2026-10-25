// Reference views over the scoped custom properties (foundations).

import type { ReactNode } from "react";
import type { FoundationId, FoundationPage, PageRenderContext } from "./types";
import { ALL_TOKENS, INFO_BY_NAME, LAYERS, isAnchorRole } from "../theme/tokens";
import { resolve } from "../theme/theme";
import { brandAnchors, groundAnchors } from "../../../tokens/palette.mjs";

interface Anchor {
  name: string;
  role: string;
  hex: string;
}

const allAnchors: Anchor[] = brandAnchors as Anchor[];
const groundAnchorNames: string[] = groundAnchors.map((a: { name: string }) => a.name);

/** The brand anchors, categorised the way the brand describes them: the
 * foundation pair, the two primaries, and the expressive accents — the vibrant
 * and soft supporting hues kept together. */
const ANCHOR_CATEGORIES: { label: string; note?: string; tokens: string[] }[] = [
  {
    label: "Foundation",
    note: "The page, the brand ink, and the pale lavender the whole system sits on.",
    tokens: allAnchors
      .filter((a) => a.role === "foundation" || a.name === "--pale-lavender")
      .map((a) => a.name),
  },
  {
    label: "Primary",
    note: "The deep and vibrant purples that carry the brand.",
    tokens: allAnchors.filter((a) => a.role === "primary").map((a) => a.name),
  },
  {
    label: "Expressive",
    note: "The vibrant and soft supporting accents — categorical, never verdicts.",
    tokens: allAnchors
      .filter((a) => a.role === "supporting" && a.name !== "--pale-lavender")
      .map((a) => a.name)
      .sort((a, b) => a.localeCompare(b)),
  },
].filter((group) => group.tokens.length > 0);


/** The semantic color roles, grouped by meaning, in authored order. */
const ROLE_GROUPS: { label: string; note?: string; tokens: string[] }[] = LAYERS.filter(
  (layer) => layer.id === "semantic",
)
  .flatMap((layer) => layer.groups)
  .map((group) => ({
    label: group.label,
    note: group.note,
    tokens: Object.keys(group.tokens).filter((name) => name.startsWith("--color-")),
  }))
  .filter((group) => group.tokens.length > 0);

const sortedTokens = (pattern: RegExp) =>
  Object.keys(ALL_TOKENS)
    .filter((name) => pattern.test(name))
    .sort((a, b) => {
      const na = Number(a.match(/(\d+(?:\.\d+)?)$/)?.[1] ?? 0);
      const nb = Number(b.match(/(\d+(?:\.\d+)?)$/)?.[1] ?? 0);
      return na - nb || a.localeCompare(b);
    });

/** A role is "brand-backed" when it reads a brand anchor rather than a ramp
 *  step: the page, the body text, the secondary, the accent and the primary
 *  do (D22), and their value is fixed by numena-brand. */
function isBrandBacked(name: string): string | null {
  const ref = INFO_BY_NAME[name]?.ref;
  return isAnchorRole(name, ref) ? "brand" : null;
}

function SwatchGrid({
  tokens,
  map,
  mark,
}: {
  tokens: string[];
  map: Readonly<Record<string, string>>;
  /** Optional tag for a token — "brand" when the role reads a brand anchor. */
  mark?: (name: string) => string | null;
}) {
  return (
    <ul className="nise-pv__swatches">
      {tokens.map((name) => {
        const tag = mark?.(name) ?? null;
        return (
          <li key={name} className="nise-pv__swatch">
            <span
              className="nise-explorer__swatch nise-pv__swatch-chip"
              style={{ background: `var(${name})` }}
              aria-hidden="true"
            />
            <span className="nise-pv__swatch-name">
              {name.replace(/^--color-/, "")}
              {tag ? <span className="nise-pv__swatch-tag">{tag}</span> : null}
            </span>
            <code className="nise-pv__swatch-value">{resolve(name, map)}</code>
          </li>
        );
      })}
    </ul>
  );
}


function ColorSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="nise-pv__color-section">
      <header className="nise-pv__color-header">
        <h3 className="nise-pv__color-title">{title}</h3>
        {note ? <p className="nise-pv__color-note">{note}</p> : null}
      </header>
      {children}
    </section>
  );
}

function ColorPage({ map }: PageRenderContext) {
  return (
    <>
      <p className="nise-explorer__page-lead">
        Color comes from the token source, not a hand-kept list. The 37 semantic roles below are
        the active tokens used across all components. They resolve live against your overrides and
        selected theme mode.
      </p>

      <ColorSection
        title="Semantic roles"
        note="The active interface colors grouped by function: base surfaces, emphasis actions, operational status, supporting boundaries, and categorical tints. Roles tagged 'brand' read a brand anchor."
      >
        <div className="nise-pv__role-groups">
          {ROLE_GROUPS.map((group) => (
            <ColorSection key={group.label} title={group.label} note={group.note}>
              <SwatchGrid tokens={group.tokens} map={map} mark={isBrandBacked} />
            </ColorSection>
          ))}
        </div>
      </ColorSection>

      <ColorSection
        title="Brand anchors"
        note="The ten brand hex, unchanged (numena-brand color.md §2). Six of them directly drive foundational roles: white paints the page, ink paints the body text, and pale lavender, deep purple, vibrant purple and tangerine paint panel, primary, secondary and accent fills."
      >
        <div className="nise-pv__role-groups">
          {ANCHOR_CATEGORIES.map((group) => (
            <ColorSection key={group.label} title={group.label} note={group.note}>
              <SwatchGrid tokens={group.tokens} map={map} />
            </ColorSection>
          ))}
        </div>
      </ColorSection>

      <ColorSection
        title="Dark ground anchors"
        note="The pinned ladder the dark theme reads from: the page (--dark-ground) and the strong panel (--dark-panel)."
      >
        <SwatchGrid tokens={groundAnchorNames} map={map} />
      </ColorSection>
    </>
  );
}

function TypographyPage({ map }: PageRenderContext) {
  return (
    <>
      <p className="nise-explorer__page-lead">
        The serif does the reading and the sans does the interface — headings, reading and data
        each have their own voice.
      </p>
      <h3 className="nise-pv__display">Session review</h3>
      <p className="nise-pv__body">
        Body copy uses the sans at the base size. A paragraph can hold an{" "}
        <a href="#pv-type" onClick={(e) => e.preventDefault()}>
          inline link
        </a>{" "}
        and still keep the reading rhythm. Captions and hints step down a size.
      </p>
      <p className="nise-pv__caption">
        Caption · {resolve("--font-size-xs", map)} — synthetic sample data, not a real client.
      </p>
      <ul className="nise-pv__swatches">
        {sortedTokens(/^--font-size-/).map((name) => (
          <li key={name} className="nise-pv__swatch">
            <span className="nise-pv__swatch-name">{name.replace(/^--font-size-/, "")}</span>
            <code className="nise-pv__swatch-value">{resolve(name, map)}</code>
          </li>
        ))}
      </ul>
    </>
  );
}

function SpacePage({ map }: PageRenderContext) {
  return (
    <>
      <p className="nise-explorer__page-lead">
        The 4px spacing base. Each bar is drawn at its token width.
      </p>
      <ul className="nise-pv__scale">
        {sortedTokens(/^--space-\d+$/).map((name) => (
          <li key={name} className="nise-pv__scale-row">
            <code className="nise-pv__scale-name">{name.replace(/^--/, "")}</code>
            <span className="nise-pv__scale-track">
              <span className="nise-pv__scale-bar" style={{ width: `var(${name})` }} />
            </span>
            <code className="nise-pv__scale-value">{resolve(name, map)}</code>
          </li>
        ))}
      </ul>
    </>
  );
}

function ShapePage({ map }: PageRenderContext) {
  const lines = ["--border-width", "--border-width-strong"].filter((n) => n in ALL_TOKENS);
  return (
    <>
      <p className="nise-explorer__page-lead">
        The radius scale and the border weights. Components pick a radius at the point of use.
      </p>
      <ul className="nise-pv__shapes">
        {sortedTokens(/^--radius-/).map((name) => (
          <li key={name} className="nise-pv__shape">
            <span className="nise-pv__shape-card" style={{ borderRadius: `var(${name})` }} />
            <code className="nise-pv__scale-name">{name.replace(/^--/, "")}</code>
            <code className="nise-pv__scale-value">{resolve(name, map)}</code>
          </li>
        ))}
      </ul>
      <ul className="nise-pv__scale">
        {lines.map((name) => (
          <li key={name} className="nise-pv__scale-row">
            <code className="nise-pv__scale-name">{name.replace(/^--/, "")}</code>
            <span className="nise-pv__line" style={{ borderWidth: `var(${name})` }} />
            <code className="nise-pv__scale-value">{resolve(name, map)}</code>
          </li>
        ))}
      </ul>
    </>
  );
}

function MotionPage({ map }: PageRenderContext) {
  return (
    <>
      <p className="nise-explorer__page-lead">
        Temporal restraint: three durations and two easings. Hover the chips to feel the current
        values.
      </p>
      <div className="nise-catalogue__row">
        {sortedTokens(/^--duration-/).map((name) => (
          <span key={name} className="nise-pv__motion-chip" tabIndex={0}>
            {name.replace(/^--duration-/, "")} · {resolve(name, map)}
          </span>
        ))}
      </div>
      <ul className="nise-pv__scale">
        {sortedTokens(/^--ease-/).map((name) => (
          <li key={name} className="nise-pv__scale-row">
            <code className="nise-pv__scale-name">{name.replace(/^--/, "")}</code>
            <code className="nise-pv__scale-value">{resolve(name, map)}</code>
          </li>
        ))}
      </ul>
    </>
  );
}

export type { FoundationId };

export const FOUNDATION_PAGES: FoundationPage[] = [
  { id: "found-color", label: "Color", title: "Color roles", render: (ctx) => <ColorPage {...ctx} /> },
  { id: "found-type", label: "Typography", title: "Typography", render: (ctx) => <TypographyPage {...ctx} /> },
  { id: "found-space", label: "Space", title: "Spacing scale", render: (ctx) => <SpacePage {...ctx} /> },
  { id: "found-shape", label: "Shape", title: "Shape & borders", render: (ctx) => <ShapePage {...ctx} /> },
  { id: "found-motion", label: "Motion", title: "Motion", render: (ctx) => <MotionPage {...ctx} /> },
];
