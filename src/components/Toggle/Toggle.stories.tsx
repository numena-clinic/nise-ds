import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toggle } from "./Toggle";
import {
  BookmarkIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
} from "../../icons";

const meta = {
  title: "Components/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  args: {
    children: "Show notes",
    size: "md",
    variant: "default",
    defaultPressed: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "outline"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A two-state pressed button for toolbar modes and filters. The pressed state is " +
          "a selection — the validated selected pair, tile and text — never a status.",
      },
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Toggle aria-label="Toggle bookmark">
      <BookmarkIcon size={16} />
    </Toggle>
  ),
};

export const Outline: Story = {
  render: () => (
    <Toggle variant="outline" aria-label="Toggle bookmark">
      <BookmarkIcon size={16} />
    </Toggle>
  ),
};

export const WithText: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
      <Toggle aria-label="Toggle italic">
        <ItalicIcon size={16} />
        Italic
      </Toggle>
      <Toggle variant="outline" aria-label="Toggle bookmark">
        <BookmarkIcon size={16} />
        Bookmark
      </Toggle>
    </div>
  ),
};

export const TypeStyle: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
      <Toggle aria-label="Toggle bold">
        <BoldIcon size={16} />
      </Toggle>
      <Toggle aria-label="Toggle italic" defaultPressed>
        <ItalicIcon size={16} />
      </Toggle>
      <Toggle aria-label="Toggle underline">
        <UnderlineIcon size={16} />
      </Toggle>
    </div>
  ),
};

export const OutlineTypeStyle: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
      <Toggle variant="outline" aria-label="Toggle bold">
        <BoldIcon size={16} />
      </Toggle>
      <Toggle variant="outline" aria-label="Toggle italic" defaultPressed>
        <ItalicIcon size={16} />
      </Toggle>
      <Toggle variant="outline" aria-label="Toggle underline">
        <UnderlineIcon size={16} />
      </Toggle>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
      <Toggle {...args} size="sm">
        Small
      </Toggle>
      <Toggle {...args} size="md">
        Medium
      </Toggle>
      <Toggle {...args} size="lg">
        Large
      </Toggle>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
      <Toggle disabled aria-label="Toggle bookmark">
        <BookmarkIcon size={16} />
      </Toggle>
      <Toggle disabled variant="outline" defaultPressed aria-label="Toggle bookmark">
        <BookmarkIcon size={16} />
      </Toggle>
    </div>
  ),
};

