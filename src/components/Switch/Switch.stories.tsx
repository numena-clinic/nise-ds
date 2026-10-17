import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "./Switch";

const meta = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  args: { label: "Auto-save draft" },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithHint: Story = {
  args: { hint: "Saves every 30 seconds" },
};

export const Disabled: Story = {
  args: { disabled: true },
};
