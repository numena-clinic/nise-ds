import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Tabs defaultValue="notes">
      <TabsList>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="attachments">Attachments</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      <TabsContent value="notes">Notes panel.</TabsContent>
      <TabsContent value="attachments">Attachments panel.</TabsContent>
      <TabsContent value="history">History panel.</TabsContent>
    </Tabs>
  ),
};
