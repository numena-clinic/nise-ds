import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from "./Progress";

const meta = {
  title: "Components/Progress",
  component: Progress,
  tags: ["autodocs"],
  args: { max: 100, value: 68, "aria-label": "Upload progress" },
  argTypes: {
    value: { control: { type: "number", min: 0, max: 100 } },
    max: { control: "number" },
    "aria-label": { control: "text" },
    className: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A machine-state meter: an upload, an export, a capture. `value: null` " +
          "switches to the indeterminate sweep. It reports progress only — it is " +
          "never interactive and never a verdict.",
      },
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Determinate: Story = {};

export const Indeterminate: Story = {
  args: { value: null, "aria-label": "Exporting session recording" },
};

export const Scaled: Story = {
  render: (args) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        maxWidth: 420,
      }}
    >
      <Progress {...args} max={24} value={13} aria-label="Session notes drafted" />
      <Progress {...args} max={100} value={82} aria-label="Battery saver" />
    </div>
  ),
};
