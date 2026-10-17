import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: { label: "Store clinician notes" },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text" },
    indeterminate: { control: "boolean" },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithHint: Story = {
  args: { hint: "Visible to the care team only" },
};

export const Indeterminate: Story = {
  args: { indeterminate: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
