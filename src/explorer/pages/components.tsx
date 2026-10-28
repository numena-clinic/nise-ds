// Component specimen pages — one page per family.

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
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
import { useState } from "react";
import {
  InfoIcon,
  BookmarkIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ChevronsUpDownIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  FileIcon,
} from "../../icons";
import { Block, Cell, Column, Row } from "../components/specimen";
import type { SpecimenPage } from "./types";

function ExplorerFileTree() {
  return (
    <div style={{ width: 260 }}>
      <Card>
        <Tabs defaultValue="explorer">
        <TabsList style={{ width: "100%", marginBottom: "var(--space-2)" }}>
          <TabsTrigger value="explorer" style={{ flex: 1 }}>Explorer</TabsTrigger>
          <TabsTrigger value="outline" style={{ flex: 1 }}>Outline</TabsTrigger>
        </TabsList>
        <TabsContent value="explorer">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <Collapsible defaultOpen>
              <CollapsibleTrigger
                variant="ghost"
                size="sm"
                className="nise-collapsible__tree-item"
              >
                <ChevronRightIcon
                  size={16}
                  className="nise-collapsible__chevron"
                />
                <FolderIcon size={16} />
                <span>components</span>
              </CollapsibleTrigger>
              <CollapsibleContent
                style={{
                  paddingLeft: "var(--space-4)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-1)",
                  paddingTop: "var(--space-1)",
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="nise-collapsible__tree-item"
                >
                  <FileIcon size={16} />
                  <span>Button.tsx</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="nise-collapsible__tree-item"
                >
                  <FileIcon size={16} />
                  <span>Card.tsx</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="nise-collapsible__tree-item"
                >
                  <FileIcon size={16} />
                  <span>Collapsible.tsx</span>
                </Button>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger
                variant="ghost"
                size="sm"
                className="nise-collapsible__tree-item"
              >
                <ChevronRightIcon
                  size={16}
                  className="nise-collapsible__chevron"
                />
                <FolderIcon size={16} />
                <span>lib</span>
              </CollapsibleTrigger>
              <CollapsibleContent
                style={{
                  paddingLeft: "var(--space-4)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-1)",
                  paddingTop: "var(--space-1)",
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="nise-collapsible__tree-item"
                >
                  <FileIcon size={16} />
                  <span>utils.ts</span>
                </Button>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger
                variant="ghost"
                size="sm"
                className="nise-collapsible__tree-item"
              >
                <ChevronRightIcon
                  size={16}
                  className="nise-collapsible__chevron"
                />
                <FolderIcon size={16} />
                <span>hooks</span>
              </CollapsibleTrigger>
              <CollapsibleContent
                style={{
                  paddingLeft: "var(--space-4)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-1)",
                  paddingTop: "var(--space-1)",
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="nise-collapsible__tree-item"
                >
                  <FileIcon size={16} />
                  <span>use-collapsible.ts</span>
                </Button>
              </CollapsibleContent>
            </Collapsible>

            <Button
              variant="ghost"
              size="sm"
              className="nise-collapsible__tree-item nise-collapsible__tree-item--root-file"
            >
              <FileIcon size={16} />
              <span>app.tsx</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="nise-collapsible__tree-item nise-collapsible__tree-item--root-file"
            >
              <FileIcon size={16} />
              <span>globals.css</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="nise-collapsible__tree-item nise-collapsible__tree-item--root-file"
            >
              <FileIcon size={16} />
              <span>package.json</span>
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="outline">
          <div style={{ padding: "var(--space-2)", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
            No outline items available.
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  </div>
  );
}

function ExplorerCollapsibleSpecimen() {
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <Row>
      <Cell label="starred repositories (shadcn card demo)">
        <div style={{ width: 340 }}>
          <Collapsible
            open={open}
            onOpenChange={setOpen}
            style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingInline: "var(--space-4)",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-base-content)",
                }}
              >
                @peduarte starred 3 repositories
              </h4>
              <CollapsibleTrigger
                variant="ghost"
                size="sm"
                aria-label="Toggle repository list"
                style={{
                  width: 32,
                  height: 32,
                  padding: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChevronsUpDownIcon size={16} />
              </CollapsibleTrigger>
            </div>

            <div
              style={{
                padding: "var(--space-2) var(--space-4)",
                border: "var(--border-width) solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-base-100)",
                fontSize: "var(--font-size-sm)",
                fontFamily: "var(--font-mono, monospace)",
                color: "var(--color-base-content)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              @radix-ui/primitives
            </div>

            <CollapsibleContent
              style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}
            >
              <div
                style={{
                  padding: "var(--space-2) var(--space-4)",
                  border: "var(--border-width) solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-base-100)",
                  fontSize: "var(--font-size-sm)",
                  fontFamily: "var(--font-mono, monospace)",
                  color: "var(--color-base-content)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                @radix-ui/colors
              </div>
              <div
                style={{
                  padding: "var(--space-2) var(--space-4)",
                  border: "var(--border-width) solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-base-100)",
                  fontSize: "var(--font-size-sm)",
                  fontFamily: "var(--font-mono, monospace)",
                  color: "var(--color-base-content)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                @stitches/react
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Cell>

      <Cell label="file tree (nested collapsibles)">
        <ExplorerFileTree />
      </Cell>

      <Cell label="card disclosure (product details)">
        <div style={{ width: 320 }}>
          <Card>
            <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
              <CollapsibleTrigger
                variant="ghost"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingInline: "var(--space-3)",
                }}
              >
                <span>Product details</span>
                <ChevronDownIcon
                  size={16}
                  style={{
                    transition: "transform var(--duration-fast) var(--ease-standard)",
                    transform: detailsOpen ? "rotate(180deg)" : "rotate(0deg)",
                    color: "var(--color-text-muted)",
                  }}
                />
              </CollapsibleTrigger>
              <CollapsibleContent
                style={{
                  paddingTop: "var(--space-2)",
                  paddingInline: "var(--space-3)",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-muted)",
                  lineHeight: "var(--line-height-relaxed)",
                }}
              >
                An open-source UI component library for building high-quality,
                accessible design systems and web apps.
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </Cell>
    </Row>
  );
}

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
    note: "never color alone",
    render: () => (
      <Block
        id="checkbox"
        title="Checkbox"
        note="never color alone"
        tokens={["--color-primary", "--color-base-100", "--color-border-strong", "--color-focus-ring", "--choice-size"]}
      >
        <Row>
          <Cell label="default">
            <Checkbox label="Include derived colors" defaultChecked />
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
            <Switch label="Derived colors" defaultChecked />
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
          caption="Color roles and their literal values"
          header={["Token", "Layer", "Value"]}
          rows={[
            { key: "action", cells: ["--color-primary", "semantic", "var(--deep-purple)"] },
            { key: "radius", cells: ["--radius-md", "primitive", "4px"] },
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
    note: "expandable disclosure panel (shadcn/ui compatible)",
    render: () => (
      <Block
        id="collapsible"
        title="Collapsible"
        note="expandable disclosure panel (shadcn/ui compatible)"
        tokens={[
          "--color-base-content",
          "--color-base-hover",
          "--color-focus-ring",
          "--radius-sm",
          "--space-2",
        ]}
      >
        <ExplorerCollapsibleSpecimen />
      </Block>
    ),
  },
  {
    id: "cmp-accordion",
    label: "Accordion",
    title: "Accordion",
    note: "vertically stacked interactive disclosure headings (WAI-ARIA compliant)",
    render: () => (
      <Block
        id="accordion"
        title="Accordion"
        note="single and multiple progressive disclosure panels"
        tokens={[
          "--color-base-content",
          "--color-text-muted",
          "--color-border",
          "--color-focus-ring",
          "--font-size-sm",
          "--space-4",
        ]}
      >
        <Column>
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the W3C WAI-ARIA Accordion pattern with keyboard roving navigation.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is it styled with design tokens?</AccordionTrigger>
              <AccordionContent>
                Yes. All typography, borders, chevron animations, and spacing use strict design tokens.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Does it support dark mode?</AccordionTrigger>
              <AccordionContent>
                Yes. All surfaces, borders, and text automatically adapt across light and dark grounds.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
          <Cell label="bookmark icon">
            <Toggle aria-label="Toggle bookmark">
              <BookmarkIcon size={16} />
            </Toggle>
          </Cell>
          <Cell label="bookmark outline">
            <Toggle variant="outline" aria-label="Toggle bookmark" defaultPressed>
              <BookmarkIcon size={16} />
            </Toggle>
          </Cell>
          <Cell label="with text">
            <Toggle aria-label="Toggle italic" defaultPressed>
              <ItalicIcon size={16} /> Italic
            </Toggle>
          </Cell>
          <Cell label="outline">
            <Toggle variant="outline">Filter</Toggle>
          </Cell>
          <Cell label="small">
            <Toggle size="sm" defaultPressed>Active</Toggle>
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
        note="single or multi-selection toolbar group with text formatting and outline styles"
        tokens={[
          "--color-selected-surface",
          "--color-selected-text",
          "--color-primary",
          "--color-base-hover",
          "--radius-sm",
        ]}
      >
        <Column>
          <ToggleGroup variant="outline" type="multi" label="Text formatting" defaultValue={["bold", "italic"]}>
            <ToggleGroupItem value="bold" aria-label="Toggle bold">
              <BoldIcon size={16} />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Toggle italic">
              <ItalicIcon size={16} />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Toggle underline">
              <UnderlineIcon size={16} />
            </ToggleGroupItem>
          </ToggleGroup>
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
          <Cell label="16 / 9 image">
            <div style={{ width: 240 }}>
              <AspectRatio ratio={16 / 9}>
                <img
                  src="https://images.pexels.com/photos/23962080/pexels-photo-23962080.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="River with lake in forest"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "var(--radius-md)",
                  }}
                />
              </AspectRatio>
            </div>
          </Cell>
          <Cell label="4 / 3 image">
            <div style={{ width: 240 }}>
              <AspectRatio ratio={4 / 3}>
                <img
                  src="https://images.pexels.com/photos/23962080/pexels-photo-23962080.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="River with lake in forest"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "var(--radius-md)",
                  }}
                />
              </AspectRatio>
            </div>
          </Cell>
        </Row>
      </Block>
    ),
  },
];
