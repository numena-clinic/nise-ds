import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Badge } from "../src/components/Badge";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { Select } from "../src/components/Select";
import { TextField } from "../src/components/TextField";

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
