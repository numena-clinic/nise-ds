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
  const multiplier = name.replace(/^--space-/, "");
  const rem = `${(px / 16).toFixed(3).replace(/\.?0+$/, "")}rem`;
  return { name, value, px, rem, multiplier };
});

const SpacingScaleView = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
    <Section
      title="4px Spacing Base Scale (Grid Multiplier Convention)"
      note="All layout dimensions, gaps, paddings, and margins build from this 4px mathematical grid. The numeric suffix is the grid multiplier (suffix × 4px = actual pixels)."
    >
      <div
        style={{
          padding: "var(--space-3)",
          backgroundColor: "var(--color-base-200)",
          border: "var(--border-width) solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
          fontSize: "var(--font-size-xs)",
          color: "var(--color-base-content)",
          lineHeight: "var(--line-height-relaxed)",
        }}
      >
        <strong>Naming Rule:</strong> Token suffix <code>N</code> represents the 4px grid multiplier (<code>--space-N = N × 4px</code>).
        For example, <code>--space-1</code> is <strong>4px</strong> (1 × 4px), and <code>--space-4</code> is <strong>16px</strong> (4 × 4px).
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {SPACING_STEPS.map((s) => (
          <div
            key={s.name}
            style={{
              display: "grid",
              gridTemplateColumns: "130px 100px 120px 1fr",
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
            <div>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                {s.multiplier} × 4px
              </span>
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
                title={`${s.name} (${s.value} = ${s.multiplier} × 4px)`}
              />
            </div>
          </div>
        ))}
      </div>
    </Section>

    <Section
      title="Why a 4px Base Grid (vs Alternative Models)?"
      note="Why Nise chose a 4px mathematical grid rather than an 8px-only grid, 5px/10px decimal systems, or arbitrary rem values."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-4)" }}>
        <div style={{ padding: "var(--space-4)", backgroundColor: "var(--color-base-200)", borderRadius: "var(--radius-md)", border: "var(--border-width) solid var(--color-border)" }}>
          <h4 style={{ margin: "0 0 var(--space-2)", fontSize: "var(--font-size-sm)", color: "var(--color-base-content)" }}>
            1. Dense Clinical Micro-Hierarchy
          </h4>
          <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", lineHeight: "var(--line-height-normal)" }}>
            An 8px-only grid is too coarse for clinical reasoning tools: jumping straight from 8px to 16px creates awkward whitespace. Micro steps like 4px and 12px enable compact form stacks, table rows, and badge insets.
          </p>
        </div>

        <div style={{ padding: "var(--space-4)", backgroundColor: "var(--color-base-200)", borderRadius: "var(--radius-md)", border: "var(--border-width) solid var(--color-border)" }}>
          <h4 style={{ margin: "0 0 var(--space-2)", fontSize: "var(--font-size-sm)", color: "var(--color-base-content)" }}>
            2. Native 8px Rhythm Compatibility
          </h4>
          <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", lineHeight: "var(--line-height-normal)" }}>
            4px does not fight the standard 8px layout rhythm—it refines it. Every standard 8px macro milestone (8, 16, 24, 32, 48, 64) is an exact step on the scale.
          </p>
        </div>

        <div style={{ padding: "var(--space-4)", backgroundColor: "var(--color-base-200)", borderRadius: "var(--radius-md)", border: "var(--border-width) solid var(--color-border)" }}>
          <h4 style={{ margin: "0 0 var(--space-2)", fontSize: "var(--font-size-sm)", color: "var(--color-base-content)" }}>
            3. Typography & Icon Harmony
          </h4>
          <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", lineHeight: "var(--line-height-normal)" }}>
            Font line-heights (16, 20, 24, 28, 32) and icon boxes (16, 20, 24) divide evenly by 4px, eliminating half-pixel blur and baseline drift on high-DPI screens.
          </p>
        </div>

        <div style={{ padding: "var(--space-4)", backgroundColor: "var(--color-base-200)", borderRadius: "var(--radius-md)", border: "var(--border-width) solid var(--color-border)" }}>
          <h4 style={{ margin: "0 0 var(--space-2)", fontSize: "var(--font-size-sm)", color: "var(--color-base-content)" }}>
            4. Clean Quarter-rem Fractions
          </h4>
          <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", lineHeight: "var(--line-height-normal)" }}>
            At 16px root font size, 4px = 0.25rem, 8px = 0.5rem, 12px = 0.75rem. Unlike 5px decimal scales, every step is a clean quarter fraction for reliable accessibility zoom (WCAG 1.4.4).
          </p>
        </div>
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
          "The spacing foundation in Nise DS is strictly governed by a 4px mathematical grid (`--space-1` = 4px up to `--space-24` = 96px).\n\n" +
          "### Grid Multiplier Convention (`--space-N = N × 4px`)\n\n" +
          "The numeric suffix is the **grid step multiplier**, not a raw pixel count:\n\n" +
          "- `--space-1` = 1 × 4px = 4px (0.25rem)\n" +
          "- `--space-2` = 2 × 4px = 8px (0.5rem)\n" +
          "- `--space-3` = 3 × 4px = 12px (0.75rem)\n" +
          "- `--space-4` = 4 × 4px = 16px (1rem)\n" +
          "- `--space-5` = 5 × 4px = 20px (1.25rem)\n" +
          "- `--space-6` = 6 × 4px = 24px (1.5rem)\n" +
          "- `--space-8` = 8 × 4px = 32px (2rem)\n" +
          "- `--space-10` = 10 × 4px = 40px (2.5rem)\n" +
          "- `--space-12` = 12 × 4px = 48px (3rem)\n" +
          "- `--space-16` = 16 × 4px = 64px (4rem)\n" +
          "- `--space-24` = 24 × 4px = 96px (6rem)\n\n" +
          "### Why a 4px Base Grid (vs Other Models)?\n\n" +
          "1. **Dense Clinical Micro-Hierarchy**: An 8px-only grid jumps straight from 8px to 16px. Micro steps of 4px and 12px provide crucial grouping granularity for complex medical forms and data tables.\n" +
          "2. **Native 8px Rhythm**: 4px is an exact integer factor of 8px, maintaining alignment with standard 8px macro layouts.\n" +
          "3. **Typography & Icon Alignment**: Line heights and icon bounding boxes divide cleanly by 4px, avoiding fractional rendering.\n" +
          "4. **Quarter-rem Precision**: 4px equals exactly 0.25rem at 16px root font size, supporting accessible browser text zoom without rounding artifacts.",
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

