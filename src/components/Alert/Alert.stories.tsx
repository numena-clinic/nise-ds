import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "./Alert";

const meta = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: {
    variant: "neutral",
    title: "Session saved",
    children: "The session note was saved at 14:32 and is available to your team.",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["neutral", "info", "success", "warning", "error"],
    },
    icon: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A banner that reports a machine state: none, info, success, warning, " +
          "error. It never reads as a clinical verdict, and colour is never the " +
          "only signal — the title, an icon and a hairline boundary carry the state.",
      },
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <Alert {...args} variant="neutral" title="Draft ready">
        The intake draft for this client is ready for review.
      </Alert>
      <Alert {...args} variant="info" title="Assessment due">
        A follow-up assessment for this client is due on Friday.
      </Alert>
      <Alert {...args} variant="success" title="Session saved">
        The session note was saved and is available to your team.
      </Alert>
      <Alert {...args} variant="warning" title="Draft unsaved">
        This session draft has not been saved. Save before leaving the page.
      </Alert>
      <Alert {...args} variant="error" title="Could not save">
        The session note could not be saved. Check your connection and try again.
      </Alert>
    </div>
  ),
};

export const TitleOnly: Story = {
  args: {
    variant: "warning",
    title: "Draft unsaved",
    children: undefined,
  },
};
