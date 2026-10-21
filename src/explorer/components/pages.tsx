// The explorer's page registry — one page per component, per pattern, and per
// foundation section. Every component/pattern page renders REAL Nise
// components (plain CSS over the live semantic layer), so a token edit
// restyles whichever page is open. Foundation pages are reference views over
// the same scoped custom properties.
//
// The sidebar (Sidebar.tsx) navigates this registry; Preview.tsx renders the
// selected page inside the experimental wrapper.

import type { ReactNode } from "react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Radio,
  Select,
  Slider,
  Switch,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextField,
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from "../../index";
import { CheckIcon, InfoIcon, PlusIcon } from "../../icons";
import { InformationReview } from "../../compositions/InformationReview";
import { ALL_TOKENS, LAYERS } from "../theme/tokens";
import { resolve } from "../theme/theme";
import { Block, Cell, Column, Row } from "./specimen";
import { brandAnchors, colorMeta, groundAnchors, oklchOf, scales } from "../../../tokens/palette.mjs";
import { oklchToRgb, toHex } from "../../../tokens/color.mjs";

export interface PageRenderContext {
  /**
   * Where portalled popups (Select, Tooltip, Dialog) should mount. Points at
   * the preview wrapper so the popup inherits the experimental custom
   * properties.
   */
  portalContainer?: HTMLElement | null;
  /** The experimental token map for the current overrides + mode. */
  map: Readonly<Record<string, string>>;
}

export interface SpecimenPage {
  id: string;
  label: string;
  title: string;
  note?: string;
  render: (ctx: PageRenderContext) => ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Foundations — reference views over the scoped custom properties.
// ─────────────────────────────────────────────────────────────────────────────

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

function SwatchGrid({ tokens, map }: { tokens: string[]; map: Readonly<Record<string, string>> }) {
  return (
    <ul className="nise-pv__swatches">
      {tokens.map((name) => (
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
        note="The ten brand hex, unchanged (numena-brand color.md §2). Artwork and marketing surfaces use these directly; product components use the semantic roles below."
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
        note="One contract of role names, grouped by meaning; each resolves against the palette above under your current edits and the selected mapping."
      >
        <div className="nise-pv__role-groups">
          {ROLE_GROUPS.map((group) => (
            <ColourSection key={group.label} title={group.label} note={group.note}>
              <SwatchGrid tokens={group.tokens} map={map} />
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

// ─────────────────────────────────────────────────────────────────────────────
// Components — one page per family, extracted from the old single-page
// catalogue so each can be documented on its own.
// ─────────────────────────────────────────────────────────────────────────────

export const COMPONENT_PAGES: SpecimenPage[] = [
  {
    id: "cmp-button",
    label: "Button",
    title: "Button",
    note: "three variants, three sizes",
    render: () => (
      <Block
        id="buttons"
        title="Button"
        note="three variants, three sizes"
        tokens={[
          "--color-action",
          "--color-action-hover",
          "--color-action-text",
          "--color-text",
          "--color-border-strong",
          "--radius-sm",
          "--control-height-md",
        ]}
      >
        <Row>
          <Cell label="primary">
            <Button>Continue</Button>
          </Cell>
          <Cell label="secondary">
            <Button variant="secondary">Cancel</Button>
          </Cell>
          <Cell label="ghost">
            <Button variant="ghost">Dismiss</Button>
          </Cell>
        </Row>
        <Row>
          <Cell label="small">
            <Button size="sm">Small</Button>
          </Cell>
          <Cell label="medium">
            <Button size="md">Medium</Button>
          </Cell>
          <Cell label="large">
            <Button size="lg">Large</Button>
          </Cell>
        </Row>
        <Row>
          <Cell label="loading">
            <Button loading>Saving</Button>
          </Cell>
          <Cell label="disabled">
            <Button disabled>Disabled</Button>
          </Cell>
          <Cell label="full width">
            <Button fullWidth>Full width</Button>
          </Cell>
        </Row>
      </Block>
    ),
  },
  {
    id: "cmp-badge",
    label: "Badge",
    title: "Badge",
    note: "categorical tones, never verdicts",
    render: () => (
      <Block
        id="badges"
        title="Badge"
        note="categorical tones, never verdicts"
        tokens={[
          "--color-text",
          "--color-accent-purple-surface",
          "--color-accent-purple-text",
          "--color-accent-cyan-surface",
          "--color-accent-tangerine-surface",
          "--badge-radius",
        ]}
      >
        <Row>
          <Cell label="neutral">
            <Badge>Neutral</Badge>
          </Cell>
          <Cell label="purple">
            <Badge tone="purple">Purple</Badge>
          </Cell>
          <Cell label="cyan">
            <Badge tone="cyan">Cyan</Badge>
          </Cell>
          <Cell label="tangerine">
            <Badge tone="tangerine">Tangerine</Badge>
          </Cell>
        </Row>
      </Block>
    ),
  },
  {
    id: "cmp-card",
    label: "Card",
    title: "Card",
    note: "heading, description, actions, footer",
    render: () => (
      <Block
        id="card"
        title="Card"
        note="heading, description, actions, footer"
        tokens={["--color-surface", "--color-border", "--color-text", "--radius-md", "--card-padding", "--card-gap"]}
      >
        <Row>
          <Cell label="with footer">
            <Card
              heading="Session 4"
              description="Fortnightly review"
              footer={<Button size="sm">Save note</Button>}
            >
              <p className="nise-catalogue__body">The client reported better sleep after two weeks.</p>
            </Card>
          </Cell>
          <Cell label="actions in header">
            <Card
              heading="Draft summary"
              description="Unsaved changes"
              actions={
                <Button size="sm" variant="secondary">
                  Edit
                </Button>
              }
            >
              <Badge tone="cyan">Collateral</Badge>
            </Card>
          </Cell>
        </Row>
      </Block>
    ),
  },
  {
    id: "cmp-textfield",
    label: "TextField",
    title: "TextField",
    note: "label always visible",
    render: () => (
      <Block
        id="textfield"
        title="TextField"
        note="label always visible"
        tokens={[
          "--color-surface",
          "--color-border-strong",
          "--color-border-hover",
          "--color-focus-ring",
          "--color-text",
          "--color-text-muted",
          "--input-height",
        ]}
      >
        <Row>
          <Cell label="default">
            <TextField label="Client name" defaultValue="Maya Calderón" />
          </Cell>
          <Cell label="hint">
            <TextField
              label="Preferred name"
              defaultValue="Maya"
              hint="How they would like to be addressed."
            />
          </Cell>
          <Cell label="error">
            <TextField label="Contact email" defaultValue="maya@" error="Enter a full email address." />
          </Cell>
          <Cell label="disabled">
            <TextField label="Reference" defaultValue="SESSION-004" disabled hint="Assigned automatically." />
          </Cell>
        </Row>
      </Block>
    ),
  },
  {
    id: "cmp-select",
    label: "Select",
    title: "Select",
    note: "portalled options inherit the scoped theme",
    render: ({ portalContainer }) => (
      <Block
        id="select"
        title="Select"
        note="portalled options inherit the scoped theme"
        tokens={["--color-surface", "--color-border-strong", "--color-border-hover", "--color-focus-ring", "--select-height"]}
      >
        <Row>
          <Cell label="default">
            <Select
              label="Source"
              defaultValue="client"
              options={[
                { value: "client", label: "Client session" },
                { value: "referral", label: "Referral" },
                { value: "self", label: "Self-referred" },
              ]}
              portalContainer={portalContainer}
            />
          </Cell>
          <Cell label="placeholder">
            <Select
              label="Confidence"
              placeholder="Not sure"
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
              portalContainer={portalContainer}
            />
          </Cell>
        </Row>
      </Block>
    ),
  },
  {
    id: "cmp-checkbox",
    label: "Checkbox",
    title: "Checkbox",
    note: "never colour alone",
    render: () => (
      <Block
        id="checkbox"
        title="Checkbox"
        note="never colour alone"
        tokens={["--color-action", "--color-surface", "--color-border-strong", "--color-focus-ring", "--choice-size"]}
      >
        <Row>
          <Cell label="default">
            <Checkbox label="Include derived colours" defaultChecked />
          </Cell>
          <Cell label="indeterminate">
            <Checkbox label="Partial selection" indeterminate />
          </Cell>
        </Row>
      </Block>
    ),
  },
  {
    id: "cmp-radio",
    label: "Radio",
    title: "Radio",
    note: "one choice from a named group",
    render: () => (
      <Block
        id="radio"
        title="Radio"
        note="one choice from a named group"
        tokens={["--color-action", "--color-surface", "--color-border-strong", "--color-focus-ring", "--choice-size"]}
      >
        <Row>
          <Cell label="group">
            <Column>
              <Radio name="cat-radio" label="Intake" defaultChecked />
              <Radio name="cat-radio" label="Clinical review" />
              <Radio name="cat-radio" label="Discharge" />
            </Column>
          </Cell>
        </Row>
      </Block>
    ),
  },
  {
    id: "cmp-switch",
    label: "Switch",
    title: "Switch",
    note: "an immediate binary setting",
    render: () => (
      <Block
        id="switch"
        title="Switch"
        note="an immediate binary setting"
        tokens={["--color-action", "--color-surface", "--color-border-strong", "--color-focus-ring", "--switch-width"]}
      >
        <Row>
          <Cell label="off">
            <Switch label="Live contrast" />
          </Cell>
          <Cell label="on">
            <Switch label="Derived colours" defaultChecked />
          </Cell>
        </Row>
      </Block>
    ),
  },
  {
    id: "cmp-slider",
    label: "Slider",
    title: "Slider",
    note: "Radix-backed; keyboard and pointer",
    render: () => (
      <Block
        id="slider"
        title="Slider"
        note="Radix-backed; keyboard and pointer"
        tokens={["--color-action", "--color-border", "--slider-track-height", "--slider-thumb-size", "--color-focus-ring"]}
      >
        <Row>
          <Cell label="with label">
            <Slider label="Tone" defaultValue={[40]} min={0} max={100} />
          </Cell>
          <Cell label="with hint">
            <Slider label="Intensity" hint="How strongly to apply the accent." defaultValue={[65]} min={0} max={100} />
          </Cell>
        </Row>
      </Block>
    ),
  },
  {
    id: "cmp-tabs",
    label: "Tabs",
    title: "Tabs",
    note: "roving tabindex from Radix",
    render: () => (
      <Block
        id="tabs"
        title="Tabs"
        note="roving tabindex from Radix"
        tokens={["--color-surface-subtle", "--color-text", "--color-text-muted", "--tab-padding-x", "--tab-height"]}
      >
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="done">Done</TabsTrigger>
          </TabsList>
          <TabsContent value="all">Everything in the queue.</TabsContent>
          <TabsContent value="open">Waiting on a reviewer.</TabsContent>
          <TabsContent value="done">Signed off.</TabsContent>
        </Tabs>
      </Block>
    ),
  },
  {
    id: "cmp-tooltip",
    label: "Tooltip",
    title: "Tooltip",
    note: "supplemental, never load-bearing",
    render: ({ portalContainer }) => (
      <Block
        id="tooltip"
        title="Tooltip"
        note="supplemental, never load-bearing"
        tokens={["--color-surface", "--color-border", "--tooltip-padding-x"]}
      >
        <Row>
          <Cell label="on an icon button">
            <TooltipRoot>
              <TooltipTrigger asChild>
                <Button variant="secondary" aria-label="About contrast">
                  <InfoIcon size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8} container={portalContainer ?? undefined}>
                All pairs still meet their minimum.
              </TooltipContent>
            </TooltipRoot>
          </Cell>
        </Row>
      </Block>
    ),
  },
  {
    id: "cmp-dialog",
    label: "Dialog",
    title: "Dialog",
    note: "modal confirmation",
    render: ({ portalContainer }) => (
      <Block
        id="dialog"
        title="Dialog"
        note="modal confirmation"
        tokens={["--color-scrim", "--color-surface", "--color-border-strong", "--dialog-width", "--dialog-padding"]}
      >
        <Row>
          <Cell label="confirm">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Open dialog</Button>
              </DialogTrigger>
              <DialogContent container={portalContainer ?? undefined}>
                <DialogHeader>
                  <DialogTitle>Promote this theme?</DialogTitle>
                  <DialogDescription>
                    This writes the token source locally. Nothing is committed.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button>Promote</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Cell>
        </Row>
      </Block>
    ),
  },
  {
    id: "cmp-table",
    label: "Table",
    title: "Table",
    note: "small datasets, real table semantics",
    render: () => (
      <Block
        id="table"
        title="Table"
        note="small datasets, real table semantics"
        tokens={[
          "--color-surface",
          "--color-border",
          "--color-text",
          "--color-text-muted",
          "--table-cell-padding-x",
          "--table-cell-padding-y",
        ]}
      >
        <Table
          caption="Colour roles and their literal values"
          header={["Token", "Layer", "Value"]}
          rows={[
            { key: "action", cells: ["--color-action", "semantic", "var(--deep-purple)"] },
            { key: "radius", cells: ["--radius-md", "primitive", "8px"] },
          ]}
        />
      </Block>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Patterns — composed combinations.
// ─────────────────────────────────────────────────────────────────────────────

export const PATTERN_PAGES: SpecimenPage[] = [
  {
    id: "pat-form",
    label: "Session note",
    title: "Session note",
    note: "a composed intake form demonstrating fields, borders and states",
    render: ({ portalContainer }) => (
      <Block
        id="pattern-form"
        title="Session note"
        note="a composed intake form demonstrating fields, borders and states"
        tokens={[
          "--color-surface",
          "--color-border-strong",
          "--color-border-hover",
          "--color-border-error",
          "--color-action",
          "--color-action-hover",
          "--color-action-text",
          "--color-text",
          "--color-text-muted",
          "--control-height-md",
          "--field-gap",
          "--card-padding",
          "--radius-sm",
        ]}
      >
        <Card heading="New session note" description="Fortnightly review · 12 May">
          <div className="nise-catalogue__form">
            <TextField label="Presenting concern" defaultValue="Sleep disruption" />
            <TextField
              label="Contact email"
              defaultValue="client@"
              error="A valid email is required to send appointment notes."
            />
            <Select
              label="Source"
              defaultValue="client"
              options={[
                { value: "client", label: "Client session" },
                { value: "referral", label: "GP Referral" },
              ]}
              portalContainer={portalContainer}
            />
            <Slider label="Confidence level" defaultValue={[60]} min={0} max={100} />
          </div>
          <div className="nise-catalogue__stack">
            <Checkbox label="Send review copy to clinical team" defaultChecked />
            <div className="nise-catalogue__bar">
              <Button variant="secondary">Cancel</Button>
              <Button rightIcon={<PlusIcon size={16} />}>Add note</Button>
            </div>
          </div>
        </Card>
      </Block>
    ),
  },
  {
    id: "pat-assessment",
    label: "Assessment rating",
    title: "Assessment rating",
    note: "diagnostic severity score, symptom tabs and choice controls",
    render: () => (
      <Block
        id="pattern-assessment"
        title="Assessment rating"
        note="diagnostic severity score, symptom tabs and choice controls"
        tokens={[
          "--color-surface",
          "--color-surface-hover",
          "--color-surface-active",
          "--color-action",
          "--color-action-hover",
          "--color-action-text",
          "--color-border-strong",
          "--color-border-hover",
          "--color-focus-ring",
          "--color-selected-surface",
          "--color-selected-text",
          "--color-text",
          "--color-text-muted",
          "--color-tint-purple",
          "--color-tint-cyan",
        ]}
      >
        <Card
          heading="Beck Anxiety Screener (BAI)"
          description="Symptom evaluation for Maya Calderón · Baseline Session"
          actions={
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <Badge tone="purple" icon={<InfoIcon size={16} />}>
                Screener
              </Badge>
              <Badge tone="cyan">Standardized</Badge>
            </div>
          }
          footer={
            <div className="nise-catalogue__bar" style={{ width: "100%" }}>
              <Button variant="ghost">Discard draft</Button>
              <Button rightIcon={<CheckIcon size={16} />}>Finalize assessment</Button>
            </div>
          }
        >
          <Tabs defaultValue="severity">
            <TabsList aria-label="Assessment views">
              <TabsTrigger value="severity">Severity score</TabsTrigger>
              <TabsTrigger value="symptoms">Checklist</TabsTrigger>
              <TabsTrigger value="protocol">Clinical notes</TabsTrigger>
            </TabsList>
            <TabsContent value="severity">
              <div className="nise-catalogue__stack">
                <Slider
                  label="Physiological symptom severity (1–10)"
                  defaultValue={[7]}
                  min={1}
                  max={10}
                  hint="Score >= 7 indicates moderate-to-severe physiological distress."
                />
                <div className="nise-catalogue__form">
                  <Radio name="assessment-freq" label="Daily occurrence" defaultChecked />
                  <Radio name="assessment-freq" label="Several days per week" />
                  <Radio name="assessment-freq" label="Rarely / isolated events" />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="symptoms">
              <div className="nise-catalogue__stack">
                <Checkbox
                  label="Numbness or tingling sensations"
                  defaultChecked
                  hint="Reported in both hands during stress."
                />
                <Checkbox label="Feeling hot or flushed" hint="Occurs during anxiety spikes." />
                <Checkbox label="Wobbliness in legs" />
              </div>
            </TabsContent>
            <TabsContent value="protocol">
              <p className="nise-catalogue__body">
                Clinical observations follow DSM-5 diagnostic criteria. Categorical badges and
                boundary cues guide interpretation without delivering an algorithmic diagnosis.
              </p>
            </TabsContent>
          </Tabs>
        </Card>
      </Block>
    ),
  },
  {
    id: "pat-queue",
    label: "Review queue",
    title: "Review queue",
    note: "a compact list of items with actions",
    render: () => (
      <Block
        id="pattern-queue"
        title="Review queue"
        note="a compact list of items with actions"
        tokens={[
          "--color-surface",
          "--color-surface-hover",
          "--color-border",
          "--color-text",
          "--color-text-muted",
          "--color-accent-cyan-surface",
        ]}
      >
        <Column>
          <div className="nise-catalogue__queue">
            <div className="nise-catalogue__queue-row">
              <div className="nise-catalogue__queue-main">
                <div className="nise-catalogue__queue-title">Session 4 · 12 May</div>
                <div className="nise-catalogue__queue-meta">
                  <Badge tone="cyan">Collateral</Badge> <span>Awaiting review</span>
                </div>
              </div>
              <div className="nise-catalogue__queue-actions">
                <Button size="sm" variant="secondary">
                  Review
                </Button>
              </div>
            </div>
            <div className="nise-catalogue__queue-row">
              <div className="nise-catalogue__queue-main">
                <div className="nise-catalogue__queue-title">Session 3 · 28 Apr</div>
                <div className="nise-catalogue__queue-meta">
                  <Badge tone="purple">Client report</Badge> <span>Minor edits</span>
                </div>
              </div>
              <div className="nise-catalogue__queue-actions">
                <Button size="sm" variant="ghost">
                  View
                </Button>
              </div>
            </div>
          </div>
        </Column>
      </Block>
    ),
  },
  {
    id: "pat-metrics",
    label: "Summary",
    title: "Summary",
    note: "a small dashboard of metrics",
    render: () => (
      <Block
        id="pattern-metrics"
        title="Summary"
        note="a small dashboard of metrics"
        tokens={[
          "--color-surface-subtle",
          "--color-text",
          "--color-text-muted",
          "--font-size-3xl",
          "--font-size-xs",
          "--radius-md",
        ]}
      >
        <div className="nise-catalogue__metrics">
          <div className="nise-catalogue__metric">
            <div className="nise-catalogue__metric-value">12</div>
            <div className="nise-catalogue__metric-label">Open notes</div>
          </div>
          <div className="nise-catalogue__metric">
            <div className="nise-catalogue__metric-value">86%</div>
            <div className="nise-catalogue__metric-label">On-track</div>
          </div>
          <div className="nise-catalogue__metric">
            <div className="nise-catalogue__metric-value">7</div>
            <div className="nise-catalogue__metric-label">Needs review</div>
          </div>
        </div>
      </Block>
    ),
  },
  {
    id: "pat-preferences",
    label: "Preferences",
    title: "Preferences",
    note: "a preferences panel with controls",
    render: () => (
      <Block
        id="pattern-preferences"
        title="Preferences"
        note="a preferences panel with controls"
        tokens={[
          "--color-surface",
          "--color-border",
          "--color-selected-surface",
          "--color-focus-ring",
          "--switch-width",
          "--slider-thumb-size",
        ]}
      >
        <Card heading="Workspace" description="Tweak the interface for your workflow">
          <div className="nise-catalogue__stack">
            <div className="nise-catalogue__switch-row">
              <div className="nise-catalogue__switch-text">
                <div className="nise-catalogue__switch-title">Live contrast checks</div>
                <div className="nise-catalogue__switch-desc">
                  Warn when a token pair drops below its minimum.
                </div>
              </div>
              <Switch defaultChecked label="Live contrast checks" />
            </div>
            <div className="nise-catalogue__switch-row">
              <div className="nise-catalogue__switch-text">
                <div className="nise-catalogue__switch-title">Derived colours</div>
                <div className="nise-catalogue__switch-desc">
                  Show colour-mix derivations in the token view.
                </div>
              </div>
              <Switch label="Derived colours" />
            </div>
            <Slider label="Density" defaultValue={[50]} min={0} max={100} hint="Adjust spacing density." />
            <div className="nise-catalogue__bar">
              <Button variant="secondary">Discard</Button>
              <Button>Save changes</Button>
            </div>
          </div>
        </Card>
      </Block>
    ),
  },
  {
    id: "pat-discharge",
    label: "Case discharge",
    title: "Case discharge",
    note: "critical action workflow with boundary confirmation and modal",
    render: ({ portalContainer }) => (
      <Block
        id="pattern-discharge"
        title="Case discharge"
        note="critical action workflow with boundary confirmation and modal"
        tokens={[
          "--color-surface",
          "--color-border-error",
          "--color-border-strong",
          "--color-border-hover",
          "--color-action",
          "--color-action-hover",
          "--color-text",
          "--color-text-muted",
          "--color-focus-ring",
          "--dialog-padding",
          "--dialog-width",
        ]}
      >
        <Card heading="Client Discharge Protocol" description="Final case review and permanent record archival">
          <div className="nise-catalogue__stack">
            <TextField
              label="Supervisor confirmation ID"
              defaultValue="SUP-00"
              error="Supervisor authorization code is required for discharge sign-off."
            />
            <Select
              label="Discharge justification"
              defaultValue="goals-met"
              options={[
                { value: "goals-met", label: "Treatment goals successfully achieved" },
                { value: "specialist", label: "Referred out to external specialist" },
                { value: "relocated", label: "Client relocated / discontinued" },
              ]}
              portalContainer={portalContainer}
            />
            <Checkbox
              label="I certify that all clinical notes and psychometric scores have been reviewed."
              defaultChecked
            />
            <div className="nise-catalogue__bar">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">Review discharge protocol</Button>
                </DialogTrigger>
                <DialogContent container={portalContainer ?? undefined}>
                  <DialogHeader>
                    <DialogTitle>Confirm Client Discharge</DialogTitle>
                    <DialogDescription>
                      This will archive Maya Calderón's case history and lock active treatment
                      notes. This operation requires clinical supervisor approval.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button>Authorize &amp; archive</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>
      </Block>
    ),
  },
  {
    id: "pat-composition",
    label: "Information review",
    title: "Information review",
    note: "the complete Numena reference clinical workspace composition",
    render: () => (
      <Block
        id="pattern-composition"
        title="Information review"
        note="the complete Numena reference clinical workspace composition"
        tokens={[
          "--color-surface",
          "--color-surface-subtle",
          "--color-surface-hover",
          "--color-border",
          "--color-border-strong",
          "--color-action",
          "--color-action-hover",
          "--color-selected-surface",
          "--color-selected-text",
          "--color-text",
          "--color-text-muted",
          "--color-focus-ring",
        ]}
      >
        <div style={{ width: "100%" }}>
          <InformationReview />
        </div>
      </Block>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Foundations registry — ids match the sidebar; Preview special-cases these.
// ─────────────────────────────────────────────────────────────────────────────

export type FoundationId =
  | "found-colour"
  | "found-type"
  | "found-space"
  | "found-shape"
  | "found-motion";

export const FOUNDATION_PAGES: { id: FoundationId; label: string; title: string; render: (ctx: PageRenderContext) => ReactNode }[] = [
  { id: "found-colour", label: "Colour", title: "Colour roles", render: (ctx) => <ColourPage {...ctx} /> },
  { id: "found-type", label: "Typography", title: "Typography", render: (ctx) => <TypographyPage {...ctx} /> },
  { id: "found-space", label: "Space", title: "Spacing scale", render: (ctx) => <SpacePage {...ctx} /> },
  { id: "found-shape", label: "Shape", title: "Shape & borders", render: (ctx) => <ShapePage {...ctx} /> },
  { id: "found-motion", label: "Motion", title: "Motion", render: (ctx) => <MotionPage {...ctx} /> },
];
