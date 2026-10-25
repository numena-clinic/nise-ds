import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./Select";

const options = [
  { value: "low", label: "Low confidence" },
  { value: "moderate", label: "Moderate confidence" },
  { value: "high", label: "High confidence" },
];

const meta = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  args: {
    label: "Confidence",
    options,
    placeholder: "Select a level",
  },
  argTypes: {
    options: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Single-choice control for a short, known list, built on Radix Select. " +
          "Options here express a neutral level — never a color-coded verdict.",
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
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Preselected: Story = {
  args: { defaultValue: "moderate" },
};

export const WithHint: Story = {
  args: { hint: "Your confidence in this formulation, not the client's." },
};

export const WithError: Story = {
  args: { error: "Choose a confidence level before saving." },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "low" },
};
