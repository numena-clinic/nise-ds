import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

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
});
