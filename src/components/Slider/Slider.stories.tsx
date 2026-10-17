import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider } from "./Slider";

const meta = {
  title: "Components/Slider",
  component: Slider,
  tags: ["autodocs"],
  args: { defaultValue: [40], min: 0, max: 100, step: 1 },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithLabel: Story = {
  args: { label: "Tone", hint: "Adjust the tone" },
};
