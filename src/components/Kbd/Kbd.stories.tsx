import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kbd } from "./Kbd";

const meta = {
  title: "Components/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  args: { children: "Enter" },
  parameters: {
    docs: {
      description: {
        component:
          "A key cap that labels a keyboard shortcut or the key the interface is " +
          "waiting for. It labels; it never acts.",
      },
    },
  },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleKey: Story = {};

export const InSentence: Story = {
  render: () => (
    <p style={{ fontFamily: "var(--font-sans)" }}>
      Press <Kbd>Enter</Kbd> to save, or <Kbd>Ctrl</Kbd> <Kbd>N</Kbd> for a new
      session note.
    </p>
  ),
};
