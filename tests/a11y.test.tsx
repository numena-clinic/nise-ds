import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Alert } from "../src/components/Alert";
import { AspectRatio } from "../src/components/AspectRatio";
import { Avatar } from "../src/components/Avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../src/components/Breadcrumb";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../src/components/Collapsible";
import { Empty } from "../src/components/Empty";
import { Kbd } from "../src/components/Kbd";
import { Label } from "../src/components/Label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../src/components/Pagination";
import { Progress } from "../src/components/Progress";
import { Separator } from "../src/components/Separator";
import { Skeleton } from "../src/components/Skeleton";
import { Textarea } from "../src/components/Textarea";
import { Timeline, TimelineItem } from "../src/components/Timeline";
import { Toggle } from "../src/components/Toggle";
import { ToggleGroup, ToggleGroupItem } from "../src/components/ToggleGroup";
import { Badge } from "../src/components/Badge";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { Checkbox } from "../src/components/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../src/components/Dialog";
import { Radio } from "../src/components/Radio";
import { Select } from "../src/components/Select";
import { Slider } from "../src/components/Slider";
import { Switch } from "../src/components/Switch";
import { Table } from "../src/components/Table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../src/components/Tabs";
import { TextField } from "../src/components/TextField";
import {
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "../src/components/Tooltip";
import { InformationReview } from "../src/compositions/InformationReview";
import { axeViolations, describeViolations } from "./axe";

async function expectNoViolations() {
  const violations = await axeViolations(document.body);
  expect(violations, describeViolations(violations)).toEqual([]);
}

describe("accessibility (axe)", () => {
  it("Button", async () => {
    render(<Button>Save draft</Button>);
    await expectNoViolations();
  });

  it("TextField with hint and error", async () => {
    render(<TextField label="Words" hint="Exact phrasing" />);
    await expectNoViolations();
  });

  it("Select (closed)", async () => {
    render(
      <Select
        label="Confidence"
        options={[
          { value: "low", label: "Low" },
          { value: "moderate", label: "Moderate" },
        ]}
      />,
    );
    await expectNoViolations();
  });

  it("Select (open)", async () => {
    render(
      <Select
        label="Confidence"
        options={[
          { value: "low", label: "Low" },
          { value: "moderate", label: "Moderate" },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: /Confidence/ }));
    await screen.findByRole("listbox");
    await expectNoViolations();
  });

  it("Badge and Card", async () => {
    render(
      <Card heading="Session 4" description="Fortnightly review" footer={<Button>Save</Button>}>
        <Badge tone="cyan">Collateral</Badge>
      </Card>,
    );
    await expectNoViolations();
  });

  it("Information review composition", async () => {
    render(<InformationReview />);
    await expectNoViolations();
  });

  it("Checkbox and Radio group", async () => {
    render(
      <>
        <Checkbox label="Include allergies" hint="Shown on the summary" />
        <Radio name="tone" label="Calm" />
        <Radio name="tone" label="Direct" hint="State the plan plainly" />
      </>,
    );
    await expectNoViolations();
  });

  it("Switch", async () => {
    render(<Switch label="Email reminders" hint="Weekly digest" />);
    await expectNoViolations();
  });

  it("Table", async () => {
    render(
      <Table
        caption="Recent sessions"
        header={["Date", "Notes"]}
        rows={[{ key: "1", cells: ["12 May", "Steady"] }]}
      />,
    );
    await expectNoViolations();
  });

  it("Slider", async () => {
    render(<Slider label="Intensity" defaultValue={[50]} min={0} max={100} />);
    await expectNoViolations();
  });

  it("Tabs", async () => {
    render(
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="history">History panel</TabsContent>
      </Tabs>,
    );
    await expectNoViolations();
  });

  it("Dialog (open)", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open settings</DialogTrigger>
        <DialogContent>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Adjust your preferences</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open settings" }));
    await screen.findByRole("dialog", { name: "Settings" });
    await expectNoViolations();
  });

  it("Tooltip (open)", async () => {
    render(
      <TooltipProvider delayDuration={0}>
        <TooltipRoot>
          <TooltipTrigger>More info</TooltipTrigger>
          <TooltipContent>Shown on the summary</TooltipContent>
        </TooltipRoot>
      </TooltipProvider>,
    );
    await userEvent.hover(screen.getByRole("button", { name: "More info" }));
    await screen.findByRole("tooltip");
    await expectNoViolations();
  });

  it("Alert", async () => {
    render(
      <Alert variant="warning" title="Draft unsaved">
        Save the session draft before leaving the page.
      </Alert>,
    );
    await expectNoViolations();
  });

  it("Avatar", async () => {
    render(<Avatar fallback="AM" size="md" />);
    await expectNoViolations();
  });

  it("Avatar with named image", async () => {
    render(<Avatar src="/avatar.png" alt="Amina Mensah" fallback="AM" />);
    await expectNoViolations();
  });

  it("Breadcrumb", async () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Session notes</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    await expectNoViolations();
  });

  it("Kbd", async () => {
    render(<Kbd>Enter</Kbd>);
    await expectNoViolations();
  });

  it("Progress (determinate and indeterminate)", async () => {
    render(
      <>
        <Progress value={68} aria-label="Upload progress" />
        <Progress value={null} aria-label="Exporting session recording" />
      </>,
    );
    await expectNoViolations();
  });

  it("Skeleton", async () => {
    render(<Skeleton />);
    await expectNoViolations();
  });

  it("Separator", async () => {
    render(
      <div style={{ height: "40px", display: "flex" }}>
        <Separator />
        <Separator orientation="vertical" />
      </div>,
    );
    await expectNoViolations();
  });

  it("AspectRatio", async () => {
    render(
      <AspectRatio aria-label="Session scan">
        <p>Scan preview</p>
      </AspectRatio>,
    );
    await expectNoViolations();
  });

  it("Toggle", async () => {
    render(<Toggle>Show same-client history</Toggle>);
    await expectNoViolations();
  });

  it("ToggleGroup single", async () => {
    render(
      <ToggleGroup type="single" label="Session view" defaultValue="summary">
        <ToggleGroupItem value="summary">Summary</ToggleGroupItem>
        <ToggleGroupItem value="objectives">Objectives</ToggleGroupItem>
      </ToggleGroup>,
    );
    await expectNoViolations();
  });

  it("ToggleGroup multi", async () => {
    render(
      <ToggleGroup type="multi" label="Session filters">
        <ToggleGroupItem value="intake">Intake</ToggleGroupItem>
        <ToggleGroupItem value="follow-up">Follow-up</ToggleGroupItem>
      </ToggleGroup>,
    );
    await expectNoViolations();
  });

  it("Textarea with hint", async () => {
    render(<Textarea label="Session notes" hint="Record what was said and done." />);
    await expectNoViolations();
  });

  it("Label associated with an input", async () => {
    render(
      <>
        <Label htmlFor="session-note">Session note</Label>
        <input id="session-note" />
      </>,
    );
    await expectNoViolations();
  });

  it("Pagination", async () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#prev" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#p2" isActive={true}>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#next" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    await expectNoViolations();
  });

  it("Empty", async () => {
    render(
      <Empty
        title="No sessions yet"
        description="Sessions recorded in the chart will appear here."
      />,
    );
    await expectNoViolations();
  });

  it("Timeline", async () => {
    render(
      <Timeline aria-label="Session history">
        <TimelineItem title="Session note saved" meta="10:24" variant="done" />
        <TimelineItem title="Assessment scheduled" meta="14:00" />
      </Timeline>,
    );
    await expectNoViolations();
  });

  it("Collapsible", async () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Advanced export options</CollapsibleTrigger>
        <CollapsibleContent>Includes the anonymised sequence check.</CollapsibleContent>
      </Collapsible>,
    );
    await expectNoViolations();
  });
});
