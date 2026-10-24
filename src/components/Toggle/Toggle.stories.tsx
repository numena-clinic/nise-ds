import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toggle } from "./Toggle";

const meta = {
  title: "Components/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  args: {
    children: "Show notes",
    size: "md",
    defaultPressed: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A two-state pressed button for toolbar modes and filters. The pressed state is " +
          "a selection — the validated selected pair, tile and text — never a status.",
      },
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pressed: Story = {
  args: { defaultPressed: true },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
      <Toggle {...args} size="sm">
        Small
      </Toggle>
      <Toggle {...args} size="md">
        Medium
      </Toggle>
      <Toggle {...args} size="lg">
        Large
      </Toggle>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, defaultPressed: true },
};
