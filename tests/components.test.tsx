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
  it("opens via its summary and reveals the content", async () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Advanced export options</CollapsibleTrigger>
        <CollapsibleContent>Includes the anonymised sequence check.</CollapsibleContent>
      </Collapsible>,
    );
    const summary = screen.getByText("Advanced export options");
    const details = summary.closest("details") as HTMLDetailsElement;
    expect(details.hasAttribute("open")).toBe(false);
    await userEvent.click(summary);
    expect(details).toHaveAttribute("open");
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
});

