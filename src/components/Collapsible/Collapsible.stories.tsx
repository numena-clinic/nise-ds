import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./Collapsible";

const meta = {
  title: "Components/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
  argTypes: {
    defaultOpen: { control: "boolean" },
    open: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A disclosure region over the native details/summary pair. The " +
          "toggle is the summary itself; the chevron is decorative and rotates " +
          "when the region is open. `open` is one-way if passed — prefer " +
          "`defaultOpen`.",
      },
    },
  },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SessionTemplates: Story = {
  render: (args) => (
    <Collapsible {...args}>
      <CollapsibleTrigger>Session template notes</CollapsibleTrigger>
      <CollapsibleContent>
        Three templates ship with the clinic configuration: intake review,
        progress review and discharge session. Supervisors can edit the fields
        each template exposes.
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const AdvancedOptions: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Collapsible {...args}>
      <CollapsibleTrigger>Advanced export options</CollapsibleTrigger>
      <CollapsibleContent>
        Advanced options include the anonymised sequence check and the
        redieact-level selection of assessment fields.
      </CollapsibleContent>
    </Collapsible>
  ),
};
