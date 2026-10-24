import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties, ReactNode } from "react";
import { typography } from "../../tokens/primitives.mjs";

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

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "var(--font-size-sm)",
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "var(--space-2) var(--space-3)",
  borderBottom: "1px solid var(--color-border)",
  color: "var(--color-text-muted)",
  fontWeight: "var(--font-weight-medium)",
  fontSize: "var(--font-size-xs)",
};

const tdStyle: CSSProperties = {
  padding: "var(--space-3)",
  borderBottom: "1px solid var(--color-border)",
  verticalAlign: "middle",
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

const SIZES = [
  { name: "--font-size-4xl", label: "4xl", value: typography["--font-size-4xl"], rem: "2.25rem", role: "Page title / Hero display" },
  { name: "--font-size-3xl", label: "3xl", value: typography["--font-size-3xl"], rem: "1.875rem", role: "Primary modal / Section heading" },
  { name: "--font-size-2xl", label: "2xl", value: typography["--font-size-2xl"], rem: "1.5rem", role: "Card headline / Drawer title" },
  { name: "--font-size-xl", label: "xl", value: typography["--font-size-xl"], rem: "1.25rem", role: "Subheading / Table header title" },
  { name: "--font-size-lg", label: "lg", value: typography["--font-size-lg"], rem: "1.125rem", role: "Lead paragraph / Emphasized label" },
  { name: "--font-size-md", label: "md", value: typography["--font-size-md"], rem: "1.0rem", role: "Base body text / Field input" },
  { name: "--font-size-sm", label: "sm", value: typography["--font-size-sm"], rem: "0.875rem", role: "Secondary body / Button label / Table row" },
  { name: "--font-size-xs", label: "xs", value: typography["--font-size-xs"], rem: "0.75rem", role: "Captions / Helper text / Badges" },
];

const WEIGHTS = [
  { name: "--font-weight-regular", value: "400", label: "Regular", role: "Body paragraphs, longform prose, muted notes" },
  { name: "--font-weight-medium", value: "500", label: "Medium", role: "Form labels, table headers, navigation links" },
  { name: "--font-weight-semibold", value: "600", label: "Semibold", role: "Section headings, card titles, button labels" },
  { name: "--font-weight-bold", value: "700", label: "Bold", role: "Display titles, numerical callouts, alerts" },
];

const TypeScaleView = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
    <Section
      title="Type scale"
      note="An 8-step proportional scale spanning from 12px (xs) to 36px (4xl). Font sizes scale cleanly on interface surfaces."
    >
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Token</th>
            <th style={thStyle}>Size (px / rem)</th>
            <th style={thStyle}>Specimen</th>
            <th style={thStyle}>Primary Purpose</th>
          </tr>
        </thead>
        <tbody>
          {SIZES.map((size) => (
            <tr key={size.name}>
              <td style={tdStyle}>
                <code style={codeStyle}>{size.name}</code>
              </td>
              <td style={tdStyle}>
                <strong>{size.value}</strong>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>{size.rem}</div>
              </td>
              <td style={tdStyle}>
                <div
                  style={{
                    fontSize: `var(${size.name})`,
                    lineHeight: "var(--line-height-tight)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--color-base-content)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Clinical consultation review
                </div>
              </td>
              <td style={tdStyle}>
                <span style={{ color: "var(--color-text-muted)" }}>{size.role}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  </div>
);

const FontFamiliesView = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
    <Section
      title="Font families"
      note="The sans-serif family drives the interactive interface and controls; the serif family provides high legibility for longform reading."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-4)" }}>
        <div
          style={{
            padding: "var(--space-4)",
            border: "var(--border-width) solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--color-base-200)",
          }}
        >
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
            Interface Sans-Serif
          </div>
          <code style={codeStyle}>--font-sans</code>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", margin: "var(--space-2) 0" }}>
            Albert Sans
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--font-size-sm)", color: "var(--color-base-content)", lineHeight: "var(--line-height-normal)" }}>
            Used for all buttons, form fields, tables, navigation, modals, and metric readouts. Clean geometric shapes with open counters ensure maximum legibility at compact interface sizes.
          </p>
        </div>

        <div
          style={{
            padding: "var(--space-4)",
            border: "var(--border-width) solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--color-base-200)",
          }}
        >
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
            Editorial Serif
          </div>
          <code style={codeStyle}>--font-serif</code>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", margin: "var(--space-2) 0" }}>
            Tiempos Text
          </p>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "var(--font-size-sm)", color: "var(--color-base-content)", lineHeight: "var(--line-height-relaxed)" }}>
            Used for clinical session notes, psychologist summaries, narrative reports, and longform patient transcripts. Sturdy serifs anchor the eye across extended reading lines.
          </p>
        </div>
      </div>
    </Section>
  </div>
);

const FontWeightsView = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
    <Section title="Font weights" note="Four deliberate weights to express visual hierarchy.">
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Token</th>
            <th style={thStyle}>Numeric</th>
            <th style={thStyle}>Specimen</th>
            <th style={thStyle}>Recommended Role</th>
          </tr>
        </thead>
        <tbody>
          {WEIGHTS.map((w) => (
            <tr key={w.name}>
              <td style={tdStyle}><code style={codeStyle}>{w.name}</code></td>
              <td style={tdStyle}><strong>{w.value}</strong> ({w.label})</td>
              <td style={tdStyle}>
                <div style={{ fontWeight: Number(w.value), fontSize: "var(--font-size-lg)", color: "var(--color-base-content)" }}>
                  The quick brown fox jumps over the lazy dog
                </div>
              </td>
              <td style={tdStyle}><span style={{ color: "var(--color-text-muted)" }}>{w.role}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  </div>
);

const EditorialSpecimenView = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
    <Section title="Editorial & layout measures" note="Testing typography within governed reading measures (--measure-prose: 68ch, --measure-form: 32rem).">
      <div style={{ maxWidth: "var(--measure-prose)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <h1 style={{ margin: 0, fontSize: "var(--font-size-3xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-base-content)", lineHeight: "var(--line-height-tight)" }}>
          Longitudinal Session Evaluation
        </h1>
        <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
          Published October 24, 2026 · Clinical Research Team · Measure: 68ch
        </p>
        <p style={{ margin: 0, fontSize: "var(--font-size-md)", lineHeight: "var(--line-height-relaxed)", color: "var(--color-base-content)" }}>
          Patient reported steady improvements in sleep continuity across the four-week observational window. Follow-up cognitive behavioral exercises were completed with 88% adherence. You can review the{" "}
          <a href="#prose-link" onClick={(e) => e.preventDefault()} style={{ color: "var(--color-link)", textDecoration: "underline" }}>
            biometric telemetry logs
          </a>{" "}
          to verify nocturnal awakenings and resting heart rate variability.
        </p>
        <div style={{ padding: "var(--space-3) var(--space-4)", backgroundColor: "var(--color-base-200)", borderLeft: "var(--space-1) solid var(--color-primary)", borderRadius: "var(--radius-sm)" }}>
          <p style={{ margin: 0, fontSize: "var(--font-size-sm)", fontStyle: "italic", color: "var(--color-base-content)" }}>
            “Progressive desensitization exercises showed marked reduction in reported acute anxiety scores during morning check-ins.”
          </p>
        </div>
      </div>
    </Section>
  </div>
);

const meta: Meta = {
  title: "Foundations/Typography",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Typography foundations in Nise DS. The sans family (`--font-sans`: Albert Sans) drives interface controls, " +
          "while the serif family (`--font-serif`: Tiempos Text) carries narrative reading surfaces. Sizes follow an 8-step scale " +
          "from 12px (`--font-size-xs`) to 36px (`--font-size-4xl`). Line heights and measure widths maintain rhythmic flow.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TypeScale: Story = {
  tags: ["!autodocs"],
  render: () => <TypeScaleView />,
};

export const FontFamilies: Story = {
  tags: ["!autodocs"],
  render: () => <FontFamiliesView />,
};

export const FontWeights: Story = {
  tags: ["!autodocs"],
  render: () => <FontWeightsView />,
};

export const EditorialSpecimen: Story = {
  tags: ["!autodocs"],
  render: () => <EditorialSpecimenView />,
};

