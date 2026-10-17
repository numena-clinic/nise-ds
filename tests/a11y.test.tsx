import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Badge } from "../src/components/Badge";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { Select } from "../src/components/Select";
import { TextField } from "../src/components/TextField";
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
});
