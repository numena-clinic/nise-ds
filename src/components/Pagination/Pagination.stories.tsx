import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./Pagination";

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  args: { "aria-label": "Pagination" },
  argTypes: {
    "aria-label": { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Page navigation for a record list, composed from parts over plain " +
          "HTML. The current page carries aria-current=\"page\"; Previous and " +
          "Next keep a visible text label beside their decorative chevron.",
      },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SessionList: Story = {
  render: () => (
    <Pagination aria-label="Pagination">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#sessions-previous" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#sessions-1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#sessions-2" isActive={true}>2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#sessions-3">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#sessions-next" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const ManyPages: Story = {
  render: () => (
    <Pagination aria-label="Assessment results">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#results-previous" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#results-1" isActive={true}>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#results-2">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#results-11">11</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#results-12">12</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#results-next" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};
