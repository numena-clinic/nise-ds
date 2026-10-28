import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../src/components/Accordion";
import { Alert } from "../src/components/Alert";
import { AspectRatio } from "../src/components/AspectRatio";
import { Avatar } from "../src/components/Avatar";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
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
    const trigger = screen.getByRole("button", { name: /Confidence/ });
    await userEvent.click(trigger);
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("reports the chosen value", async () => {
    const onValueChange = vi.fn();
    render(<Select label="Confidence" options={options} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("button", { name: /Confidence/ }));
    await userEvent.click(await screen.findByRole("option", { name: "Moderate" }));
    expect(onValueChange).toHaveBeenCalledWith("moderate");
  });

  it("surfaces an error through aria-describedby", async () => {
    render(<Select label="Confidence" options={options} error="Choose a level" />);
    const trigger = screen.getByRole("button", { name: /Confidence/ });
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
    expect(thumb).toHaveValue("50");
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(thumb).toHaveValue("51"));
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
  it("reveals supplemental text on keyboard focus", async () => {
    render(
      <TooltipProvider delayDuration={0}>
        <TooltipRoot>
          <TooltipTrigger>More info</TooltipTrigger>
          <TooltipContent>Shown on the summary</TooltipContent>
        </TooltipRoot>
      </TooltipProvider>,
    );
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "More info" })).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Shown on the summary");
  });
});

describe("Alert", () => {
  it("renders its title and description inside role=alert", () => {
    render(
      <Alert variant="warning" title="Draft unsaved">
        Save the session draft before leaving the page.
      </Alert>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Draft unsaved");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Save the session draft before leaving the page.",
    );
  });

  it("carries one class per variant", () => {
    const { rerender } = render(<Alert variant="error" title="Could not save" />);
    expect(screen.getByRole("alert")).toHaveClass("nise-alert--error");
    rerender(<Alert variant="neutral" title="Draft ready" />);
    expect(screen.getByRole("alert")).toHaveClass("nise-alert--neutral");
  });
});

describe("Avatar", () => {
  it("falls back to initials when the image fails to load", async () => {
    const { container } = render(<Avatar src="/bad.png" fallback="AM" />);
    fireEvent.error(container.querySelector("img") as HTMLImageElement);
    expect(await screen.findByText("AM")).toBeInTheDocument();
  });

  it("renders the initials fallback when no src is given", () => {
    render(<Avatar fallback="SR" />);
    expect(screen.getByText("SR")).toBeInTheDocument();
    expect(document.querySelector("img")).not.toBeInTheDocument();
  });

  it("treats the image as presentational by default", () => {
    render(<Avatar src="/avatar.png" fallback="AM" />);
    expect(document.querySelector("img")).toHaveAttribute("alt", "");
  });
});

describe("Breadcrumb", () => {
  it("renders a labelled navigation trail with a current page", () => {
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
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clients" })).toHaveAttribute("href", "/clients");
    expect(screen.getByText("Session notes")).toHaveAttribute("aria-current", "page");
  });

  it("hides the separator from the accessibility tree", () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Schedule</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </BreadcrumbList>
      </Breadcrumb>,
    );
    expect(container.querySelector(".nise-breadcrumb__separator")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("renders the ellipsis mark", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    expect(screen.getByText("…")).toBeInTheDocument();
  });
});

describe("Kbd", () => {
  it("renders a kbd element carrying its text", () => {
    render(<Kbd>Enter</Kbd>);
    const kbd = screen.getByText("Enter");
    expect(kbd.tagName).toBe("KBD");
  });
});

describe("Progress", () => {
  it("exposes a named determinate meter with aria value attributes", () => {
    render(<Progress value={68} max={100} aria-label="Upload progress" />);
    const meter = screen.getByRole("progressbar", { name: "Upload progress" });
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(meter).toHaveAttribute("aria-valuenow", "68");
    expect(meter).toHaveAttribute("data-state", "determinate");
  });

  it("drops aria-valuenow and switches to indeterminate when value is null", () => {
    render(<Progress value={null} aria-label="Exporting session recording" />);
    const meter = screen.getByRole("progressbar", { name: "Exporting session recording" });
    expect(meter).not.toHaveAttribute("aria-valuenow");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(meter).toHaveAttribute("data-state", "indeterminate");
  });

  it("paints the fill to the value's share", () => {
    const { container } = render(<Progress value={50} aria-label="Upload progress" />);
    const fill = container.querySelector(".nise-progress__fill") as HTMLElement;
    expect(fill.style.width).toBe("50%");
  });
});

describe("Skeleton", () => {
  it("is a purely decorative placeholder", () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("Separator", () => {
  it("is horizontal by default and moves orientation into the tree", () => {
    render(
      <div style={{ height: "40px", display: "flex" }}>
        <Separator />
        <Separator orientation="vertical" />
      </div>,
    );
    expect(screen.getAllByRole("separator")[0]).toHaveAttribute(
      "aria-orientation",
      "horizontal",
    );
    expect(screen.getAllByRole("separator")[1]).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });
});

describe("AspectRatio", () => {
  it("reserves the ratio inline, defaulting to 16/9", () => {
    const { container } = render(
      <AspectRatio aria-label="Session scan">
        <p>Scan preview</p>
      </AspectRatio>,
    );
    const frame = container.firstElementChild as HTMLElement;
    const [w, h] = frame.style.aspectRatio.split("/").map((n) => Number(n.trim()));
    expect(Number(w) / Number(h)).toBe(16 / 9);
    expect(frame).toHaveTextContent("Scan preview");
  });

  it("accepts the ratio the caller hands it", () => {
    const { container } = render(
      <AspectRatio ratio={1}>
        <p>One by one</p>
      </AspectRatio>,
    );
    const [w, h] = (container.firstElementChild as HTMLElement).style.aspectRatio
      .split("/")
      .map((n) => Number(n.trim()));
    expect(Number(w) / Number(h)).toBe(1);
  });
});

describe("Toggle", () => {
  it("toggles aria-pressed and fires onPressedChange", async () => {
    const onPressedChange = vi.fn();
    render(<Toggle onPressedChange={onPressedChange}>Show same-client history</Toggle>);
    const toggle = screen.getByRole("button", { name: "Show same-client history" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(onPressedChange).toHaveBeenCalledWith(true);
    await userEvent.click(toggle);
    expect(onPressedChange).toHaveBeenLastCalledWith(false);
  });

  it("honours a controlled pressed state", async () => {
    render(<Toggle pressed>Detail view</Toggle>);
    expect(screen.getByRole("button", { name: "Detail view" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("applies outline variant class", () => {
    render(<Toggle variant="outline">Bookmark</Toggle>);
    expect(screen.getByRole("button", { name: "Bookmark" })).toHaveClass(
      "nise-toggle--outline",
    );
  });
});

describe("ToggleGroup", () => {
  it("presses exactly one item in single mode and reports the value", async () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup
        type="single"
        label="Session view"
        defaultValue="summary"
        onValueChange={onValueChange}
      >
        <ToggleGroupItem value="summary">Summary</ToggleGroupItem>
        <ToggleGroupItem value="objectives">Objectives</ToggleGroupItem>
      </ToggleGroup>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Objectives" }));
    expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Objectives" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(onValueChange).toHaveBeenCalledWith("objectives");
  });

  it("keeps a set of pressed items in multi mode", async () => {
    render(
      <ToggleGroup type="multi" label="Session filters">
        <ToggleGroupItem value="intake">Intake</ToggleGroupItem>
        <ToggleGroupItem value="follow-up">Follow-up</ToggleGroupItem>
      </ToggleGroup>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Intake" }));
    await userEvent.click(screen.getByRole("button", { name: "Follow-up" }));
    expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(2);
  });

  it("supports type='multiple' alias and propagates outline variant", async () => {
    render(
      <ToggleGroup type="multiple" variant="outline" label="Formatting">
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroup>,
    );
    const boldBtn = screen.getByRole("button", { name: "Bold" });
    expect(boldBtn).toHaveClass("nise-toggle-group__item--outline");
    await userEvent.click(boldBtn);
    expect(boldBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("does not toggle disabled items", async () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup label="Filters" onValueChange={onValueChange}>
        <ToggleGroupItem value="active">Active</ToggleGroupItem>
        <ToggleGroupItem value="locked" disabled>Locked</ToggleGroupItem>
      </ToggleGroup>,
    );
    const lockedBtn = screen.getByRole("button", { name: "Locked" });
    expect(lockedBtn).toBeDisabled();
    await userEvent.click(lockedBtn);
    expect(lockedBtn).toHaveAttribute("aria-pressed", "false");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("honours controlled value in single mode", async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <ToggleGroup label="View" value="summary" onValueChange={onValueChange}>
        <ToggleGroupItem value="summary">Summary</ToggleGroupItem>
        <ToggleGroupItem value="details">Details</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole("button", { name: "Summary" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Details" })).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(onValueChange).toHaveBeenCalledWith("details");

    rerender(
      <ToggleGroup label="View" value="details" onValueChange={onValueChange}>
        <ToggleGroupItem value="summary">Summary</ToggleGroupItem>
        <ToggleGroupItem value="details">Details</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole("button", { name: "Details" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Summary" })).toHaveAttribute("aria-pressed", "false");
  });
});

describe("Textarea", () => {
  it("associates its label and describes the control with the hint", () => {
    render(
      <Textarea
        label="Session notes"
        hint="Record what was said and done, not an interpretation."
      />,
    );
    const textarea = screen.getByLabelText("Session notes");
    expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
    expect(textarea).toHaveAccessibleDescription(
      "Record what was said and done, not an interpretation.",
    );
  });
});

describe("Label", () => {
  it("associates with its target through htmlFor", () => {
    render(
      <>
        <Label htmlFor="session-note">Session note</Label>
        <input id="session-note" />
      </>,
    );
    expect(screen.getByLabelText("Session note")).toBeInstanceOf(HTMLInputElement);
  });
});

describe("Pagination", () => {
  it("gives Previous and Next accessible names", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#prev" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#next" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute("href", "#prev");
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "#next");
  });

  it("marks the active page with aria-current", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#p2">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#p3" isActive={true}>
              3
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByRole("link", { name: "3" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "2" })).not.toHaveAttribute("aria-current");
  });
});

describe("Empty", () => {
  it("renders its title and description", () => {
    render(
      <Empty
        title="No sessions yet"
        description="Sessions recorded in the chart will appear here."
      />,
    );
    expect(screen.getByText("No sessions yet")).toBeInTheDocument();
    expect(screen.getByText("Sessions recorded in the chart will appear here.")).toBeInTheDocument();
  });
});

describe("Timeline", () => {
  it("renders items with titles, meta and state modifiers", () => {
    render(
      <Timeline aria-label="Session history">
        <TimelineItem title="Session note saved" meta="10:24" variant="done" />
        <TimelineItem title="Assessment scheduled" meta="14:00" />
      </Timeline>,
    );
    expect(screen.getByRole("list", { name: "Session history" })).toBeInTheDocument();
    expect(screen.getByText("Session note saved").closest("li")).toHaveClass(
      "nise-timeline__item--done",
    );
    expect(screen.getByText("Assessment scheduled").closest("li")).toHaveClass(
      "nise-timeline__item--upcoming",
    );
  });
});

describe("Collapsible", () => {
  it("opens and closes via mouse click and keyboard Space/Enter", async () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Advanced export options</CollapsibleTrigger>
        <CollapsibleContent>Includes the anonymised sequence check.</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole("button", { name: /Advanced export options/i });
    const content = screen.getByText("Includes the anonymised sequence check.");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(content).not.toBeVisible();

    // Mouse click opens
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(content).toBeVisible();

    // Space key closes
    trigger.focus();
    await userEvent.keyboard(" ");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(content).not.toBeVisible();

    // Enter key opens
    await userEvent.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(content).toBeVisible();
  });

  it("supports controlled state via open and onOpenChange", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Collapsible open={false} onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Controlled trigger</CollapsibleTrigger>
        <CollapsibleContent>Controlled content</CollapsibleContent>
      </Collapsible>,
    );

    const trigger = screen.getByRole("button", { name: /Controlled trigger/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    rerender(
      <Collapsible open={true} onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Controlled trigger</CollapsibleTrigger>
        <CollapsibleContent>Controlled content</CollapsibleContent>
      </Collapsible>,
    );
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Controlled content")).toBeVisible();
  });

  it("supports uncontrolled state via defaultOpen", async () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Uncontrolled trigger</CollapsibleTrigger>
        <CollapsibleContent>Uncontrolled content</CollapsibleContent>
      </Collapsible>,
    );

    const trigger = screen.getByRole("button", { name: /Uncontrolled trigger/i });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Uncontrolled content")).toBeVisible();
  });

  it("does not toggle when disabled", async () => {
    const onOpenChange = vi.fn();
    render(
      <Collapsible disabled onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Disabled trigger</CollapsibleTrigger>
        <CollapsibleContent>Disabled content</CollapsibleContent>
      </Collapsible>,
    );

    const trigger = screen.getByRole("button", { name: /Disabled trigger/i });
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByText("Disabled content")).not.toBeVisible();
  });

  it("supports custom styling and variant/size props on CollapsibleTrigger", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger variant="ghost" size="sm" className="custom-tree-item">
          Styled Trigger
        </CollapsibleTrigger>
        <CollapsibleContent>Panel Body</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole("button", { name: "Styled Trigger" });
    expect(trigger).toHaveClass("nise-button");
    expect(trigger).toHaveClass("nise-button--ghost");
    expect(trigger).toHaveClass("nise-button--sm");
    expect(trigger).toHaveClass("custom-tree-item");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps closed content strictly hidden even with inline display styles", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Display flex trigger</CollapsibleTrigger>
        <CollapsibleContent style={{ display: "flex", flexDirection: "column" }}>
          <span>Flex item 1</span>
          <span>Flex item 2</span>
        </CollapsibleContent>
      </Collapsible>,
    );

    const content = screen.getByText("Flex item 1");
    expect(content).not.toBeVisible();
  });

  it("supports nested collapsibles without cross-contamination", async () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Parent</CollapsibleTrigger>
        <CollapsibleContent>
          <div>Parent Content</div>
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger>Child</CollapsibleTrigger>
            <CollapsibleContent>Child Content</CollapsibleContent>
          </Collapsible>
        </CollapsibleContent>
      </Collapsible>,
    );

    const parentTrigger = screen.getByRole("button", { name: "Parent" });
    const childTrigger = screen.getByRole("button", { name: "Child" });
    const parentContent = screen.getByText("Parent Content");
    const childContent = screen.getByText("Child Content");

    expect(parentTrigger).toHaveAttribute("aria-expanded", "true");
    expect(parentContent).toBeVisible();
    expect(childTrigger).toHaveAttribute("aria-expanded", "false");
    expect(childContent).not.toBeVisible();

    await userEvent.click(childTrigger);
    expect(childTrigger).toHaveAttribute("aria-expanded", "true");
    expect(childContent).toBeVisible();
    expect(parentTrigger).toHaveAttribute("aria-expanded", "true");
  });

  it("establishes accessible names and aria-controls / aria-labelledby relationships", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Section header</CollapsibleTrigger>
        <CollapsibleContent>Section body</CollapsibleContent>
      </Collapsible>,
    );

    const trigger = screen.getByRole("button", { name: "Section header" });
    const region = screen.getByRole("region");

    const controlsId = trigger.getAttribute("aria-controls");
    const labelledById = region.getAttribute("aria-labelledby");
    const triggerId = trigger.getAttribute("id");
    const regionId = region.getAttribute("id");

    expect(controlsId).toBeTruthy();
    expect(controlsId).toBe(regionId);
    expect(labelledById).toBeTruthy();
    expect(labelledById).toBe(triggerId);
  });
});

describe("Accordion", () => {
  it("expands and collapses in single mode with collapsible", async () => {
    const onValueChange = vi.fn();
    render(
      <Accordion type="single" collapsible defaultValue="item-1" onValueChange={onValueChange}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger1 = screen.getByRole("button", { name: "Section 1" });
    const trigger2 = screen.getByRole("button", { name: "Section 2" });

    expect(trigger1).toHaveAttribute("aria-expanded", "true");
    expect(trigger2).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger2);
    expect(trigger1).toHaveAttribute("aria-expanded", "false");
    expect(trigger2).toHaveAttribute("aria-expanded", "true");
    expect(onValueChange).toHaveBeenCalledWith("item-2");

    await userEvent.click(trigger2);
    expect(trigger2).toHaveAttribute("aria-expanded", "false");
    expect(onValueChange).toHaveBeenCalledWith("");
  });

  it("supports multiple sections open simultaneously", async () => {
    render(
      <Accordion type="multiple" defaultValue={["item-1"]}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger1 = screen.getByRole("button", { name: "Section 1" });
    const trigger2 = screen.getByRole("button", { name: "Section 2" });

    await userEvent.click(trigger2);
    expect(trigger1).toHaveAttribute("aria-expanded", "true");
    expect(trigger2).toHaveAttribute("aria-expanded", "true");
  });

  it("navigates triggers with keyboard arrow keys", async () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger>First</AccordionTrigger>
          <AccordionContent>First Content</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Second</AccordionTrigger>
          <AccordionContent>Second Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const first = screen.getByRole("button", { name: "First" });
    const second = screen.getByRole("button", { name: "Second" });

    first.focus();
    expect(document.activeElement).toBe(first);

    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(second);

    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(first);
  });

  it("does not toggle a disabled accordion item", async () => {
    const onValueChange = vi.fn();
    render(
      <Accordion type="single" onValueChange={onValueChange}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Active</AccordionTrigger>
          <AccordionContent>Active Content</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" disabled>
          <AccordionTrigger>Locked</AccordionTrigger>
          <AccordionContent>Locked Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const lockedTrigger = screen.getByRole("button", { name: "Locked" });
    expect(lockedTrigger).toBeDisabled();
    await userEvent.click(lockedTrigger);
    expect(lockedTrigger).toHaveAttribute("aria-expanded", "false");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("supports controlled expanded state via value and onValueChange", async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Accordion type="single" value="item-1" onValueChange={onValueChange}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger1 = screen.getByRole("button", { name: "Section 1" });
    const trigger2 = screen.getByRole("button", { name: "Section 2" });

    expect(trigger1).toHaveAttribute("aria-expanded", "true");
    expect(trigger2).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger2);
    expect(onValueChange).toHaveBeenCalledWith("item-2");

    rerender(
      <Accordion type="single" value="item-2" onValueChange={onValueChange}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(trigger1).toHaveAttribute("aria-expanded", "false");
    expect(trigger2).toHaveAttribute("aria-expanded", "true");
  });

  it("establishes accessible aria-controls and aria-labelledby relationships", () => {
    render(
      <Accordion defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Accessible Header</AccordionTrigger>
          <AccordionContent>Accessible Body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByRole("button", { name: "Accessible Header" });
    const region = screen.getByRole("region");

    const controlsId = trigger.getAttribute("aria-controls");
    const labelledById = region.getAttribute("aria-labelledby");
    const triggerId = trigger.getAttribute("id");
    const regionId = region.getAttribute("id");

    expect(controlsId).toBeTruthy();
    expect(controlsId).toBe(regionId);
    expect(labelledById).toBeTruthy();
    expect(labelledById).toBe(triggerId);
  });
});

describe("Hardening & Accessibility Regressions", () => {
  describe("Description merging and invalid state precedence", () => {
    it("TextField merges caller-provided aria-describedby and respects error precedence", () => {
      const { rerender } = render(
        <TextField
          label="Email"
          hint="Helper hint"
          aria-describedby="external-help-id"
          aria-invalid="grammar"
        />,
      );
      const input = screen.getByRole("textbox", { name: "Email" });
      const describedBy = input.getAttribute("aria-describedby") || "";
      expect(describedBy).toContain("external-help-id");
      expect(describedBy).toMatch(/-hint/);
      expect(input.getAttribute("aria-invalid")).toBe("grammar");

      rerender(
        <TextField
          label="Email"
          error="Invalid email"
          aria-describedby="external-help-id"
          aria-invalid="grammar"
        />,
      );
      const updatedInput = screen.getByRole("textbox", { name: "Email" });
      const updatedDescribedBy = updatedInput.getAttribute("aria-describedby") || "";
      expect(updatedDescribedBy).toContain("external-help-id");
      expect(updatedDescribedBy).toMatch(/-error/);
      expect(updatedInput.getAttribute("aria-invalid")).toBe("true");
    });

    it("Textarea merges caller-provided aria-describedby and preserves caller aria-invalid", () => {
      render(
        <Textarea
          label="Notes"
          hint="Formatting tips"
          aria-describedby="external-docs"
          aria-invalid={true}
        />,
      );
      const textarea = screen.getByRole("textbox", { name: "Notes" });
      const desc = textarea.getAttribute("aria-describedby") || "";
      expect(desc).toContain("external-docs");
      expect(desc).toMatch(/-hint/);
      expect(textarea.getAttribute("aria-invalid")).toBe("true");
    });

    it("Checkbox merges caller-provided aria-describedby with hint", () => {
      const { container } = render(
        <Checkbox
          label="Agree"
          hint="Terms of service"
          aria-describedby="legal-footer"
        />,
      );
      const checkbox = container.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
      const desc = checkbox.getAttribute("aria-describedby") || "";
      expect(desc).toContain("legal-footer");
      expect(desc).toMatch(/-hint/);
    });

    it("Radio merges caller-provided aria-describedby with hint", () => {
      const { container } = render(
        <Radio
          label="Option A"
          hint="Default option"
          aria-describedby="field-summary"
        />,
      );
      const radio = container.querySelector<HTMLInputElement>('input[type="radio"]')!;
      const desc = radio.getAttribute("aria-describedby") || "";
      expect(desc).toContain("field-summary");
      expect(desc).toMatch(/-hint/);
    });

    it("Switch merges caller-provided aria-describedby with hint", () => {
      const { container } = render(
        <Switch
          label="Telemetry"
          hint="Send anonymous reports"
          aria-describedby="privacy-link"
        />,
      );
      const sw = container.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
      const desc = sw.getAttribute("aria-describedby") || "";
      expect(desc).toContain("privacy-link");
      expect(desc).toMatch(/-hint/);
    });

    it("Slider attaches aria-describedby to the focusable thumb element", () => {
      render(
        <Slider
          label="Volume"
          hint="Adjust output level"
          aria-describedby="external-audio-info"
          defaultValue={[50]}
        />,
      );
      const thumb = screen.getByRole("slider");
      const desc = thumb.getAttribute("aria-describedby") || "";
      expect(desc).toContain("external-audio-info");
      expect(desc).toMatch(/-hint/);
    });
  });

  describe("Accordion keyboard navigation scoping", () => {
    it("restricts arrow key navigation to triggers owned by the current accordion", async () => {
      render(
        <Accordion type="single" defaultValue="outer-1">
          <AccordionItem value="outer-1">
            <AccordionTrigger>Outer Header 1</AccordionTrigger>
            <AccordionContent>
              <Accordion type="single" defaultValue="inner-1">
                <AccordionItem value="inner-1">
                  <AccordionTrigger>Inner Header 1</AccordionTrigger>
                  <AccordionContent>Inner Content</AccordionContent>
                </AccordionItem>
              </Accordion>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="outer-2">
            <AccordionTrigger>Outer Header 2</AccordionTrigger>
            <AccordionContent>Outer Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const outerTrigger1 = screen.getByRole("button", { name: "Outer Header 1" });
      const outerTrigger2 = screen.getByRole("button", { name: "Outer Header 2" });

      outerTrigger1.focus();
      expect(document.activeElement).toBe(outerTrigger1);

      fireEvent.keyDown(outerTrigger1, { key: "ArrowDown" });
      // Should move directly to outerTrigger2, skipping the nested accordion's trigger
      expect(document.activeElement).toBe(outerTrigger2);
    });
  });

  describe("Small component defects", () => {
    it("Avatar resets error state when src prop changes", () => {
      const { rerender, container } = render(<Avatar alt="Photo" src="broken.png" fallback="FB" />);
      const img = container.querySelector("img")!;
      fireEvent.error(img);

      // Now fallback is displayed
      expect(screen.getByText("FB")).toBeInTheDocument();

      // Parent changes src to a valid image
      rerender(<Avatar alt="Photo" src="valid.png" fallback="FB" />);
      const newImg = container.querySelector("img");
      expect(newImg).not.toBeNull();
      expect(newImg).toHaveAttribute("src", "valid.png");
    });

    it("Toggle with non-icon React element child preserves text-button geometry", () => {
      const { container } = render(
        <Toggle>
          <span>Detailed view</span>
        </Toggle>,
      );
      const button = container.querySelector("button");
      expect(button).not.toHaveClass("nise-toggle--icon");
    });

    it("ToggleGroupItem with non-icon React element child preserves text-button geometry", () => {
      const { container } = render(
        <ToggleGroup label="View options">
          <ToggleGroupItem value="detail">
            <span>Detailed view</span>
          </ToggleGroupItem>
        </ToggleGroup>,
      );
      const button = container.querySelector("button");
      expect(button).not.toHaveClass("nise-toggle-group__item--icon");
    });
  });
});


