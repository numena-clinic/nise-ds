import type { Meta, StoryObj } from "@storybook/react-vite";
import { Timeline, TimelineItem } from "./Timeline";

const meta = {
  title: "Components/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  args: { "aria-label": "Session history" },
  argTypes: {
    "aria-label": { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A vertical history of system events on a record. Item states are " +
          "operational (done, current, upcoming) — the titles carry the " +
          "meaning, the dots only report the machine state.",
      },
    },
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SessionHistory: Story = {
  render: () => (
    <Timeline aria-label="Session history">
      <TimelineItem title="Session note saved" meta="10:24" variant="done">
        Note review draft by intake for client.
      </TimelineItem>
      <TimelineItem title="Intake form completed" meta="09:52" variant="done">
        Consent and contact details recorded.
      </TimelineItem>
      <TimelineItem title="Note in progress" meta="11:05" variant="current" />
      <TimelineItem title="Assessment scheduled" meta="14:00" />
    </Timeline>
  ),
};

export const TitlesOnly: Story = {
  render: () => (
    <Timeline aria-label="Referral events">
      <TimelineItem title="Referral received" variant="done" />
      <TimelineItem title="Assessment scheduled" variant="current" />
      <TimelineItem title="Report due" variant="upcoming" />
    </Timeline>
  ),
};
