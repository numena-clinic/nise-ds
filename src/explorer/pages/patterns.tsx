// Composed pattern demos.

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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextField,
} from "../../index";
import { InformationReview } from "../../compositions/InformationReview";
import { CheckIcon, InfoIcon, PlusIcon } from "../../icons";
import { Block, Column } from "../components/specimen";
import type { SpecimenPage } from "./types";

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
                <div className="nise-catalogue__switch-title">Derived colors</div>
                <div className="nise-catalogue__switch-desc">
                  Show color-mix derivations in the token view.
                </div>
              </div>
              <Switch label="Derived colors" />
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
