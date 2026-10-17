import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { TextField } from "../TextField";
import { Card } from "./Card";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  args: {
    heading: "Session 4 · 12 May",
    description: "Fortnightly review. Client reported improved sleep.",
  },
  argTypes: {
    headingLevel: { control: "inline-radio", options: [2, 3, 4, 5, 6] },
    actions: { control: false },
    footer: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "var(--measure-form)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: <p>Body content sits here.</p> },
};

export const WithActions: Story = {
  args: {
    actions: <Badge tone="cyan">Collateral</Badge>,
    children: <p>Body content with a header action.</p>,
  },
};

export const WithFooter: Story = {
  args: {
    children: <TextField label="Presenting concern" placeholder="…" />,
    footer: (
      <>
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Save draft</Button>
      </>
    ),
  },
};
