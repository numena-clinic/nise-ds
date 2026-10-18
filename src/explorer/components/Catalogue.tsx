// The preview catalogue: the Nise components, on your real tokens.
//
// Each family is a block with its variants and states laid out side by side, so
// a token change is visible across the whole library at once. Everything here is
// a real Nise component consuming the semantic layer directly (plain CSS) — no
// second component stack, no bridge. Changing a token restyles the whole page
// from a single edit.

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

interface BlockProps {
  id: string;
  title: string;
  note?: string;
  tokens?: string[];
  children: ReactNode;
}



function Block({ id, title, note, tokens, children }: BlockProps) {
  return (
    <section className="nise-catalogue__block" aria-labelledby={`cat-${id}`}>
      <header className="nise-catalogue__block-head">
        <div className="nise-catalogue__block-heading">
          <h3 id={`cat-${id}`} className="nise-catalogue__block-title">
            {title}
          </h3>
          {note ? <p className="nise-catalogue__block-note">{note}</p> : null}
        </div>
        {tokens && tokens.length ? (
          <ul className="nise-catalogue__tokens" aria-label="Related tokens">
            {tokens.map((name) => (
              <li key={name} className="nise-catalogue__token">
                <span className="nise-catalogue__token-name">{name}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </header>
      <div className="nise-catalogue__block-body">{children}</div>
    </section>
  );
}

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="nise-catalogue__cell">
      <div className="nise-catalogue__cell-stage">{children}</div>
      <figcaption className="nise-catalogue__cell-label">{label}</figcaption>
    </figure>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="nise-catalogue__row">{children}</div>;
}

function Column({ children }: { children: ReactNode }) {
  return <div className="nise-catalogue__column">{children}</div>;
}

export interface CatalogueProps {
  /**
   * Where portalled popups (Select, Tooltip, Dialog) should mount. Points at the
   * preview wrapper so the popup inherits the experimental custom properties.
   */
  portalContainer?: HTMLElement | null;
}

export function Catalogue({ portalContainer }: CatalogueProps) {
  const blocks: { id: string; title: string; href: string }[] = [
    { id: "buttons", title: "Button", href: "#cat-buttons" },
    { id: "badges", title: "Badge", href: "#cat-badges" },
    { id: "card", title: "Card", href: "#cat-card" },
    { id: "fields", title: "Fields", href: "#cat-fields" },
    { id: "choice", title: "Choice controls", href: "#cat-choice" },
    { id: "slider", title: "Slider", href: "#cat-slider" },
    { id: "tabs", title: "Tabs", href: "#cat-tabs" },
    { id: "overlays", title: "Overlays", href: "#cat-overlays" },
    { id: "table", title: "Table", href: "#cat-table" },
    { id: "pattern-form", title: "Session note", href: "#cat-pattern-form" },
    { id: "pattern-assessment", title: "Assessment rating", href: "#cat-pattern-assessment" },
    { id: "pattern-queue", title: "Review queue", href: "#cat-pattern-queue" },
    { id: "pattern-metrics", title: "Summary", href: "#cat-pattern-metrics" },
    { id: "pattern-preferences", title: "Preferences", href: "#cat-pattern-preferences" },
    { id: "pattern-discharge", title: "Case discharge", href: "#cat-pattern-discharge" },
    { id: "pattern-composition", title: "Information review", href: "#cat-pattern-composition" },
  ];

  return (
    <div className="nise-catalogue">
      <header className="nise-catalogue__head">
        <p className="nise-catalogue__lead">
          The Nise components and assorted combinations, rendered on your experimental palette. Every
          piece below reads the semantic layer directly, so a token edit restyles all of them at
          once.
        </p>
        <nav className="nise-catalogue__index" aria-label="Catalogue index">
          {blocks.map((b) => (
            <a key={b.id} href={b.href} className="nise-catalogue__index-link">
              {b.title}
            </a>
          ))}
        </nav>
      </header>

      <h2 className="nise-catalogue__section-title">Components</h2>

      <Block
        id="buttons"
        title="Button"
        note="three variants, three sizes"
        tokens={["--color-action","--color-action-hover","--color-action-text","--color-text","--color-border-strong","--radius-md","--control-height-md"]}
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

      <Block
        id="badges"
        title="Badge"
        note="categorical tones, never verdicts"
        tokens={["--color-text","--color-accent-purple-surface","--color-accent-purple-text","--color-accent-cyan-surface","--color-accent-tangerine-surface","--badge-radius"]}
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

      <Block
        id="card"
        title="Card"
        note="heading, description, actions, footer"
        tokens={["--color-surface","--color-border","--color-text","--radius-lg","--card-padding","--card-gap"]}
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
              actions={<Button size="sm" variant="secondary">Edit</Button>}
            >
              <Badge tone="cyan">Collateral</Badge>
            </Card>
          </Cell>
        </Row>
      </Block>

      <Block
        id="fields"
        title="Fields"
        note="label always visible"
        tokens={["--color-surface","--color-border-strong","--color-border-hover","--color-focus-ring","--color-text","--color-text-muted","--input-height"]}
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
        <Row>
          <Cell label="select">
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
          <Cell label="select placeholder">
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

      <Block
        id="choice"
        title="Choice controls"
        note="never colour alone"
        tokens={["--color-action","--color-surface","--color-border-strong","--color-focus-ring","--choice-size"]}
      >
        <Row>
          <Cell label="checkbox">
            <Checkbox label="Include derived colours" defaultChecked />
          </Cell>
          <Cell label="checkbox · indeterminate">
            <Checkbox label="Partial selection" indeterminate />
          </Cell>
          <Cell label="switch">
            <Switch label="Live contrast" />
          </Cell>
        </Row>
        <Row>
          <Cell label="radio group">
            <Column>
              <Radio name="cat-radio" label="Intake" defaultChecked />
              <Radio name="cat-radio" label="Clinical review" />
              <Radio name="cat-radio" label="Discharge" />
            </Column>
          </Cell>
        </Row>
      </Block>

      <Block
        id="slider"
        title="Slider"
        note="Radix-backed; keyboard and pointer"
        tokens={["--color-action","--color-border","--slider-track-height","--slider-thumb-size","--color-focus-ring"]}
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

      <Block
        id="tabs"
        title="Tabs"
        note="roving tabindex from Radix"
        tokens={["--color-surface-subtle","--color-text","--color-text-muted","--tab-padding-x","--tab-height"]}
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

      <Block
        id="overlays"
        title="Overlays"
        note="tooltip is supplemental, never load-bearing"
        tokens={["--color-scrim","--color-surface","--color-border","--dialog-width","--tooltip-padding-x"]}
      >
        <Row>
          <Cell label="tooltip">
            <TooltipRoot>
              <TooltipTrigger asChild>
                <Button variant="secondary" aria-label="About contrast"><InfoIcon size={16} /></Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8} container={portalContainer ?? undefined}>All pairs still meet their minimum.</TooltipContent>
            </TooltipRoot>
          </Cell>
          <Cell label="dialog">
            <Dialog>
              <DialogTrigger asChild><Button variant="secondary">Open dialog</Button></DialogTrigger>
              <DialogContent container={portalContainer ?? undefined}>
                <DialogHeader>
                  <DialogTitle>Promote this theme?</DialogTitle>
                  <DialogDescription>This writes the token source locally. Nothing is committed.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                  <Button>Promote</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Cell>
        </Row>
      </Block>

      <Block
        id="table"
        title="Table"
        note="small datasets, real table semantics"
        tokens={["--color-surface","--color-border","--color-text","--color-text-muted","--table-cell-padding-x","--table-cell-padding-y"]}
      >
        <Table
          caption="Colour roles and their literal values"
          header={["Token","Layer","Value"]}
          rows={[
            { key:"action", cells:["--color-action","semantic","var(--deep-purple)"] },
            { key:"radius", cells:["--radius-md","primitive","8px"] },
          ]}
        />
      </Block>

      <h2 className="nise-catalogue__section-title">Patterns</h2>

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
          "--radius-md",
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
              <Badge tone="purple" icon={<InfoIcon size={16} />}>Screener</Badge>
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
                <Checkbox label="Numbness or tingling sensations" defaultChecked hint="Reported in both hands during stress." />
                <Checkbox label="Feeling hot or flushed" hint="Occurs during anxiety spikes." />
                <Checkbox label="Wobbliness in legs" />
              </div>
            </TabsContent>
            <TabsContent value="protocol">
              <p className="nise-catalogue__body">
                Clinical observations follow DSM-5 diagnostic criteria. Categorical badges and boundary cues guide interpretation without delivering an algorithmic diagnosis.
              </p>
            </TabsContent>
          </Tabs>
        </Card>
      </Block>

      <Block
        id="pattern-queue"
        title="Review queue"
        note="a compact list of items with actions"
        tokens={["--color-surface","--color-surface-hover","--color-border","--color-text","--color-text-muted","--color-accent-cyan-surface"]}
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
                <Button size="sm" variant="secondary">Review</Button>
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
                <Button size="sm" variant="ghost">View</Button>
              </div>
            </div>
          </div>
        </Column>
      </Block>

      <Block
        id="pattern-metrics"
        title="Summary"
        note="a small dashboard of metrics"
        tokens={["--color-surface-subtle","--color-text","--color-text-muted","--font-size-3xl","--font-size-xs","--radius-lg"]}
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

      <Block
        id="pattern-preferences"
        title="Preferences"
        note="a preferences panel with controls"
        tokens={["--color-surface","--color-border","--color-selected-surface","--color-focus-ring","--switch-width","--slider-thumb-size"]}
      >
        <Card heading="Workspace" description="Tweak the interface for your workflow">
          <div className="nise-catalogue__stack">
            <div className="nise-catalogue__switch-row">
              <div className="nise-catalogue__switch-text">
                <div className="nise-catalogue__switch-title">Live contrast checks</div>
                <div className="nise-catalogue__switch-desc">Warn when a token pair drops below its minimum.</div>
              </div>
              <Switch defaultChecked label="Live contrast checks" />
            </div>
            <div className="nise-catalogue__switch-row">
              <div className="nise-catalogue__switch-text">
                <div className="nise-catalogue__switch-title">Derived colours</div>
                <div className="nise-catalogue__switch-desc">Show colour-mix derivations in the token view.</div>
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
        <Card
          heading="Client Discharge Protocol"
          description="Final case review and permanent record archival"
        >
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
                      This will archive Maya Calderón's case history and lock active treatment notes.
                      This operation requires clinical supervisor approval.
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
    </div>
  );
}
