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
  Alert,
  AspectRatio,
  Avatar,
  Badge,
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Empty,
  Kbd,
  Label,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Progress,
  Radio,
  Select,
  Separator,
  Skeleton,
  Slider,
  Switch,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  TextField,
  Timeline,
  TimelineItem,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from "../../index";
import { CheckIcon, InfoIcon, PlusIcon } from "../../icons";
import { InformationReview } from "../../compositions/InformationReview";
import { ALL_TOKENS, INFO_BY_NAME, LAYERS, isAnchorRole } from "../theme/tokens";
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
          "--color-primary",
          "--color-primary-hover",
          "--color-primary-content",
          "--color-base-content",
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
          "--color-base-200",
          "--color-base-content",
          "--color-tint-purple",
          "--color-tint-cyan",
          "--color-tint-tangerine",
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
        tokens={["--color-base-100", "--color-border", "--color-base-content", "--radius-md", "--card-padding", "--card-gap"]}
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
          "--color-base-100",
          "--color-border-strong",
          "--color-border-hover",
          "--color-focus-ring",
          "--color-base-content",
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
        tokens={["--color-base-100", "--color-border-strong", "--color-border-hover", "--color-focus-ring", "--select-height"]}
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
        tokens={["--color-primary", "--color-base-100", "--color-border-strong", "--color-focus-ring", "--choice-size"]}
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
        tokens={["--color-primary", "--color-base-100", "--color-border-strong", "--color-focus-ring", "--choice-size"]}
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
        tokens={["--color-primary", "--color-base-100", "--color-border-strong", "--color-focus-ring", "--switch-width"]}
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
        tokens={["--color-primary", "--color-border", "--slider-track-height", "--slider-thumb-size", "--color-focus-ring"]}
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
        tokens={["--color-base-200", "--color-base-content", "--color-text-muted", "--tab-padding-x", "--tab-height"]}
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
        tokens={["--color-base-100", "--color-border", "--tooltip-padding-x"]}
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
        tokens={["--color-scrim", "--color-base-100", "--color-border-strong", "--dialog-width", "--dialog-padding"]}
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
          "--color-base-100",
          "--color-border",
          "--color-base-content",
          "--color-text-muted",
          "--table-cell-padding-x",
          "--table-cell-padding-y",
        ]}
      >
        <Table
          caption="Colour roles and their literal values"
          header={["Token", "Layer", "Value"]}
          rows={[
            { key: "action", cells: ["--color-primary", "semantic", "var(--deep-purple)"] },
            { key: "radius", cells: ["--radius-md", "primitive", "8px"] },
          ]}
        />
      </Block>
    ),
  },
  {
    id: "cmp-alert",
    label: "Alert",
    title: "Alert",
    note: "machine-state banner — info, success, warning, error",
    render: () => (
      <Block
        id="alert"
        title="Alert"
        note="machine-state banner — info, success, warning, error"
        tokens={[
          "--color-info",
          "--color-success",
          "--color-warning",
          "--color-error",
          "--color-base-100",
          "--color-base-content",
          "--alert-padding",
        ]}
      >
        <Column>
          <Alert variant="info" title="Session export scheduled">
            The PDF will be ready in your downloads folder within a minute.
          </Alert>
          <Alert variant="success" title="Note saved">
            All changes have been committed to the record.
          </Alert>
          <Alert variant="warning" title="Draft unsaved">
            Close or navigate away will discard unsaved changes.
          </Alert>
          <Alert variant="error" title="Sync failed">
            The record could not be pushed. Check your connection and retry.
          </Alert>
        </Column>
      </Block>
    ),
  },
  {
    id: "cmp-avatar",
    label: "Avatar",
    title: "Avatar",
    note: "person identity — image with initials fallback",
    render: () => (
      <Block
        id="avatar"
        title="Avatar"
        note="person identity — image with initials fallback"
        tokens={[
          "--color-tint-purple",
          "--color-base-content",
          "--radius-full",
          "--control-height-sm",
          "--control-height-md",
          "--control-height-lg",
        ]}
      >
        <Row>
          <Cell label="small">
            <Avatar fallback="AM" size="sm" />
          </Cell>
          <Cell label="medium">
            <Avatar fallback="MC" size="md" />
          </Cell>
          <Cell label="large">
            <Avatar fallback="JS" size="lg" />
          </Cell>
          <Cell label="with image">
            <Avatar src="/avatar.png" alt="Amina Mensah" fallback="AM" size="md" />
          </Cell>
        </Row>
      </Block>
    ),
  },
  {
    id: "cmp-progress",
    label: "Progress",
    title: "Progress",
    note: "determinate and indeterminate meter",
    render: () => (
      <Block
        id="progress"
        title="Progress"
        note="determinate and indeterminate meter"
        tokens={[
          "--color-primary",
          "--color-base-200",
          "--progress-height",
          "--radius-full",
        ]}
      >
        <Column>
          <Progress value={40} max={100} aria-label="Session export — 40%" />
          <Progress value={75} max={100} aria-label="Upload — 75%" />
          <Progress value={null} aria-label="Syncing record…" />
        </Column>
      </Block>
    ),
  },
  {
    id: "cmp-skeleton",
    label: "Skeleton",
    title: "Skeleton",
    note: "loading placeholder — aria-hidden, never the sole loading signal",
    render: () => (
      <Block
        id="skeleton"
        title="Skeleton"
        note="loading placeholder — aria-hidden, never the sole loading signal"
        tokens={[
          "--color-base-200",
          "--duration-slow",
          "--ease-standard",
          "--skeleton-radius",
        ]}
      >
        <Column>
          <Skeleton style={{ width: "100%", height: "var(--control-height-md)" }} />
          <Skeleton style={{ width: "60%", height: "var(--control-height-md)" }} />
          <Skeleton style={{ width: "80%", height: "var(--space-8)" }} />
        </Column>
      </Block>
    ),
  },
  {
    id: "cmp-separator",
    label: "Separator",
    title: "Separator",
    note: "hairline between sections",
    render: () => (
      <Block
        id="separator"
        title="Separator"
        note="hairline between sections"
        tokens={["--color-border", "--separator-thickness"]}
      >
        <Column>
          <span>Session details</span>
          <Separator />
          <span>Attachments</span>
          <Separator />
          <span>History</span>
        </Column>
      </Block>
    ),
  },
  {
    id: "cmp-kbd",
    label: "Kbd",
    title: "Kbd",
    note: "keyboard shortcut label",
    render: () => (
      <Block
        id="kbd"
        title="Kbd"
        note="keyboard shortcut label"
        tokens={[
          "--color-base-200",
          "--color-base-content",
          "--color-border",
          "--kbd-height",
          "--kbd-padding-x",
          "--kbd-font-size",
          "--radius-sm",
        ]}
      >
        <Row>
          <Cell label="single key">
            <Kbd>⌘</Kbd>
          </Cell>
          <Cell label="combo">
            <span style={{ display: "flex", gap: "var(--space-1)", alignItems: "center" }}>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </Cell>
          <Cell label="save shortcut">
            <span style={{ display: "flex", gap: "var(--space-1)", alignItems: "center" }}>
              <Kbd>⌘</Kbd>
              <Kbd>S</Kbd>
            </span>
          </Cell>
        </Row>
      </Block>
    ),
  },
  {
    id: "cmp-label",
    label: "Label",
    title: "Label",
    note: "field label — pairs with a form control",
    render: () => (
      <Block
        id="label"
        title="Label"
        note="field label — pairs with a form control"
        tokens={[
          "--color-base-content",
          "--color-text-muted",
          "--font-size-sm",
          "--font-size-xs",
          "--font-weight-medium",
        ]}
      >
        <Column>
          <Label htmlFor="demo-label-sm" size="sm">Small label</Label>
          <Label htmlFor="demo-label-md">Default label</Label>
          <Label htmlFor="demo-label-req" required>Required field</Label>
          <Label htmlFor="demo-label-hint" hint="How the client would like to be addressed.">
            Preferred name
          </Label>
        </Column>
      </Block>
    ),
  },
  {
    id: "cmp-textarea",
    label: "Textarea",
    title: "Textarea",
    note: "multi-line text control — same field skeleton as TextField",
    render: () => (
      <Block
        id="textarea"
        title="Textarea"
        note="multi-line text control — same field skeleton as TextField"
        tokens={[
          "--color-base-100",
          "--color-border-strong",
          "--color-border-hover",
          "--color-focus-ring",
          "--color-base-content",
          "--textarea-min-height",
        ]}
      >
        <Row>
          <Cell label="default">
            <Textarea label="Session notes" defaultValue="Client reported improved sleep patterns over the past fortnight." />
          </Cell>
          <Cell label="error">
            <Textarea label="Clinical observations" error="Notes are required before signing off." />
          </Cell>
          <Cell label="disabled">
            <Textarea label="Archived notes" defaultValue="Locked after discharge." disabled />
          </Cell>
        </Row>
      </Block>
    ),
  },
  {
    id: "cmp-breadcrumb",
    label: "Breadcrumb",
    title: "Breadcrumb",
    note: "navigational hierarchy",
    render: () => (
      <Block
        id="breadcrumb"
        title="Breadcrumb"
        note="navigational hierarchy"
        tokens={[
          "--color-link",
          "--color-link-hover",
          "--color-text-muted",
          "--color-base-content",
          "--font-size-sm",
        ]}
      >
        <Column>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Maya Calderón</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Session 4</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbEllipsis />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Session 4</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Column>
      </Block>
    ),
  },
  {
    id: "cmp-pagination",
    label: "Pagination",
    title: "Pagination",
    note: "page navigation for record lists",
    render: () => (
      <Block
        id="pagination"
        title="Pagination"
        note="page navigation for record lists"
        tokens={[
          "--color-text-muted",
          "--color-base-hover",
          "--color-base-content",
          "--color-tint-purple",
          "--color-focus-ring",
          "--button-height-sm",
          "--radius-sm",
        ]}
      >
        <Column>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">12</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </Column>
      </Block>
    ),
  },
  {
    id: "cmp-collapsible",
    label: "Collapsible",
    title: "Collapsible",
    note: "disclosure region — details/summary native",
    render: () => (
      <Block
        id="collapsible"
        title="Collapsible"
        note="disclosure region — details/summary native"
        tokens={[
          "--color-base-content",
          "--color-base-hover",
          "--color-focus-ring",
          "--radius-sm",
          "--space-2",
        ]}
      >
        <Column>
          <Collapsible>
            <CollapsibleTrigger>Advanced export options</CollapsibleTrigger>
            <CollapsibleContent>
              <Column>
                <Checkbox label="Include archived notes" />
                <Checkbox label="Redact personally identifiable fields" defaultChecked />
              </Column>
            </CollapsibleContent>
          </Collapsible>
          <Collapsible defaultOpen>
            <CollapsibleTrigger>Clinical history</CollapsibleTrigger>
            <CollapsibleContent>
              <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                Four sessions completed. Next review in two weeks.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </Column>
      </Block>
    ),
  },
  {
    id: "cmp-empty",
    label: "Empty",
    title: "Empty",
    note: "empty state — no records yet",
    render: () => (
      <Block
        id="empty"
        title="Empty"
        note="empty state — no records yet"
        tokens={[
          "--color-tint-purple",
          "--color-base-content",
          "--color-text-muted",
          "--empty-padding",
          "--empty-gap",
          "--radius-full",
        ]}
      >
        <Row>
          <Cell label="no sessions">
            <Empty
              title="No sessions recorded"
              description="Add the first session note to start building this client's record."
              action={<Button size="sm">Add session</Button>}
            />
          </Cell>
          <Cell label="no results">
            <Empty
              title="No results"
              description="Try adjusting your search filters."
            />
          </Cell>
        </Row>
      </Block>
    ),
  },
  {
    id: "cmp-timeline",
    label: "Timeline",
    title: "Timeline",
    note: "vertical event history",
    render: () => (
      <Block
        id="timeline"
        title="Timeline"
        note="vertical event history"
        tokens={[
          "--color-primary",
          "--color-tint-purple",
          "--color-border",
          "--color-base-content",
          "--color-text-muted",
          "--timeline-dot",
          "--timeline-gap",
          "--timeline-rail",
        ]}
      >
        <Column>
          <Timeline>
            <TimelineItem variant="done" title="Intake form completed" meta="12 Mar · Amina Mensah" />
            <TimelineItem variant="done" title="Session 1 — note saved" meta="19 Mar · Amina Mensah" />
            <TimelineItem variant="current" title="Session 2 — in progress" meta="26 Mar" />
            <TimelineItem variant="upcoming" title="Session 3 — scheduled" meta="9 Apr" />
          </Timeline>
        </Column>
      </Block>
    ),
  },
  {
    id: "cmp-toggle",
    label: "Toggle",
    title: "Toggle",
    note: "pressed/unpressed toolbar control",
    render: () => (
      <Block
        id="toggle"
        title="Toggle"
        note="pressed/unpressed toolbar control"
        tokens={[
          "--color-selected-surface",
          "--color-selected-text",
          "--color-primary",
          "--color-base-hover",
          "--button-height-md",
          "--button-padding-x-md",
        ]}
      >
        <Row>
          <Cell label="unpressed">
            <Toggle>Bold</Toggle>
          </Cell>
          <Cell label="pressed">
            <Toggle defaultPressed>Italic</Toggle>
          </Cell>
          <Cell label="small">
            <Toggle size="sm" defaultPressed>Filter</Toggle>
          </Cell>
          <Cell label="large">
            <Toggle size="lg">Expand</Toggle>
          </Cell>
          <Cell label="disabled">
            <Toggle disabled>Locked</Toggle>
          </Cell>
        </Row>
      </Block>
    ),
  },
  {
    id: "cmp-togglegroup",
    label: "ToggleGroup",
    title: "ToggleGroup",
    note: "single or multi-selection toolbar group",
    render: () => (
      <Block
        id="togglegroup"
        title="ToggleGroup"
        note="single or multi-selection toolbar group"
        tokens={[
          "--color-selected-surface",
          "--color-selected-text",
          "--color-primary",
          "--color-base-hover",
          "--radius-sm",
        ]}
      >
        <Column>
          <ToggleGroup type="single" label="View mode" defaultValue="note">
            <ToggleGroupItem value="note">Session note</ToggleGroupItem>
            <ToggleGroupItem value="summary">Summary</ToggleGroupItem>
            <ToggleGroupItem value="history">History</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="multi" label="Overlay layers" defaultValue={["transcript"]}>
            <ToggleGroupItem value="transcript">Transcript</ToggleGroupItem>
            <ToggleGroupItem value="annotations">Annotations</ToggleGroupItem>
            <ToggleGroupItem value="flags">Flags</ToggleGroupItem>
          </ToggleGroup>
        </Column>
      </Block>
    ),
  },
  {
    id: "cmp-aspectratio",
    label: "AspectRatio",
    title: "AspectRatio",
    note: "reserved frame for charts and media",
    render: () => (
      <Block
        id="aspectratio"
        title="AspectRatio"
        note="reserved frame for charts and media"
        tokens={["--color-tint-cyan", "--radius-md"]}
      >
        <Row>
          <Cell label="16 / 9">
            <div style={{ width: 240 }}>
              <AspectRatio ratio={16 / 9}>
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "var(--color-tint-cyan)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-base-content)",
                  }}
                >
                  16 : 9
                </div>
              </AspectRatio>
            </div>
          </Cell>
          <Cell label="4 / 3">
            <div style={{ width: 240 }}>
              <AspectRatio ratio={4 / 3}>
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "var(--color-tint-purple)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-base-content)",
                  }}
                >
                  4 : 3
                </div>
              </AspectRatio>
            </div>
          </Cell>
        </Row>
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
          "--color-base-100",
          "--color-border-strong",
          "--color-border-hover",
          "--color-border-error",
          "--color-primary",
          "--color-primary-hover",
          "--color-primary-content",
          "--color-base-content",
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
          "--color-base-100",
          "--color-base-hover",
          "--color-base-active",
          "--color-primary",
          "--color-primary-hover",
          "--color-primary-content",
          "--color-border-strong",
          "--color-border-hover",
          "--color-focus-ring",
          "--color-selected-surface",
          "--color-selected-text",
          "--color-base-content",
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
          "--color-base-100",
          "--color-base-hover",
          "--color-border",
          "--color-base-content",
          "--color-text-muted",
          "--color-tint-cyan",
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
          "--color-base-200",
          "--color-base-content",
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
          "--color-base-100",
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
          "--color-base-100",
          "--color-border-error",
          "--color-border-strong",
          "--color-border-hover",
          "--color-primary",
          "--color-primary-hover",
          "--color-base-content",
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
          "--color-base-100",
          "--color-base-200",
          "--color-base-hover",
          "--color-border",
          "--color-border-strong",
          "--color-primary",
          "--color-primary-hover",
          "--color-selected-surface",
          "--color-selected-text",
          "--color-base-content",
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
