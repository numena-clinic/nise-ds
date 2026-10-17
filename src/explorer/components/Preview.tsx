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
// phone, tablet and desktop size without leaving the page.
//
// The Select popup portals to document.body by default, which would escape the
// wrapper and lose the scoped variables; it is pointed at the wrapper instead.

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Badge, Button, Card, Select, TextField } from "../../index";
import { AlertIcon, ChevronDownIcon, InfoIcon, PlusIcon } from "../../icons";
import { InformationReview } from "../../compositions/InformationReview";
import { ALL_TOKENS } from "../theme/tokens";
import { experimentalTokens, previewStyle, resolve, type Overrides } from "../theme/theme";
import { Catalogue } from "./Catalogue";
import { TokenReference } from "./TokenReference";

interface Props {
  overrides: Overrides;
}

type View = "catalogue" | "tokens";
type Device = "mobile" | "tablet" | "desktop";

const ROLE_SWATCHES: string[] = [
  "--color-surface",
  "--color-surface-subtle",
  "--color-surface-hover",
  "--color-border",
  "--color-border-strong",
  "--color-text",
  "--color-text-muted",
  "--color-text-inverted",
  "--color-action",
  "--color-action-hover",
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
].filter((name) => name in ALL_TOKENS);

const OPTIONS = [
  { value: "client", label: "Client report" },
  { value: "collateral", label: "Collateral" },
  { value: "observation", label: "Observation" },
  { value: "assessment", label: "Standardised assessment", disabled: true },
];

const DEVICES: { id: Device; label: string; width: string }[] = [
  { id: "mobile", label: "Phone", width: "390px" },
  { id: "tablet", label: "Tablet", width: "768px" },
  { id: "desktop", label: "Desktop", width: "100%" },
];

export function Preview({ overrides }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [view, setView] = useState<View>("catalogue");
  const [device, setDevice] = useState<Device>("desktop");
  useEffect(() => setPortalContainer(wrapperRef.current), []);

  const map = experimentalTokens(overrides);
  const style = previewStyle(overrides) as CSSProperties;
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
        data-nise-theme
      >
        {view === "tokens" ? (
          <TokenReference overrides={overrides} query="" />
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

            <section className="nise-explorer__specimen" aria-labelledby="pv-buttons">
              <h2 id="pv-buttons" className="nise-explorer__specimen-title">
                Buttons
              </h2>
              <div className="nise-pv__stack">
                {(["primary", "secondary", "ghost"] as const).map((variant) => (
                  <div key={variant} className="nise-pv__row">
                    <span className="nise-pv__rowlabel">{variant}</span>
                    <Button variant={variant} size="sm">
                      Small
                    </Button>
                    <Button variant={variant} size="md">
                      Medium
                    </Button>
                    <Button variant={variant} size="lg">
                      Large
                    </Button>
                    <Button variant={variant} leftIcon={<PlusIcon size={16} />}>
                      With icon
                    </Button>
                    <Button variant={variant} loading>
                      Saving
                    </Button>
                    <Button variant={variant} disabled>
                      Disabled
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section className="nise-explorer__specimen" aria-labelledby="pv-fields">
              <h2 id="pv-fields" className="nise-explorer__specimen-title">
                Form fields
              </h2>
              <div className="nise-pv__grid2">
                <TextField id="pv-name" label="Client name" defaultValue="Maya Calderón" />
                <TextField
                  id="pv-name-hint"
                  label="Preferred name"
                  defaultValue="Maya"
                  hint="How they would like to be addressed."
                />
                <TextField
                  id="pv-name-error"
                  label="Contact email"
                  defaultValue="maya@"
                  error="Enter a full email address."
                />
                <TextField
                  id="pv-name-disabled"
                  label="Reference"
                  defaultValue="SESSION-004"
                  disabled
                  hint="Assigned automatically."
                />
                <Select
                  id="pv-source"
                  label="Source"
                  options={OPTIONS}
                  defaultValue="client"
                  portalContainer={portalContainer}
                />
                <Select
                  id="pv-source-error"
                  label="Confidence"
                  options={[
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                  ]}
                  placeholder="Not sure"
                  error="Choose a confidence level."
                  portalContainer={portalContainer}
                />
              </div>
            </section>

            <section className="nise-explorer__specimen" aria-labelledby="pv-badges">
              <h2 id="pv-badges" className="nise-explorer__specimen-title">
                Badges
              </h2>
              <div className="nise-pv__row">
                <Badge tone="neutral">Neutral</Badge>
                <Badge tone="purple" icon={<InfoIcon size={16} />}>
                  Client report
                </Badge>
                <Badge tone="cyan">Collateral</Badge>
                <Badge tone="tangerine" icon={<AlertIcon size={16} />}>
                  Observation
                </Badge>
                <Badge tone="purple" size="sm">
                  Small
                </Badge>
                <Badge tone="neutral" size="sm">
                  Small neutral
                </Badge>
              </div>
            </section>

            <section className="nise-explorer__specimen" aria-labelledby="pv-card">
              <h2 id="pv-card" className="nise-explorer__specimen-title">
                Card &amp; composition
              </h2>
              <Card
                heading="Session 4 · 12 May"
                description="Fortnightly review. Client described improved sleep onset."
                actions={<Badge tone="cyan">Collateral</Badge>}
                footer={
                  <>
                    <Button variant="ghost">Discard</Button>
                    <Button variant="primary" rightIcon={<ChevronDownIcon size={16} />}>
                      Save review
                    </Button>
                  </>
                }
              >
                <div className="nise-pv__row">
                  <Badge tone="purple">Client report</Badge>
                  <Badge tone="cyan">Collateral</Badge>
                  <Badge tone="neutral">Observation</Badge>
                </div>
                <TextField id="pv-concern" label="Presenting concern" defaultValue="Sleep onset" />
                <TextField
                  id="pv-words"
                  label="Client's own words"
                  defaultValue="I lie awake for about an hour most nights."
                />
              </Card>

              <div className="nise-pv__composition">
                <InformationReview />
              </div>
            </section>

            <Catalogue portalContainer={portalContainer} />
          </>
        )}
      </div>
    </div>
  );
}
