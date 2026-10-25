import type { Meta, StoryObj } from "@storybook/react-vite";
import { InformationReview } from "./InformationReview";

const meta = {
  title: "Compositions/Information review",
  component: InformationReview,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The reference composition: a clinical information review built entirely " +
          "from system components. Synthetic content. Color is categorical here, " +
          "never a verdict — confidence is a neutral Select and no element is tinted " +
          "good or bad.",
      },
    },
  },
} satisfies Meta<typeof InformationReview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
