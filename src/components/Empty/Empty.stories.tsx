import type { Meta, StoryObj } from "@storybook/react-vite";
import { InfoIcon } from "../../icons";
import { Button } from "../Button";
import { Empty } from "./Empty";

const meta = {
  title: "Components/Empty",
  component: Empty,
  tags: ["autodocs"],
  args: {
    title: "No sessions yet",
    description:
      "Sessions recorded in the chart will appear here.",
  },
  argTypes: {
    icon: { control: false },
    action: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "An empty state block for a list with no records yet. The icon slot " +
          "is decorative and aria-hidden — the title and description carry the " +
          "meaning, and the tint carries no verdict.",
      },
    },
  },
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoSessions: Story = {
  args: {
    icon: <InfoIcon size={24} />,
    action: (
      <Button variant="secondary" size="md">
        Record a session
      </Button>
    ),
  },
};

export const Minimal: Story = {
  args: {
    description: undefined,
    icon: undefined,
    action: undefined,
    title: "No assessments scheduled",
  },
};

export const WithDescriptionOnly: Story = {
  args: {
    icon: <InfoIcon size={24} />,
    action: undefined,
    description:
      "Referral data has not been imported for this client yet.",
  },
};
