import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./Label";

const meta = {
  title: "Components/Label",
  component: Label,
  tags: ["autodocs"],
  args: {
    children: "Session length",
  },
  argTypes: {
    hint: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The standalone form label. It associates through `htmlFor` — no hint/error " +
          "describedby wiring lives here.",
      },
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
  args: { htmlFor: "session-length", required: true },
};

export const WithHint: Story = {
  args: { hint: "Use weeks between meetings" },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <Label {...args} size="sm">
        Small
      </Label>
      <Label {...args} size="md">
        Medium
      </Label>
    </div>
  ),
};
