import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./Separator";

const meta = {
  title: "Components/Separator",
  component: Separator,
  tags: ["autodocs"],
  args: { orientation: "horizontal", decorative: true },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    decorative: { control: "boolean" },
    className: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A hairline that splits groups of content. It carries no meaning and no " +
          "interaction — it works by position alone, so it has no hover or " +
          "state treatment.",
      },
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BetweenSections: Story = {
  render: (args) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        maxWidth: 420,
      }}
    >
      <div>Intake summary — reviewed by Dr. Herrera</div>
      <Separator {...args} />
      <div>Session 14 · Cognitive appraisal · 45 min</div>
      <Separator {...args} />
      <div>Care plan updated 4 May</div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "var(--space-4)",
        height: "var(--space-16)",
        alignItems: "center",
      }}
    >
      <div>Assessment</div>
      <Separator orientation="vertical" />
      <div>Screener</div>
      <Separator orientation="vertical" />
      <div>Report</div>
    </div>
  ),
};
