import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table } from "./Table";

const meta = {
  title: "Components/Table",
  component: Table,
  tags: ["autodocs"],
  args: {
    header: ["Name", "Role", "Last updated"],
    rows: [
      { key: "a", cells: ["Alex", "Psychologist", "2025-09-12"] },
      { key: "b", cells: ["Jordan", "Reviewer", "2025-09-20"] },
    ],
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
