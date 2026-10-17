import type { Meta, StoryObj } from "@storybook/react-vite";
import { Radio } from "./Radio";

const meta = {
  title: "Components/Radio",
  component: Radio,
  tags: ["autodocs"],
  args: { label: "Option A", name: "demo" },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text" },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithHint: Story = {
  args: { hint: "Describes this option" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Group: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--choice-group-gap)" }}>
      <Radio label="First" name="group" defaultChecked />
      <Radio label="Second" name="group" />
      <Radio label="Third" name="group" />
    </div>
  ),
};
