import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, useMemo, type CSSProperties, type ReactNode } from "react";
import { layers, allTokens } from "../../tokens/index.mjs";
import { refsOf, findCycles } from "../../tokens/graph.mjs";

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

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "var(--font-size-xs)",
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
  padding: "var(--space-2) var(--space-3)",
  borderBottom: "1px solid var(--color-border)",
  verticalAlign: "middle",
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

interface TokenRow {
  name: string;
  layer: "primitive" | "semantic" | "component";
  raw: string;
  refs: string[];
}

const allRows: TokenRow[] = (layers as Array<{ id: string; groups: Array<{ tokens: Record<string, string> }> }>).flatMap((layer) =>
  layer.groups.flatMap((group) =>
    (Object.entries(group.tokens) as Array<[string, string]>).map(([name, raw]) => ({
      name,
      layer: layer.id as "primitive" | "semantic" | "component",
      raw,
      refs: refsOf(raw),
    })),
  ),
);

const LayerArchitectureView = () => {
  const cycles = useMemo(() => findCycles(allTokens), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <Section
        title="Four Layers with Downward Enforcement"
        note="The token architecture enforces a strict downward dependency chain (decisions.md D4). References pointing sideways or upward are rejected at author time."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-4)" }}>
          <div
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
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-bold)", color: "var(--color-primary)" }}>1. Primitive</span>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Raw literals</span>
            </div>
            <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-base-content)" }}>
              Raw values with zero opinion about use. May not contain <code style={codeStyle}>var()</code> or <code style={codeStyle}>color-mix()</code>.
            </p>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              Examples: <code style={codeStyle}>--deep-purple</code>, <code style={codeStyle}>--space-4</code>, <code style={codeStyle}>--radius-md</code>
            </div>
          </div>

          <div
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
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-bold)", color: "var(--color-secondary)" }}>2. Semantic</span>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Interface roles</span>
            </div>
            <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-base-content)" }}>
              Functional interface roles. May only reference primitives via <code style={codeStyle}>var()</code> or explicit <code style={codeStyle}>color-mix()</code>.
            </p>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              Examples: <code style={codeStyle}>--color-primary</code>, <code style={codeStyle}>--color-base-100</code>, <code style={codeStyle}>--color-border</code>
            </div>
          </div>

          <div
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
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-bold)", color: "var(--color-accent)" }}>3. Themes</span>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Ground remapping</span>
            </div>
            <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-base-content)" }}>
              Not a duplicate token list. Re-points the same role names onto dark ground (<code style={codeStyle}>--dark-ground</code>) while guaranteeing contrast.
            </p>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              Scoped: <code style={codeStyle}>[data-theme="dark"]</code>
            </div>
          </div>

          <div
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
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-bold)", color: "var(--color-neutral)" }}>4. Component</span>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Per-component slots</span>
            </div>
            <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-base-content)" }}>
              Slots specific to a component pattern. May reference primitives, semantics, or shared component slots.
            </p>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              Examples: <code style={codeStyle}>--button-height-md</code>, <code style={codeStyle}>--control-height-md</code>
            </div>
          </div>
        </div>

        <div style={{ padding: "var(--space-3) var(--space-4)", backgroundColor: "var(--color-base-200)", borderRadius: "var(--radius-sm)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-base-content)" }}>
            <strong>Mathematical Acyclicity Check:</strong> Verified by <code style={codeStyle}>tokens/graph.mjs</code>
          </span>
          <span
            style={{
              padding: "var(--space-1) var(--space-3)",
              backgroundColor: cycles.length === 0 ? "var(--color-base-100)" : "var(--color-error)",
              color: cycles.length === 0 ? "var(--color-success)" : "var(--color-error-content)",
              borderRadius: "var(--radius-sm)",
              fontWeight: "var(--font-weight-semibold)",
              fontSize: "var(--font-size-xs)",
              border: "var(--border-width) solid var(--color-border)",
            }}
          >
            {cycles.length === 0 ? "✓ 0 Cycles Detected" : `✗ ${cycles.length} Cycle(s)`}
          </span>
        </div>
      </Section>
    </div>
  );
};

const ReferenceExplorerView = () => {
  const [query, setQuery] = useState("");
  const [layerFilter, setLayerFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allRows.filter((r) => {
      if (layerFilter !== "all" && r.layer !== layerFilter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.raw.toLowerCase().includes(q) ||
        r.refs.some((ref) => ref.toLowerCase().includes(q))
      );
    });
  }, [query, layerFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <Section
        title="Live Token Dependency Explorer"
        note="Inspect all 200+ design tokens across layers, their raw definitions, and their direct dependency references."
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)", alignItems: "center", marginBottom: "var(--space-2)" }}>
          <input
            type="search"
            placeholder="Search tokens, raw values, or references..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: "220px",
              padding: "var(--space-2) var(--space-3)",
              backgroundColor: "var(--color-base-100)",
              border: "var(--border-width-strong) solid var(--color-border-strong)",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-base-content)",
            }}
          />

          <div style={{ display: "flex", gap: "var(--space-1)" }}>
            {(["all", "primitive", "semantic", "component"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLayerFilter(l)}
                style={{
                  padding: "var(--space-2) var(--space-3)",
                  backgroundColor: layerFilter === l ? "var(--color-primary)" : "var(--color-base-200)",
                  color: layerFilter === l ? "var(--color-primary-content)" : "var(--color-base-content)",
                  border: "var(--border-width) solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  fontSize: "var(--font-size-xs)",
                  textTransform: "capitalize",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxHeight: "560px", overflowY: "auto", border: "var(--border-width) solid var(--color-border)", borderRadius: "var(--radius-sm)" }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: "var(--color-base-200)", position: "sticky", top: 0 }}>
                <th style={thStyle}>Token Name</th>
                <th style={thStyle}>Layer</th>
                <th style={thStyle}>Raw Definition</th>
                <th style={thStyle}>Direct Dependencies</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.name}>
                  <td style={tdStyle}>
                    <code style={codeStyle}>{row.name}</code>
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "var(--space-1) var(--space-2)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "var(--font-size-xs)",
                        textTransform: "uppercase",
                        fontWeight: "var(--font-weight-medium)",
                        backgroundColor:
                          row.layer === "primitive"
                            ? "var(--color-base-300)"
                            : row.layer === "semantic"
                            ? "var(--color-base-200)"
                            : "var(--color-base-100)",
                        color: "var(--color-base-content)",
                      }}
                    >
                      {row.layer}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <code style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                      {row.raw}
                    </code>
                  </td>
                  <td style={tdStyle}>
                    {row.refs.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)" }}>
                        {row.refs.map((r) => (
                          <span
                            key={r}
                            style={{
                              padding: "var(--space-1) var(--space-2)",
                              backgroundColor: "var(--color-base-200)",
                              border: "var(--border-width) solid var(--color-border)",
                              borderRadius: "var(--radius-sm)",
                              fontFamily: "monospace",
                              fontSize: "var(--font-size-xs)",
                              color: "var(--color-secondary)",
                            }}
                          >
                            → {r.replace(/^--/, "")}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: "var(--color-text-muted)" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
          Showing {filtered.length} of {allRows.length} total tokens.
        </div>
      </Section>
    </div>
  );
};

const meta: Meta = {
  title: "Foundations/Token graph",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The token reference graph in Nise DS. Documents the four layers (primitive → semantic → themes → component) " +
          "and guarantees acyclicity mathematically using DFS graph traversal.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LayerArchitecture: Story = {
  tags: ["!autodocs"],
  render: () => <LayerArchitectureView />,
};

export const ReferenceExplorer: Story = {
  tags: ["!autodocs"],
  render: () => <ReferenceExplorerView />,
};

