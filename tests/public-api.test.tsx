import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

// Verify consumers can compose the source public API without generated output.
import { Button, TextField, Avatar, Toggle, Card, Badge } from "../src/index";

describe("Consumer Contract", () => {
  it("renders components imported through the library entry point", () => {
    render(
      <Card>
        <Badge tone="cyan">Active</Badge>
        <TextField label="Consumer Email" hint="Enter clinic email" />
        <Avatar fallback="DR" />
        <Toggle>Mode</Toggle>
        <Button variant="primary">Submit</Button>
      </Card>,
    );

    expect(screen.getByRole("button", { name: "Submit" })).toHaveClass(
      "nise-button--primary",
    );
    expect(screen.getByLabelText("Consumer Email")).toBeInTheDocument();
    expect(screen.getByText("Enter clinic email")).toBeInTheDocument();
    expect(screen.getByText("DR")).toHaveClass("nise-avatar__fallback");
    expect(screen.getByRole("button", { name: "Mode" })).toHaveClass(
      "nise-toggle",
    );
  });
});
