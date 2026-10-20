import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { colorTokens, colorMeta, brandAnchors, groundAnchors, authoredFamilies, scales } from "../../tokens/palette.mjs";
import { formatOklch } from "../../tokens/color.mjs";
import { semanticGroups, darkGroups } from "../../tokens/index.mjs";

/** One colour primitive: name, resolved sRGB hex, OKLCH source. */
interface Chip {
  name: string;
  hex: string;
  oklch: string;
  label?: string;
}

const oklchOf = (name: string) => {
  const meta = colorMeta[name];
  return meta ? formatOklch(meta.oklch, 3) : "";
};

const anchorChips: Chip[] = brandAnchors.map((anchor: { name: string }) => ({
  name: anchor.name,
  hex: colorTokens[anchor.name],
  oklch: oklchOf(anchor.name),
}));

const groundChips: Chip[] = groundAnchors.map((anchor: { name: string }) => ({
  name: anchor.name,
  hex: colorTokens[anchor.name],
  oklch: oklchOf(anchor.name),
}));

const GENERATED_NOTE =
  "Generated in OKLCH; every family shares the same lightness steps, so ramps compare step for step.";
const AUTHORED_NOTE =
  "Authored (decisions.md P4): pinned to published candidate values rather than generated, " +
  "because a neon accent and a near-black surface share one family. No interpolation may move a pin.";

const scaleFamilies: Array<{ label: string; chips: Chip[]; note: string }> = (
  Object.entries(scales) as Array<[string, Record<string, { oklch: { l: number; c: number; h: number }; hex: string }>]>
).map(([family, scale]) => ({
  label: family.charAt(0).toUpperCase() + family.slice(1),
  note: authoredFamilies.has(family) ? AUTHORED_NOTE : GENERATED_NOTE,
  chips: Object.entries(scale).map(([step, value]) => ({
    name: `--${family}-${step}`,
    label: step,
    hex: value.hex,
    oklch: formatOklch(value.oklch, 3),
  })),
}));

const card: CSSProperties = {
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  overflow: "hidden",
};

const sectionStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: "var(--space-3)" };
const headingStyle: CSSProperties = { margin: 0, fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)" };
const noteStyle: CSSProperties = { margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" };
const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: "var(--space-3)",
};

const ChipGrid = ({ chips }: { chips: Chip[] }) => (
  <div style={gridStyle}>
    {chips.map((chip) => (
      <div key={chip.name} style={card}>
        <div style={{ height: 72, backgroundColor: `var(${chip.name})` }} />
        <div style={{ padding: "var(--space-2) var(--space-3)", fontSize: "var(--font-size-xs)" }}>
          <div style={{ fontWeight: "var(--font-weight-semibold)" }}>{chip.name}</div>
          <div>{chip.hex}</div>
          <div style={{ color: "var(--color-text-muted)" }}>{chip.oklch}</div>
        </div>
      </div>
    ))}
  </div>
);

/** A scale read left→right as one ramp, so lightness is comparable step for step. */
const Ramp = ({ chips }: { chips: Chip[] }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
    <div style={{ display: "flex", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
      {chips.map((chip) => (
        <div
          key={chip.name}
          title={`${chip.name} · ${chip.hex} · ${chip.oklch}`}
          style={{ flex: 1, height: 64, backgroundColor: `var(${chip.name})` }}
        />
      ))}
    </div>
    <div style={{ display: "flex" }}>
      {chips.map((chip) => (
        <div
          key={chip.name}
          style={{
            flex: 1,
            overflow: "hidden",
            textAlign: "center",
            whiteSpace: "nowrap",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-muted)",
          }}
        >
          <div style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-semibold)" }}>
            {chip.label ?? chip.name}
          </div>
          <div>{chip.hex}</div>
        </div>
      ))}
    </div>
  </div>
);

const Section = ({ title, note, children }: { title: string; note?: string; children: ReactNode }) => (
  <section style={sectionStyle}>
    <header>
      <h3 style={headingStyle}>{title}</h3>
      {note ? <p style={noteStyle}>{note}</p> : null}
    </header>
    {children}
  </section>
);

const PaletteView = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
    <Section
      title="Brand anchors"
      note="The ten brand hex, unchanged (numena-brand color.md §2). Artwork and marketing surfaces use these directly; product components do not — they use the Semantic roles story below (docs/tokens.md rule 2)."
    >
      <ChipGrid chips={anchorChips} />
    </Section>
    <Section
      title="Dark ground anchors"
      note="The pinned ladder the dark theme reads from: the page, the brand ink as the raised step, the strong panel. The dark page is --dark-ground (decisions.md P4)."
    >
      <ChipGrid chips={groundChips} />
    </Section>
    {scaleFamilies.map((family) => (
      <Section key={family.label} title={`${family.label} scale`} note={family.note}>
        <Ramp chips={family.chips} />
      </Section>
    ))}
  </div>
);

interface RoleGroup {
  label: string;
  note?: string;
  tokens: Record<string, string>;
}

const RoleGrid = ({ entries }: { entries: Array<[string, string]> }) => (
  <div style={gridStyle}>
    {entries.map(([name, ref]) => (
      <div key={name} style={card}>
        <div style={{ height: 64, backgroundColor: `var(${name})` }} />
        <div style={{ padding: "var(--space-2) var(--space-3)", fontSize: "var(--font-size-xs)" }}>
          <div style={{ fontWeight: "var(--font-weight-semibold)" }}>{name}</div>
          <div>{ref}</div>
        </div>
      </div>
    ))}
  </div>
);

/** Roles grouped by meaning; keeps the authored order within a group. */
const roleGroups = (groups: RoleGroup[]) =>
  groups
    .map((group) => ({
      ...group,
      entries: Object.entries(group.tokens).filter(([name]) => name.startsWith("--color-")),
    }))
    .filter((group) => group.entries.length > 0);

/** The theme the toolbar is currently showing: `data-theme` if set, else the OS
 * preference. Re-reads when either changes, so the references track the theme. */
function useActiveTheme(): "light" | "dark" {
  const read = (): "light" | "dark" => {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") return attr;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };
  const [theme, setTheme] = useState(read);
  useEffect(() => {
    const update = () => setTheme(read());
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", update);
    update();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, []);
  return theme;
}

const SemanticRolesView = () => {
  const theme = useActiveTheme();
  const groups = roleGroups(theme === "dark" ? (darkGroups as RoleGroup[]) : (semanticGroups as RoleGroup[]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <p style={noteStyle}>
        One contract of role names; this is the <strong>{theme}</strong> mapping, so use the
        Theme toolbar to see the other. The reference under each role is the primitive that
        mapping points at.
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
          padding: "var(--space-4)",
          backgroundColor: "var(--color-surface)",
          borderRadius: "var(--radius-md)",
        }}
      >
        {groups.map((group) => (
          <Section key={group.label} title={group.label} note={group.note}>
            <RoleGrid entries={group.entries} />
          </Section>
        ))}
      </div>
    </div>
  );
};

const meta: Meta = {
  title: "Foundations/Colour",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Colour comes from the token source, not from a hand-kept list. The " +
          "Palette story groups the ten brand anchors (numena-brand color.md §2, " +
          "unchanged), the two pinned dark-ground anchors, and every scale — " +
          "generated OKLCH families and the four authored operational families " +
          "(decisions.md P4) — each with its resolved sRGB hex and OKLCH source. " +
          "The Semantic roles story groups the " +
          "roles by meaning and follows the preview theme (use the Theme toolbar): " +
          "the reference under each swatch is the primitive that the active mapping " +
          "points at. Accents remain categorical, never verdicts (color.md §4); " +
          "the success / warning / error / info roles exist for operational states " +
          "only, and read from the deep end of each ramp in light because a neon " +
          "is not legible on a pale panel.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Palette: Story = { render: () => <PaletteView /> };

export const SemanticRoles: Story = { render: () => <SemanticRolesView /> };
