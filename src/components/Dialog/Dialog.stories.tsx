import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "./Dialog";
import { Button } from "../Button/Button";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm action</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
