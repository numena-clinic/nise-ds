import type { Meta, StoryObj } from "@storybook/react-vite";
import { AspectRatio } from "./AspectRatio";

const meta = {
  title: "Components/AspectRatio",
  component: AspectRatio,
  tags: ["autodocs"],
  args: { ratio: 16 / 9 },
  argTypes: {
    ratio: { control: "number" },
    children: { control: false },
    className: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A frame that reserves its ratio before the content arrives — a chart " +
          "illustration, a scan, a video. Fit the content inside with " +
          "`object-fit: cover`; the frame never reflows when the asset streams in.",
      },
    },
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A stand-in surface while a real chart illustration streams in. */
function ChartIllustration() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "var(--color-tint-cyan)",
      }}
    >
      <span
        style={{
          fontSize: "var(--font-size-sm)",
          fontWeight: "var(--font-weight-medium)",
          color: "var(--color-base-content)",
        }}
      >
        Sleep chart — week 41
      </span>
    </div>
  );
}

export const WidescreenChart: Story = {
  args: { children: <ChartIllustration /> },
  render: ({ children, ...rest }) => (
    <div style={{ maxWidth: 480 }}>
      <AspectRatio {...rest}>{children}</AspectRatio>
    </div>
  ),
};

const PEXELS_RIVER_IMAGE =
  "https://images.pexels.com/photos/23962080/pexels-photo-23962080.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

export const WithImage: Story = {
  args: {
    ratio: 16 / 9,
    children: (
      <img
        src={PEXELS_RIVER_IMAGE}
        alt="River flowing through forest into lake"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "var(--radius-md)",
        }}
      />
    ),
  },
  render: ({ children, ...rest }) => (
    <div style={{ maxWidth: 480 }}>
      <AspectRatio {...rest}>{children}</AspectRatio>
    </div>
  ),
};

export const SquareScan: Story = {
  args: { ratio: 1, children: <ChartIllustration /> },
  render: ({ children, ...rest }) => (
    <div style={{ maxWidth: 320 }}>
      <AspectRatio {...rest}>{children}</AspectRatio>
    </div>
  ),
};

