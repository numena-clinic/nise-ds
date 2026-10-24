import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties, ReactNode } from "react";
import { space } from "../../tokens/primitives.mjs";

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

const SPACING_STEPS = (Object.entries(space) as Array<[string, string]>).map(([name, value]) => {
  const px = parseInt(value, 10);
  const rem = `${(px / 16).toFixed(3).replace(/\.?0+$/, "")}rem`;
  return { name, value, px, rem };
});

const SpacingScaleView = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
    <Section
      title="4px Spacing Base Scale"
      note="All layout dimensions, gaps, paddings, and margins build from this 4px mathematical scale. No arbitrary pixel values are allowed."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {SPACING_STEPS.map((s) => (
          <div
            key={s.name}
            style={{
              display: "grid",
              gridTemplateColumns: "140px 100px 1fr",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--color-base-200)",
            }}
          >
            <div>
              <code style={codeStyle}>{s.name}</code>
            </div>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-base-content)" }}>
              <strong>{s.value}</strong> <span style={{ color: "var(--color-text-muted)" }}>({s.rem})</span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  height: "20px",
                  width: `var(${s.name})`,
                  backgroundColor: "var(--color-primary)",
                  borderRadius: "var(--radius-sm)",
                  opacity: 0.85,
                }}
                title={`${s.name} (${s.value})`}
              />
            </div>
          </div>
        ))}
      </div>
    </Section>
  </div>
);

const LayoutSpecimensView = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
    <Section
      title="Spacing in Layout Composition"
      note="Examples of deliberate spacing relationships: compact button insets, structured form gaps, and card padding."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
        {/* Card padding example */}
        <div
          style={{
            padding: "var(--space-5)",
            backgroundColor: "var(--color-base-200)",
            border: "var(--border-width) solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Card padding: <code style={codeStyle}>--space-5 (20px)</code>
          </div>
          <h4 style={{ margin: 0, fontSize: "var(--font-size-md)", color: "var(--color-base-content)" }}>
            Patient Intake Assessment
          </h4>
          <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            Inner gap between elements is governed by <code style={codeStyle}>--space-3 (12px)</code>.
          </p>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <span
              style={{
                padding: "var(--space-1) var(--space-3)",
                backgroundColor: "var(--color-base-300)",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--font-size-xs)",
              }}
            >
              Badge (<code style={codeStyle}>--space-1 / --space-3</code>)
            </span>
          </div>
        </div>

        {/* Form grouping example */}
        <div
          style={{
            padding: "var(--space-5)",
            backgroundColor: "var(--color-base-200)",
            border: "var(--border-width) solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Form group stack: <code style={codeStyle}>--space-4 (16px)</code>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--space-1)", color: "var(--color-base-content)" }}>
              Field label (gap: <code style={codeStyle}>--space-1</code>)
            </label>
            <div
              style={{
                padding: "var(--space-2) var(--space-3)",
                backgroundColor: "var(--color-base-100)",
                border: "var(--border-width-strong) solid var(--color-border-strong)",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-muted)",
              }}
            >
              Input padding: <code style={codeStyle}>--space-2 / --space-3</code>
            </div>
          </div>
        </div>
      </div>
    </Section>
  </div>
);

const meta: Meta = {
  title: "Foundations/Space",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The spacing foundation in Nise DS is strictly governed by a 4px mathematical scale (`--space-1` = 4px up to `--space-24` = 96px). " +
          "Components and layout wrappers consume these tokens exclusively, ensuring mathematical alignment across all screens.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SpacingScale: Story = {
  tags: ["!autodocs"],
  render: () => <SpacingScaleView />,
};

export const LayoutSpecimens: Story = {
  tags: ["!autodocs"],
  render: () => <LayoutSpecimensView />,
};

