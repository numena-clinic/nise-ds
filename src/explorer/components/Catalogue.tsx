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
import { InfoIcon } from "../../icons";

interface BlockProps {
  id: string;
  title: string;
  note?: string;
  children: ReactNode;
}

function Block({ id, title, note, children }: BlockProps) {
  return (
    <section className="nise-catalogue__block" aria-labelledby={`cat-${id}`}>
      <header className="nise-catalogue__block-head">
        <h3 id={`cat-${id}`} className="nise-catalogue__block-title">
          {title}
        </h3>
        {note ? <p className="nise-catalogue__block-note">{note}</p> : null}
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
  return (
    <div className="nise-catalogue">
      <p className="nise-catalogue__lead">
        The Nise components, rendered on your experimental palette. Every variant
        below reads the semantic layer directly, so a token edit restyles all of
        them at once.
      </p>

      <Block id="buttons" title="Button" note="three variants, three sizes">
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

      <Block id="badges" title="Badge" note="categorical tones, never verdicts">
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

      <Block id="card" title="Card" note="heading, description, actions, footer">
        <Row>
          <Cell label="with footer">
            <Card
              heading="Session 4"
              description="Fortnightly review"
              footer={<Button size="sm">Save note</Button>}
            >
              <p className="nise-catalogue__body">
                The client reported better sleep after two weeks.
              </p>
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

      <Block id="fields" title="Fields" note="label always visible">
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

      <Block id="choice" title="Choice controls" note="never colour alone">
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

      <Block id="slider" title="Slider" note="Radix-backed; keyboard and pointer">
        <Row>
          <Cell label="with label">
            <Slider label="Tone" defaultValue={[40]} min={0} max={100} />
          </Cell>
          <Cell label="with hint">
            <Slider
              label="Intensity"
              hint="How strongly to apply the accent."
              defaultValue={[65]}
              min={0}
              max={100}
            />
          </Cell>
        </Row>
      </Block>

      <Block id="tabs" title="Tabs" note="roving tabindex from Radix">
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

      <Block id="overlays" title="Overlays" note="tooltip is supplemental, never load-bearing">
        <Row>
          <Cell label="tooltip">
            <TooltipRoot>
              <TooltipTrigger asChild>
                <Button variant="secondary" aria-label="About contrast">
                  <InfoIcon size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8} container={portalContainer ?? undefined}>
                All 14 pairs still meet their minimum.
              </TooltipContent>
            </TooltipRoot>
          </Cell>
          <Cell label="dialog">
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

      <Block id="table" title="Table" note="small datasets, real table semantics">
        <Table
          caption="Colour roles and their literal values"
          header={["Token", "Layer", "Value"]}
          rows={[
            { key: "action", cells: ["--color-action", "semantic", "var(--deep-purple)"] },
            { key: "radius", cells: ["--radius-md", "primitive", "8px"] },
          ]}
        />
      </Block>
    </div>
  );
}
