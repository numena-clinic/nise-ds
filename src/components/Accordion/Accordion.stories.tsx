import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./Accordion";

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  args: {
    type: "single",
    collapsible: true,
  },
  argTypes: {
    type: { control: "inline-radio", options: ["single", "multiple"] },
    collapsible: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A vertically stacked set of interactive headings that each reveal an associated section of content. Adheres to WAI-ARIA Accordion design pattern with keyboard roving.",
      },
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Accordion {...args} defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the W3C WAI-ARIA design pattern with full keyboard navigation.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled with design tokens?</AccordionTrigger>
        <AccordionContent>
          Yes. All spacing, typography, colors, and motion transitions consume Nise design tokens.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Does it support both light and dark themes?</AccordionTrigger>
        <AccordionContent>
          Yes. Fills, borders, text, and chevron indicators automatically adapt across color modes.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" defaultValue={["item-1", "item-2"]}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Clinical Milestones</AccordionTrigger>
        <AccordionContent>
          Diagnostic markers and therapeutic progress metrics recorded during recent sessions.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Prescribed Protocols</AccordionTrigger>
        <AccordionContent>
          Ongoing pharmacological interventions and behavioral modulation assignments.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Discharge Criteria</AccordionTrigger>
        <AccordionContent>
          Required stabilization benchmarks prior to conclusion of outpatient treatment.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const WithDisabledItem: Story = {
  render: () => (
    <Accordion type="single" collapsible defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger>Active Session</AccordionTrigger>
        <AccordionContent>
          Observations documented in real-time during the encounter.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" disabled>
        <AccordionTrigger disabled>Archived Record (Locked)</AccordionTrigger>
        <AccordionContent>
          This record is archived and cannot be inspected in this view.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
