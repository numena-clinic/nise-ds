import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextField } from "./TextField";

const meta = {
  title: "Components/TextField",
  component: TextField,
  tags: ["autodocs"],
  args: {
    label: "Client's own words",
    placeholder: "Quote the client verbatim…",
  },
  argTypes: {
    hint: { control: "text" },
    error: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A labelled single-line text control. The label is always visible. When an " +
          "error is shown, the hint is removed and the error is announced via " +
          "`aria-describedby`.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "var(--measure-form)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHint: Story = {
  args: { hint: "Use the client's exact phrasing where possible." },
};

export const WithError: Story = {
  args: {
    defaultValue: "…",
    hint: "Use the client's exact phrasing where possible.",
    error: "Add at least one sentence.",
  },
};

export const Required: Story = {
  args: { label: "Presenting concern", required: true },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Locked while under review" },
};
