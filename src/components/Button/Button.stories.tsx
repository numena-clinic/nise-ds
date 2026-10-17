import type { Meta, StoryObj } from "@storybook/react-vite";
import { PlusIcon } from "../../icons";
import { Button } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Save draft",
    variant: "primary",
    size: "md",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    leftIcon: { control: false },
    rightIcon: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The one affirmative action in a view is `primary`. Use `secondary` for an " +
          "alternative and `ghost` for an in-place action. Never place two `primary` " +
          "buttons in the same view.",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Ghost: Story = {
  args: { variant: "ghost" },
};

export const WithIcon: Story = {
  args: { leftIcon: <PlusIcon size={20} />, children: "Add note" },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: { loading: true },
};

export const FullWidth: Story = {
  args: { fullWidth: true },
  parameters: { layout: "padded" },
};
