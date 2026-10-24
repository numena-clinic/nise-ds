// Reference views over the scoped custom properties (foundations).

import type { ReactNode } from "react";
import type { FoundationId, FoundationPage, PageRenderContext } from "./types";
import { ALL_TOKENS, INFO_BY_NAME, LAYERS, isAnchorRole } from "../theme/tokens";
import { resolve } from "../theme/theme";
import { brandAnchors, colorMeta, groundAnchors, oklchOf, scales } from "../../../tokens/palette.mjs";
import { oklchToRgb, toHex } from "../../../tokens/color.mjs";

interface Anchor {
  name: string;
  role: string;
  hex: string;
}

const allAnchors: Anchor[] = brandAnchors as Anchor[];
const groundAnchorNames: string[] = groundAnchors.map((a: { name: string }) => a.name);

const meta = colorMeta as Record<string, { oklch: { l: number; c: number; h: number } } | undefined>;
const cOf = (name: string) => meta[name]?.oklch.c ?? 0;
const hOf = (name: string) => meta[name]?.oklch.h ?? 0;

/** The generated hue families a brand anchor belongs to, and the family's hue. */
const HUE_FAMILIES: { label: string; family: string; hue: number }[] = [
  { label: "Purple", family: "purple", hue: 300 },
  { label: "Cyan", family: "cyan", hue: 205 },
  { label: "Tangerine", family: "tangerine", hue: 43 },
];

const CHROMA_NEUTRAL_MAX = 0.05;
const hueDistance = (h: number, target: number) => {
  const d = Math.abs(h - target) % 360;
  return d > 180 ? 360 - d : d;
};

const chromaFamilyOf = (name: string): string =>
  cOf(name) <= CHROMA_NEUTRAL_MAX
    ? "neutral"
    : HUE_FAMILIES.reduce((best, f) =>
        hueDistance(hOf(name), f.hue) < hueDistance(hOf(name), best.hue) ? f : best,
      ).family;

interface RampStep {
  hex: string;
  anchor?: string;
}

/** A ramp of swatches interpolated in OKLCH through a hue's own brand anchors,
 * ordered soft → vibrant by chroma. Control points ARE the published hex, so
 * the ramp always fits the brand colours; the steps between them are even
 * blends. The brand hex are flagged so the ramp reads as "these anchors, plus
 * the shades the brand leaves to the design system". */
function buildChromaRamp(anchors: { name: string; hex: string }[]): RampStep[] {
  if (anchors.length === 0) return [];
  const points = anchors
    .map((a) => ({ ...a, oklch: oklchOf(a.hex) }))
    .sort((a, b) => a.oklch.c - b.oklch.c);
  if (points.length === 1) {
    const only = points[0]!;
    return [{ hex: only.hex, anchor: only.name.replace(/^--/, "") }];
  }

  const steps: RampStep[] = [];
  const between = 3; // in-between swatches per interval
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]!;
    const b = points[i + 1]!;
    steps.push({ hex: a.hex, anchor: a.name.replace(/^--/, "") });
    for (let k = 1; k <= between; k++) {
      const t = k / (between + 1);
      const oklch = {
        l: a.oklch.l + (b.oklch.l - a.oklch.l) * t,
        c: a.oklch.c + (b.oklch.c - a.oklch.c) * t,
        h: a.oklch.h + (b.oklch.h - a.oklch.h) * t,
      };
      steps.push({ hex: toHex(oklchToRgb(oklch)) });
    }
  }
  const last = points[points.length - 1]!;
  steps.push({ hex: last.hex, anchor: last.name.replace(/^--/, "") });
  return steps;
}

/** Each hue family as one chroma ramp built from its own brand anchors (soft →
 * vibrant), pale-lavender included in the purple family. */
const FAMILY_CHROMA_SCALES: { label: string; note: string; steps: RampStep[] }[] = [
  ...HUE_FAMILIES.map(({ label, family }) => ({ label, family })),
  { label: "Neutral", family: "neutral" },
].map(({ label, family }) => ({
  label,
  note: "soft → vibrant · built from the brand hex",
  steps: buildChromaRamp(
    allAnchors
      .filter((a) => chromaFamilyOf(a.name) === family)
      .map((a) => ({ name: a.name, hex: a.hex })),
  ),
}));

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

/** Each scale family as an ordered ramp, light → dark. */
const SCALE_FAMILIES: { label: string; tokens: string[] }[] = (
  Object.entries(scales) as Array<[string, Record<string, { hex: string }>]>
).map(([family, scale]) => ({
  label: family.charAt(0).toUpperCase() + family.slice(1),
  tokens: Object.entries(scale).map(([step]) => `--${family}-${step}`),
}));

/** The semantic colour roles, grouped by meaning, in authored order. */
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

/** A scale read left→right as one ramp, so lightness compares step for step.
 * Steps carrying a brand anchor show the published name under the label. */
function Ramp({ tokens, map }: { tokens: string[]; map: Readonly<Record<string, string>> }) {
  return (
    <div className="nise-pv__ramp">
      <div className="nise-pv__ramp-track">
        {tokens.map((name) => (
          <span
            key={name}
            className="nise-pv__ramp-step"
            style={{ background: `var(${name})` }}
            title={`${name} · ${resolve(name, map)}`}
          />
        ))}
      </div>
      <div className="nise-pv__ramp-labels">
        {tokens.map((name) => (
          <span key={name} className="nise-pv__ramp-label">
            {name.replace(/^--[a-z]+-/, "")}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A chroma ramp of literal colours (built from the brand hex), with the
 * anchor swatches named underneath. */
function ChromaRamp({ steps }: { steps: RampStep[] }) {
  if (steps.length === 0) return null;
  return (
    <div className="nise-pv__ramp">
      <div className="nise-pv__ramp-track">
        {steps.map((step, i) => (
          <span
            key={`${step.hex}-${i}`}
            className={`nise-pv__ramp-step ${step.anchor ? "nise-pv__ramp-step--anchor" : ""}`}
            style={{ background: step.hex }}
            title={`${step.anchor ?? "blend"} · ${step.hex}`}
          />
        ))}
      </div>
      <div className="nise-pv__ramp-labels">
        {steps.map((step, i) => (
          <span key={`${step.hex}-l-${i}`} className="nise-pv__ramp-label">
            {step.anchor ? <span className="nise-pv__ramp-anchor">{step.anchor}</span> : null}
          </span>
        ))}
      </div>
    </div>
  );
}

function ColourSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="nise-pv__colour-section">
      <header className="nise-pv__colour-header">
        <h3 className="nise-pv__colour-title">{title}</h3>
        {note ? <p className="nise-pv__colour-note">{note}</p> : null}
      </header>
      {children}
    </section>
  );
}

function ColourPage({ map }: PageRenderContext) {
  return (
    <>
      <p className="nise-explorer__page-lead">
        Colour comes from the token source, not a hand-kept list. The ten brand anchors and the two
        pinned dark-ground anchors are fixed by numena-brand; the scales and the semantic roles are
        authored here and resolve live against your overrides.
      </p>

      <ColourSection
        title="Brand anchors"
        note="The ten brand hex, unchanged (numena-brand color.md §2). Since D22 six of them are load-bearing — white paints the page, the ink paints the body text, and the pale lavender, the deep purple, the vibrant purple and the tangerine paint the panel, the primary, the secondary and the accent fills — so the interface is literally the brand's own colours. The remaining anchors are for artwork and marketing surfaces; product components use the semantic roles below, and a role tagged 'brand' reads an anchor."
      >
        <div className="nise-pv__role-groups">
          {ANCHOR_CATEGORIES.map((group) => (
            <ColourSection key={group.label} title={group.label} note={group.note}>
              <SwatchGrid tokens={group.tokens} map={map} />
            </ColourSection>
          ))}
        </div>
      </ColourSection>

      <ColourSection
        title="Chroma scales"
        note="Each hue family's own ramp, soft → vibrant, built by interpolating through that family's brand hex — so the ramp always fits the brand, and the published anchors are marked on it."
      >
        <div className="nise-pv__colour-groups">
          {FAMILY_CHROMA_SCALES.map((scale) => (
            <ColourSection key={scale.label} title={scale.label} note={scale.note}>
              <ChromaRamp steps={scale.steps} />
            </ColourSection>
          ))}
        </div>
      </ColourSection>

      <ColourSection
        title="Dark ground anchors"
        note="The pinned ladder the dark theme reads from: the page, the brand ink as the raised step, the strong panel."
      >
        <SwatchGrid tokens={groundAnchorNames} map={map} />
      </ColourSection>

      {SCALE_FAMILIES.map((family) => (
        <ColourSection key={family.label} title={`${family.label} scale`}>
          <Ramp tokens={family.tokens} map={map} />
        </ColourSection>
      ))}

      <ColourSection
        title="Semantic roles"
        note="One contract of role names, grouped by meaning; each resolves against the palette above under your current edits and the selected mapping. A role tagged 'brand' reads a brand anchor — the value is fixed by numena-brand, though the role itself can be re-pointed."
      >
        <div className="nise-pv__role-groups">
          {ROLE_GROUPS.map((group) => (
            <ColourSection key={group.label} title={group.label} note={group.note}>
              <SwatchGrid tokens={group.tokens} map={map} mark={isBrandBacked} />
            </ColourSection>
          ))}
        </div>
      </ColourSection>
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
  { id: "found-colour", label: "Colour", title: "Colour roles", render: (ctx) => <ColourPage {...ctx} /> },
  { id: "found-type", label: "Typography", title: "Typography", render: (ctx) => <TypographyPage {...ctx} /> },
  { id: "found-space", label: "Space", title: "Spacing scale", render: (ctx) => <SpacePage {...ctx} /> },
  { id: "found-shape", label: "Shape", title: "Shape & borders", render: (ctx) => <ShapePage {...ctx} /> },
  { id: "found-motion", label: "Motion", title: "Motion", render: (ctx) => <MotionPage {...ctx} /> },
];
