import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties, ReactNode } from "react";
import { radii, border } from "../../tokens/primitives.mjs";

const sectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-4)",
  padding: "var(--space-5)",
  backgroundColor: "var(--color-base-100)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
};

const headingStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--font-size-md)",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-base-content)",
};

const noteStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--font-size-xs)",
  color: "var(--color-text-muted)",
};

const codeStyle: CSSProperties = {
  fontFamily: "monospace",
  fontSize: "var(--font-size-xs)",
  color: "var(--color-primary)",
};

const Section = ({ title, note, children }: { title: string; note?: string; children: ReactNode }) => (
  <section style={sectionStyle}>
    <div>
      <h3 style={headingStyle}>{title}</h3>
      {note ? <p style={noteStyle}>{note}</p> : null}
    </div>
    {children}
  </section>
);

const RADII = [
  { name: "--radius-sm", value: radii["--radius-sm"], usage: "Checkboxes, micro-controls, inner indicators" },
  { name: "--radius-md", value: radii["--radius-md"], usage: "Buttons, inputs, toggles, selects, tabs" },
  { name: "--radius-lg", value: radii["--radius-lg"], usage: "Cards, alerts, popovers, surface containers" },
  { name: "--radius-xl", value: radii["--radius-xl"], usage: "Dialogs, drawers, large panels" },
  { name: "--radius-full", value: radii["--radius-full"], usage: "Pills, badges, circular avatars" },
];

const RadiusScaleView = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
    <Section
      title="Corner Radius Scale"
      note="Declared at the point of use with fallbacks (decisions.md D9): var(--button-radius, var(--radius-md))."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
        {RADII.map((r) => (
          <div
            key={r.name}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
              padding: "var(--space-4)",
              backgroundColor: "var(--color-base-200)",
              border: "var(--border-width) solid var(--color-border)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div
              style={{
                height: "64px",
                backgroundColor: "var(--color-base-100)",
                border: "var(--border-width-strong) solid var(--color-primary)",
                borderRadius: `var(${r.name})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <code style={codeStyle}>{r.name}</code>
            </div>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-base-content)" }}>
              <strong>{r.value}</strong>
            </div>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              {r.usage}
            </div>
          </div>
        ))}
      </div>
    </Section>
  </div>
);

const BordersView = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
    <Section
      title="Border Widths & Boundary Weights"
      note="Hairlines provide subtle separation, while strong boundaries guarantee 3:1 non-text contrast for interactive controls."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-4)" }}>
        <div
          style={{
            padding: "var(--space-4)",
            backgroundColor: "var(--color-base-200)",
            border: "var(--border-width) solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <code style={codeStyle}>--border-width</code>
            <strong>{border["--border-width"]}</strong>
          </div>
          <div style={{ height: "48px", backgroundColor: "var(--color-base-100)", borderStyle: "solid", borderColor: "var(--color-border)", borderWidth: "var(--border-width)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            0.5px Hairline Divider
          </div>
          <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Used for subtle structural card boundaries, table cell rules, and list separators.
          </p>
        </div>

        <div
          style={{
            padding: "var(--space-4)",
            backgroundColor: "var(--color-base-200)",
            border: "var(--border-width) solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <code style={codeStyle}>--border-width-strong</code>
            <strong>{border["--border-width-strong"]}</strong>
          </div>
          <div style={{ height: "48px", backgroundColor: "var(--color-base-100)", borderStyle: "solid", borderColor: "var(--color-border-strong)", borderWidth: "var(--border-width-strong)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-base-content)" }}>
            2px Accessible Boundary
          </div>
          <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Used for input boundaries, checkbox borders, switch outlines, and keyboard focus indicators.
          </p>
        </div>
      </div>
    </Section>
  </div>
);

const ElevationsView = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
    <Section
      title="Elevation, Shadows & Physical Edges"
      note="Nise shadows use the brand's ink plum rather than neutral grey. The 1px lip grounds primary solid buttons."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-4)" }}>
        <div
          style={{
            padding: "var(--space-5)",
            backgroundColor: "var(--color-base-100)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          <code style={codeStyle}>--shadow-sm</code>
          <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-base-content)" }}>
            Card & Surface Elevation
          </div>
          <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Subtle separation for cards, table rows, and resting surfaces.
          </p>
        </div>

        <div
          style={{
            padding: "var(--space-5)",
            backgroundColor: "var(--color-base-100)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          <code style={codeStyle}>--shadow-md</code>
          <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-base-content)" }}>
            Floating Overlay Elevation
          </div>
          <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Elevated depth for modals, dropdown selects, and floating tooltips.
          </p>
        </div>

        <div
          style={{
            padding: "var(--space-5)",
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-content)",
            borderRadius: "var(--radius-sm)",
            border: "var(--border-width) solid var(--color-primary-edge)",
            boxShadow: "var(--shadow-lip)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          <code style={{ fontFamily: "monospace", fontSize: "var(--font-size-xs)", color: "var(--color-primary-content)" }}>
            --shadow-lip (Primary button edge)
          </code>
          <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)" }}>
            1px Hard Physical Edge
          </div>
          <p style={{ margin: 0, fontSize: "var(--font-size-xs)", opacity: 0.9 }}>
            Offset 1px down with no blur: grounds solid action buttons without blurry halos.
          </p>
        </div>
      </div>
    </Section>
  </div>
);

const meta: Meta = {
  title: "Foundations/Shape",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Shape and geometry foundations in Nise DS: radius steps (`--radius-sm` to `--radius-full`), " +
          "border boundary weights, and ink-plum shadows (`--shadow-sm`, `--shadow-md`, `--shadow-lip`).\n\n" +
          "### Corner Radius Scale\n\n" +
          "| Token | Value | Target Roles |\n" +
          "| :--- | :--- | :--- |\n" +
          "| `--radius-sm` | `2px` | Checkboxes, micro-controls, inner indicators |\n" +
          "| `--radius-md` | `4px` | Buttons, inputs, toggles, selects, tabs |\n" +
          "| `--radius-lg` | `8px` | Cards, alerts, popovers, surface containers |\n" +
          "| `--radius-xl` | `12px` | Dialogs, drawers, large panels |\n" +
          "| `--radius-full` | `9999px` | Pills, badges, circular avatars |",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const RadiusScale: Story = {
  tags: ["!autodocs"],
  render: () => <RadiusScaleView />,
};

export const BordersAndDividers: Story = {
  tags: ["!autodocs"],
  render: () => <BordersView />,
};

export const ShadowsAndElevation: Story = {
  tags: ["!autodocs"],
  render: () => <ElevationsView />,
};

