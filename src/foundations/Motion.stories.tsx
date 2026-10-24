import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "../../tokens/primitives.mjs";

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

const DURATIONS = [
  { name: "--duration-fast", value: motion["--duration-fast"], usage: "Micro-interactions, button hover/press states, checkbox checks, tooltip reveals" },
  { name: "--duration-medium", value: motion["--duration-medium"], usage: "Dropdown select opens, collapsible accordion folds, tab switches, toast reveals" },
  { name: "--duration-slow", value: motion["--duration-slow"], usage: "Modal dialog backdrops, full-sheet drawer slides, page-level transitions" },
];

const EASINGS = [
  { name: "--ease-standard", value: motion["--ease-standard"], role: "Standard natural acceleration and deceleration for interface state changes" },
  { name: "--ease-entrance", value: motion["--ease-entrance"], role: "Decelerated entry curve for incoming overlays, modals, and tooltips" },
];

const DurationsView = () => {
  const [active, setActive] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <Section
        title="Temporal Restraint: Durations"
        note="Nise motion is restrained and functional. Click 'Trigger Motion Test' or hover each card to feel the transition."
      >
        <div style={{ marginBottom: "var(--space-3)" }}>
          <button
            type="button"
            onClick={() => setActive(!active)}
            style={{
              padding: "var(--space-2) var(--space-4)",
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-content)",
              border: "var(--border-width) solid var(--color-primary-edge)",
              borderRadius: "var(--radius-sm)",
              boxShadow: "var(--shadow-lip)",
              cursor: "pointer",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            Trigger Motion Test ({active ? "Active" : "Resting"})
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-4)" }}>
          {DURATIONS.map((d) => (
            <div
              key={d.name}
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
                <code style={codeStyle}>{d.name}</code>
                <strong>{d.value}</strong>
              </div>

              {/* Transition track */}
              <div
                style={{
                  height: "36px",
                  backgroundColor: "var(--color-base-100)",
                  borderRadius: "var(--radius-sm)",
                  padding: "var(--space-1)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: "28px",
                    backgroundColor: "var(--color-primary)",
                    borderRadius: "var(--radius-sm)",
                    transform: active ? "translateX(200px)" : "translateX(0)",
                    transition: `transform var(${d.name}) var(--ease-standard)`,
                  }}
                />
              </div>

              <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                {d.usage}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

const EasingsView = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
    <Section
      title="Easing Curves"
      note="Cubic bezier mathematical profiles ensuring responsive start and smooth settling."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-4)" }}>
        {EASINGS.map((e) => (
          <div
            key={e.name}
            style={{
              padding: "var(--space-4)",
              backgroundColor: "var(--color-base-200)",
              border: "var(--border-width) solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <code style={codeStyle}>{e.name}</code>
            </div>
            <code style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{e.value}</code>
            <p style={{ margin: "var(--space-2) 0 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-base-content)" }}>
              {e.role}
            </p>
          </div>
        ))}
      </div>
    </Section>
  </div>
);

const meta: Meta = {
  title: "Foundations/Motion",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Motion principles and foundations in Nise DS. Governed by temporal restraint: three durations " +
          "(`--duration-fast`, `--duration-medium`, `--duration-slow`) and two curves (`--ease-standard`, `--ease-entrance`).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Durations: Story = { render: () => <DurationsView /> };
export const Easings: Story = { render: () => <EasingsView /> };
