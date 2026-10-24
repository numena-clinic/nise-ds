import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "./Avatar";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: { size: "md" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    src: { control: false },
    srcSet: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A person's face, or their initials when no image loads. Identifies a " +
          "clinician, client or team member; it never carries an action.",
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {
  args: { fallback: "AM" },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
      <Avatar {...args} size="sm" fallback="AM" />
      <Avatar {...args} size="md" fallback="SR" />
      <Avatar {...args} size="lg" fallback="NT" />
    </div>
  ),
};

export const WithImage: Story = {
  args: {
    src: "https://i.pravatar.cc/80?img=12",
    fallback: "AM",
    alt: "Portrait of Arwa Mahmoud",
  },
};

/* The on-error fallback (a failing src swaps the image for the initials) is
   behaviour-tested in tests/components.test.tsx; a story can only show it by
   making a genuinely failing network request, which is kept out of Storybook
   so the console stays clean. */
export const NoImage: Story = {
  args: { fallback: "NT", size: "lg" },
};
