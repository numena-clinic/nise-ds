import type { Meta, StoryObj } from "@storybook/react-vite";
import { InfoIcon } from "../../icons";
import { Badge } from "./Badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "Client report", tone: "neutral", size: "md" },
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["neutral", "purple", "cyan", "tangerine"],
    },
    size: { control: "inline-radio", options: ["sm", "md"] },
    icon: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A categorical label, not a status. The tone is emphasis only — it never " +
          "means good or bad.",
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};

export const Tones: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
      <Badge {...args} tone="neutral">
        Observation
      </Badge>
      <Badge {...args} tone="purple">
        Client report
      </Badge>
      <Badge {...args} tone="cyan">
        Collateral
      </Badge>
      <Badge {...args} tone="tangerine">
        Assessment
      </Badge>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
      <Badge {...args} size="sm">
        Small
      </Badge>
      <Badge {...args} size="md">
        Medium
      </Badge>
    </div>
  ),
};

export const WithIcon: Story = {
  args: { icon: <InfoIcon size={16} />, children: "Provisional" },
};
