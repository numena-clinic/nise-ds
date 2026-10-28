import type { Meta, StoryObj } from "@storybook/react-vite";
import { SessionWorkspace } from "./SessionWorkspace";
import { ComponentGallery } from "./ComponentGallery";
const meta = {
  title: "Portfolio/Session workspace",
  component: SessionWorkspace,
  parameters: {
    layout: "fullscreen",
    chromatic: { viewports: [390, 1440] },
    docs: {
      description: {
        component:
          "A fictional session workspace composed from Nise components. Saving, discarding, session selection, tabs, and review work in local memory. No backend or clinical assessment.",
      },
    },
  },
} satisfies Meta<typeof SessionWorkspace>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const ComponentCollection: Story = {
  name: "Component collection",
  render: () => <ComponentGallery />,
};

export const Dark: Story = { globals: { theme: "dark" } };
export const DarkCollection: Story = {
  name: "Component collection · dark",
  globals: { theme: "dark" },
  render: () => <ComponentGallery />,
};
