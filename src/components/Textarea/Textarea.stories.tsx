import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./Textarea";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: {
    label: "Session notes",
    placeholder: "What did the client say and do…",
  },
  argTypes: {
    hint: { control: "text" },
    error: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A labelled multi-line text control. The label is always visible. When an " +
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
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHint: Story = {
  args: {
    hint: "Record what was said and done — not an interpretation.",
  },
};

export const WithError: Story = {
  args: {
    defaultValue: "…",
    hint: "Record what was said and done — not an interpretation.",
    error: "Add at least one sentence.",
  },
};

export const Required: Story = {
  args: { label: "Presenting concern summary", required: true },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "Locked while under review",
  },
};
