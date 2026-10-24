import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./Skeleton";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    className: { control: false },
    style: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A painted stand-in for content that is still loading. It is purely " +
          "decorative (aria-hidden); do not rely on it to announce the load state " +
          "or to mean anything about the data that arrives.",
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placeholder: Story = {
  render: (args) => <Skeleton {...args} style={{ width: "60%" }} />,
};

export const LoadingCard: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        maxWidth: 420,
      }}
    >
      <Skeleton style={{ height: 120 }} />
      <Skeleton style={{ width: "45%", height: "var(--space-3)" }} />
      <Skeleton style={{ width: "80%", height: "var(--space-3)" }} />
      <Skeleton style={{ width: "70%", height: "var(--space-3)" }} />
    </div>
  ),
};
