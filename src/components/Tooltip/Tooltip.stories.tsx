import type { Meta, StoryObj } from "@storybook/react-vite";
import { TooltipContent, TooltipProvider, TooltipRoot, TooltipTrigger } from "./Tooltip";
import { Button } from "../Button/Button";

const meta = {
  title: "Components/Tooltip",
  component: TooltipRoot,
  tags: ["autodocs"],
  args: { children: null },
} satisfies Meta<typeof TooltipRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <Button>Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Supplemental text</TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  ),
};
