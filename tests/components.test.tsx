import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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

describe("Button", () => {
  it("renders its label and fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save draft</Button>);
    const button = screen.getByRole("button", { name: "Save draft" });
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire when disabled", async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Save draft</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("is inert and busy while loading, keeping its accessible name", () => {
    render(<Button loading>Save draft</Button>);
    const button = screen.getByRole("button", { name: "Save draft" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});

describe("TextField", () => {
  it("associates its label with the input", () => {
    render(<TextField label="Presenting concern" />);
    expect(screen.getByLabelText("Presenting concern")).toBeInstanceOf(HTMLInputElement);
  });

  it("describes the input with the hint", () => {
    render(<TextField label="Words" hint="Use exact phrasing" />);
    const input = screen.getByLabelText("Words");
    expect(input).toHaveAccessibleDescription("Use exact phrasing");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("replaces the hint with the error and marks the field invalid", () => {
    render(<TextField label="Words" hint="Use exact phrasing" error="Add a sentence" />);
    const input = screen.getByLabelText("Words");
    expect(screen.queryByText("Use exact phrasing")).not.toBeInTheDocument();
    expect(input).toHaveAccessibleDescription("Add a sentence");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});

describe("Select", () => {
  const options = [
    { value: "low", label: "Low" },
    { value: "moderate", label: "Moderate" },
    { value: "high", label: "High" },
  ];

  it("associates its label and opens the listbox", async () => {
    render(<Select label="Confidence" options={options} />);
    const trigger = screen.getByRole("combobox", { name: /Confidence/ });
    await userEvent.click(trigger);
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("reports the chosen value", async () => {
    const onValueChange = vi.fn();
    render(<Select label="Confidence" options={options} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("combobox", { name: /Confidence/ }));
    await userEvent.click(await screen.findByRole("option", { name: "Moderate" }));
    expect(onValueChange).toHaveBeenCalledWith("moderate");
  });

  it("surfaces an error through aria-describedby", async () => {
    render(<Select label="Confidence" options={options} error="Choose a level" />);
    const trigger = screen.getByRole("combobox", { name: /Confidence/ });
    await waitFor(() => {
      expect(trigger).toHaveAccessibleDescription("Choose a level");
    });
  });
});

describe("Badge", () => {
  it("renders its content", () => {
    render(<Badge tone="cyan">Collateral</Badge>);
    expect(screen.getByText("Collateral")).toBeInTheDocument();
  });
});

describe("Card", () => {
  it("renders heading, description, body and footer", () => {
    render(
      <Card heading="Session 4" description="Fortnightly review" footer={<Button>Save</Button>}>
        <p>Body</p>
      </Card>,
    );
    expect(screen.getByRole("heading", { name: "Session 4" })).toBeInTheDocument();
    expect(screen.getByText("Fortnightly review")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});

describe("Checkbox", () => {
  it("is a labelled native checkbox that toggles on click", async () => {
    render(<Checkbox label="Include allergies" />);
    const box = screen.getByRole("checkbox", { name: "Include allergies" });
    expect(box).not.toBeChecked();
    await userEvent.click(box);
    expect(box).toBeChecked();
  });

  it("does not toggle when disabled", async () => {
    render(<Checkbox label="Include allergies" disabled />);
    const box = screen.getByRole("checkbox");
    await userEvent.click(box);
    expect(box).not.toBeChecked();
  });

  it("exposes indeterminate as a DOM property, not a third value", () => {
    render(<Checkbox label="Select all" indeterminate />);
    const box = screen.getByRole<HTMLInputElement>("checkbox");
    expect(box.indeterminate).toBe(true);
    expect(box).not.toBeChecked();
  });

  it("describes itself with its hint", () => {
    render(<Checkbox label="Include allergies" hint="Shown on the summary" />);
    expect(screen.getByRole("checkbox")).toHaveAccessibleDescription("Shown on the summary");
  });
});

describe("Switch", () => {
  it("is a labelled toggle that turns on", async () => {
    render(<Switch label="Email reminders" />);
    const sw = screen.getByRole("checkbox", { name: "Email reminders" });
    expect(sw).not.toBeChecked();
    await userEvent.click(sw);
    expect(sw).toBeChecked();
  });

  it("describes itself with its hint", () => {
    render(<Switch label="Email reminders" hint="Weekly digest" />);
    expect(screen.getByRole("checkbox")).toHaveAccessibleDescription("Weekly digest");
  });
});

describe("Radio", () => {
  it("selects one option in a named group", async () => {
    render(
      <>
        <Radio name="tone" label="Calm" />
        <Radio name="tone" label="Direct" />
      </>,
    );
    const calm = screen.getByRole("radio", { name: "Calm" });
    const direct = screen.getByRole("radio", { name: "Direct" });
    await userEvent.click(direct);
    expect(direct).toBeChecked();
    expect(calm).not.toBeChecked();
  });
});

describe("Table", () => {
  it("renders a caption, column headers and rows", () => {
    render(
      <Table
        caption="Recent sessions"
        header={["Date", "Notes"]}
        rows={[
          { key: "1", cells: ["12 May", "Steady"] },
          { key: "2", cells: ["26 May", 3] },
        ]}
      />,
    );
    expect(screen.getByRole("table", { name: "Recent sessions" })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByRole("cell", { name: "12 May" })).toBeInTheDocument();
  });
});

describe("Slider", () => {
  it("is a labelled slider that steps with the arrow keys", async () => {
    render(<Slider label="Intensity" defaultValue={[50]} min={0} max={100} step={1} />);
    const thumb = screen.getByRole("slider", { name: "Intensity" });
    expect(thumb).toHaveAttribute("aria-valuenow", "50");
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(thumb).toHaveAttribute("aria-valuenow", "51"));
  });
});

describe("Tabs", () => {
  it("shows the active panel and switches on click", async () => {
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
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Overview panel")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "History" }));
    expect(await screen.findByText("History panel")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "History" })).toHaveAttribute("aria-selected", "true");
  });
});

describe("Dialog", () => {
  it("opens with an accessible name and closes on Escape", async () => {
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
    const dialog = await screen.findByRole("dialog", { name: "Settings" });
    expect(dialog).toHaveAccessibleDescription("Adjust your preferences");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});

describe("Tooltip", () => {
  it("reveals supplemental text on hover", async () => {
    render(
      <TooltipProvider delayDuration={0}>
        <TooltipRoot>
          <TooltipTrigger>More info</TooltipTrigger>
          <TooltipContent>Shown on the summary</TooltipContent>
        </TooltipRoot>
      </TooltipProvider>,
    );
    await userEvent.hover(screen.getByRole("button", { name: "More info" }));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Shown on the summary");
  });
});
