import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToggleGroup, ToggleGroupItem } from "./ToggleGroup";

const meta = {
  title: "Components/ToggleGroup",
  component: ToggleGroup,
  tags: ["autodocs"],
  args: {
    label: "Session view",
    size: "md",
  },
  argTypes: {
    type: { control: "inline-radio", options: ["single", "multi"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A set of pressed buttons sharing one state. `single` keeps exactly one item " +
          "pressed; `multi` keeps a set. Each pressed item is a selection on the validated " +
          "selected pair — never a status.",
      },
    },
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: (args) => (
    <ToggleGroup {...args} type="single" defaultValue="summary">
      <ToggleGroupItem value="summary">Summary</ToggleGroupItem>
      <ToggleGroupItem value="objectives">Objectives</ToggleGroupItem>
      <ToggleGroupItem value="notes">Notes</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Multi: Story = {
  render: (args) => (
    <ToggleGroup {...args} type="multi" label="Session filters">
      <ToggleGroupItem value="intake">Intake</ToggleGroupItem>
      <ToggleGroupItem value="follow-up">Follow-up</ToggleGroupItem>
      <ToggleGroupItem value="discharge">Discharge plan</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const WithDisabledItem: Story = {
  render: (args) => (
    <ToggleGroup {...args} type="multi" label="Session filters">
      <ToggleGroupItem value="intake">Intake</ToggleGroupItem>
      <ToggleGroupItem value="follow-up" disabled>
        Follow-up
      </ToggleGroupItem>
      <ToggleGroupItem value="discharge">Discharge plan</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <ToggleGroup {...args} type="single" size="sm" label="Session view">
        <ToggleGroupItem value="summary">Summary</ToggleGroupItem>
        <ToggleGroupItem value="notes">Notes</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup {...args} type="single" size="md" label="Session view">
        <ToggleGroupItem value="summary">Summary</ToggleGroupItem>
        <ToggleGroupItem value="notes">Notes</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup {...args} type="single" size="lg" label="Session view">
        <ToggleGroupItem value="summary">Summary</ToggleGroupItem>
        <ToggleGroupItem value="notes">Notes</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};
