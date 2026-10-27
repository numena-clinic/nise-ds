import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { allTokens, semanticDark } from "../tokens/index.mjs";
import { expand } from "../tokens/color.mjs";
import { space, radii } from "../tokens/primitives.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

console.log("Generating OpenPencil document for Nise Design System...");

// 1. Resolve light and dark token values
const lightMap = {};
const darkTokens = { ...allTokens, ...semanticDark };
const darkMap = {};

for (const name of Object.keys(allTokens)) {
  lightMap[name] = expand(name, allTokens);
}
for (const name of Object.keys(darkTokens)) {
  darkMap[name] = expand(name, darkTokens);
}

// 2. Build OpenPencil Variables
const variables = {};

// Color variables (themed: light & dark)
for (const [name, val] of Object.entries(lightMap)) {
  if (name.startsWith("--color-") || name.startsWith("--neutral-") || name.startsWith("--purple-") ||
      name.startsWith("--cyan-") || name.startsWith("--tangerine-") || name.startsWith("--mint-") ||
      name.startsWith("--citron-") || name.startsWith("--pink-") || name.startsWith("--blue-") ||
      name === "--white" || name === "--ink-plum" || name === "--deep-purple" ||
      name === "--vibrant-purple" || name === "--accent-violet" || name === "--pale-lavender" ||
      name === "--dark-ground" || name === "--dark-panel") {
    const lightVal = val.startsWith("#") ? val : (val.startsWith("rgba") || val.startsWith("rgb") ? val : "#ffffff");
    const darkVal = (darkMap[name] || val);
    const safeDark = darkVal.startsWith("#") ? darkVal : lightVal;

    variables[name] = {
      type: "color",
      value: [
        { value: lightVal, theme: { theme: "light" } },
        { value: safeDark, theme: { theme: "dark" } },
      ],
    };
  }
}

// Spacing variables (numeric pixels)
for (const [name, val] of Object.entries(space)) {
  const px = parseInt(val, 10);
  variables[name] = {
    type: "number",
    value: px,
  };
}

// Radius variables (numeric pixels)
for (const [name, val] of Object.entries(radii)) {
  const px = parseInt(val, 10);
  variables[name] = {
    type: "number",
    value: isNaN(px) ? 9999 : px,
  };
}

// 3. Build Node Helpers
let idCounter = 1;
const nextId = (prefix = "node") => `${prefix}_${idCounter++}`;

function createText(content, { fontSize = 14, fontWeight = 400, fill = "#221A2A", lineHeight, name = "Text" } = {}) {
  return {
    type: "text",
    id: nextId("text"),
    name,
    content,
    fontFamily: "Albert Sans",
    fontSize,
    fontWeight,
    lineHeight: lineHeight ?? Math.round(fontSize * 1.4),
    fill,
  };
}

function createFrame({
  name = "Frame",
  layout = "vertical",
  gap = 0,
  padding = 0,
  fill = "transparent",
  stroke,
  cornerRadius = 0,
  children = [],
  width,
  height,
  alignItems,
  justifyContent,
} = {}) {
  const node = {
    type: "frame",
    id: nextId("frame"),
    name,
    layout,
    gap,
    padding,
    fill,
    cornerRadius,
    children,
  };
  if (width !== undefined) node.width = width;
  if (height !== undefined) node.height = height;
  if (stroke) node.stroke = stroke;
  if (alignItems) node.alignItems = alignItems;
  if (justifyContent) node.justifyContent = justifyContent;
  return node;
}

// 4. Construct Frames
// Frame A: Header / Title Board
const titleBoard = createFrame({
  name: "Nise DS · Cover",
  layout: "vertical",
  gap: 16,
  padding: 40,
  fill: "#221A2A",
  cornerRadius: 12,
  width: 960,
  children: [
    createText("Nise Design System", { fontSize: 32, fontWeight: 700, fill: "#FFFFFF" }),
    createText("Clinical reasoning design system for Numena · AI-Native OpenPencil UI Kit", {
      fontSize: 16,
      fontWeight: 400,
      fill: "#E8D7FD",
    }),
  ],
});

// Frame B: Color Palette Board
function createColorChip(roleName, hex, desc) {
  return createFrame({
    name: roleName,
    layout: "vertical",
    gap: 8,
    padding: 12,
    fill: "#FFFFFF",
    stroke: { align: "inside", thickness: 1, fill: "#dfd8e8" },
    cornerRadius: 8,
    width: 210,
    children: [
      createFrame({
        name: "Swatch",
        fill: hex,
        cornerRadius: 6,
        width: 186,
        height: 64,
        stroke: { align: "inside", thickness: 1, fill: "rgba(0,0,0,0.06)" },
      }),
      createText(roleName, { fontSize: 13, fontWeight: 600, fill: "#221A2A" }),
      createText(hex, { fontSize: 12, fontWeight: 400, fill: "#736486" }),
      desc ? createText(desc, { fontSize: 11, fontWeight: 400, fill: "#8E36F4" }) : null,
    ].filter(Boolean),
  });
}

const colorBoard = createFrame({
  name: "Foundations · Color Palette",
  layout: "vertical",
  gap: 24,
  padding: 32,
  fill: "#F4F1F8",
  cornerRadius: 12,
  width: 960,
  children: [
    createText("Color System (daisyUI-shaped semantic vocabulary)", { fontSize: 20, fontWeight: 700, fill: "#221A2A" }),
    createText("Base Surfaces & Text", { fontSize: 15, fontWeight: 600, fill: "#4C207F" }),
    createFrame({
      name: "Surfaces Row",
      layout: "horizontal",
      gap: 16,
      children: [
        createColorChip("--color-base-100", lightMap["--color-base-100"] || "#FFFFFF", "Page background"),
        createColorChip("--color-base-200", lightMap["--color-base-200"] || "#F4F1F8", "Raised card surface"),
        createColorChip("--color-base-300", lightMap["--color-base-300"] || "#DFD8E8", "Panels and wells"),
        createColorChip("--color-base-content", lightMap["--color-base-content"] || "#221A2A", "Primary text (ink)"),
      ],
    }),
    createText("Actions & Emphasis Roles", { fontSize: 15, fontWeight: 600, fill: "#4C207F" }),
    createFrame({
      name: "Actions Row",
      layout: "horizontal",
      gap: 16,
      children: [
        createColorChip("--color-primary", lightMap["--color-primary"] || "#4C207F", "Primary action (Deep Purple)"),
        createColorChip("--color-secondary", lightMap["--color-secondary"] || "#8E36F4", "Secondary action (Vibrant)"),
        createColorChip("--color-accent", lightMap["--color-accent"] || "#AB62ED", "Accent fill (Violet)"),
        createColorChip("--color-neutral", lightMap["--color-neutral"] || "#221A2A", "Neutral button fill"),
      ],
    }),
    createText("Operational Status Ramps (Machine States)", { fontSize: 15, fontWeight: 600, fill: "#4C207F" }),
    createFrame({
      name: "Status Row",
      layout: "horizontal",
      gap: 16,
      children: [
        createColorChip("--color-success", lightMap["--color-success"] || "#147061", "Mint ramp (Success)"),
        createColorChip("--color-warning", lightMap["--color-warning"] || "#873612", "Citron ramp (Warning)"),
        createColorChip("--color-error", lightMap["--color-error"] || "#D10057", "Pink ramp (Error)"),
        createColorChip("--color-info", lightMap["--color-info"] || "#1F6492", "Blue ramp (Info)"),
      ],
    }),
  ],
});

// Frame C: Spacing Scale Board
const spacingItems = Object.entries(space).map(([name, val]) => {
  const px = parseInt(val, 10);
  const mult = name.replace("--space-", "");
  return createFrame({
    name,
    layout: "horizontal",
    gap: 16,
    padding: [8, 12],
    fill: "#FFFFFF",
    cornerRadius: 4,
    alignItems: "center",
    children: [
      createFrame({ width: 100, layout: "vertical", children: [createText(name, { fontSize: 13, fontWeight: 600, fill: "#4C207F" })] }),
      createFrame({ width: 80, layout: "vertical", children: [createText(`${mult} × 4px`, { fontSize: 12, fill: "#736486" })] }),
      createFrame({ width: 60, layout: "vertical", children: [createText(`${px}px`, { fontSize: 13, fontWeight: 700, fill: "#221A2A" })] }),
      createFrame({
        name: "Bar",
        width: Math.max(px * 3, 4),
        height: 18,
        fill: "#8E36F4",
        cornerRadius: 4,
      }),
    ],
  });
});

const spacingBoard = createFrame({
  name: "Foundations · 4px Spacing Grid",
  layout: "vertical",
  gap: 12,
  padding: 32,
  fill: "#F4F1F8",
  cornerRadius: 12,
  width: 960,
  children: [
    createText("4px Base Spacing Scale (--space-N = N × 4px)", { fontSize: 20, fontWeight: 700, fill: "#221A2A" }),
    createText("Grid multipliers provide optimal micro-hierarchy for dense clinical workspaces.", {
      fontSize: 14,
      fill: "#736486",
    }),
    ...spacingItems,
  ],
});

// Frame D: Components Board (Buttons, Badges, Cards, Inputs)
function createButton({ text, variant = "primary", size = "md" }) {
  const bg = variant === "primary" ? "#4C207F" : variant === "secondary" ? "#FFFFFF" : "#AB62ED";
  const fg = variant === "primary" ? "#FFFFFF" : variant === "secondary" ? "#4C207F" : "#221A2A";
  const stroke = variant === "secondary" ? { align: "inside", thickness: 1, fill: "#4C207F" } : undefined;
  const height = size === "sm" ? 32 : size === "lg" ? 48 : 40;
  const padX = size === "sm" ? 12 : size === "lg" ? 20 : 16;
  const fSize = size === "sm" ? 12 : size === "lg" ? 16 : 14;
  const width = Math.max(height, text.length * 8 + padX * 2);

  return createFrame({
    name: `Button/${variant}/${size}`,
    layout: "horizontal",
    alignItems: "center",
    justifyContent: "center",
    padding: [0, padX],
    height,
    width,
    fill: bg,
    stroke,
    cornerRadius: 4,
    children: [createText(text, { fontSize: fSize, fontWeight: 600, fill: fg })],
  });
}

function createBadge({ text, fill = "#147061", textColor = "#FFFFFF" }) {
  return createFrame({
    name: `Badge/${text}`,
    layout: "horizontal",
    alignItems: "center",
    justifyContent: "center",
    padding: [4, 10],
    height: 24,
    fill,
    cornerRadius: 9999,
    children: [createText(text, { fontSize: 12, fontWeight: 600, fill: textColor })],
  });
}

function createToggle({ text, icon = null, variant = "default", pressed = false, size = "md" }) {
  const height = size === "sm" ? 32 : size === "lg" ? 48 : 40;
  const isOutline = variant === "outline";
  const bg = pressed ? "#AB62ED" : "transparent";
  const fg = pressed ? "#221A2A" : "#4C207F";
  const stroke = isOutline
    ? { align: "inside", thickness: 1, fill: pressed ? "#AB62ED" : "#DFD8E8" }
    : null;
  const padX = text ? (size === "sm" ? 12 : 16) : 0;
  const width = text
    ? Math.max(height, (icon ? 22 : 0) + (text.length * 8) + padX * 2)
    : height;

  const children = [];
  if (icon) {
    children.push(createText(icon, { fontSize: 13, fontWeight: 700, fill: fg }));
  }
  if (text) {
    children.push(createText(text, { fontSize: 13, fontWeight: 500, fill: fg }));
  }

  return createFrame({
    name: `Toggle/${variant}/${pressed ? "pressed" : "unpressed"}`,
    layout: "horizontal",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: [0, padX],
    height,
    width,
    fill: bg,
    stroke,
    cornerRadius: 4,
    children,
  });
}

const componentBoard = createFrame({
  name: "Components · Library Specimens",
  layout: "vertical",
  gap: 28,
  padding: 32,
  fill: "#F4F1F8",
  cornerRadius: 8,
  width: 960,
  children: [
    createText("Component Specimens (Production-Ready)", { fontSize: 20, fontWeight: 700, fill: "#221A2A" }),

    // Buttons Row
    createText("Interactive Buttons", { fontSize: 15, fontWeight: 600, fill: "#4C207F" }),
    createFrame({
      name: "Buttons Gallery",
      layout: "horizontal",
      gap: 16,
      alignItems: "center",
      children: [
        createButton({ text: "Primary Action", variant: "primary", size: "md" }),
        createButton({ text: "Secondary Outline", variant: "secondary", size: "md" }),
        createButton({ text: "Accent Violet", variant: "accent", size: "md" }),
        createButton({ text: "Compact Sm", variant: "primary", size: "sm" }),
        createButton({ text: "Prominent Lg", variant: "primary", size: "lg" }),
      ],
    }),

    // Toggles & Toolbars (shadcn parity)
    createText("Toggles & Toolbars (Bookmark, Type Formatting & Outlines)", { fontSize: 15, fontWeight: 600, fill: "#4C207F" }),
    createFrame({
      name: "Toggles Gallery",
      layout: "horizontal",
      gap: 16,
      alignItems: "center",
      children: [
        createToggle({ icon: "★", variant: "default", pressed: false }),
        createToggle({ icon: "★", variant: "outline", pressed: true }),
        createToggle({ icon: "I", text: "Italic", variant: "default", pressed: true }),
        createToggle({ text: "Bookmark", variant: "outline", pressed: false }),
        createFrame({
          name: "Formatting Toolbar (ToggleGroup)",
          layout: "horizontal",
          gap: 4,
          padding: 4,
          fill: "#FFFFFF",
          stroke: { align: "inside", thickness: 1, fill: "#DFD8E8" },
          cornerRadius: 4,
          children: [
            createToggle({ icon: "B", variant: "outline", pressed: true, size: "sm" }),
            createToggle({ icon: "I", variant: "outline", pressed: true, size: "sm" }),
            createToggle({ icon: "U", variant: "outline", pressed: false, size: "sm" }),
          ],
        }),
      ],
    }),

    // Badges Row
    createText("Status Badges (WCAG AA Compliant)", { fontSize: 15, fontWeight: 600, fill: "#4C207F" }),
    createFrame({
      name: "Badges Gallery",
      layout: "horizontal",
      gap: 12,
      alignItems: "center",
      children: [
        createBadge({ text: "Confirmed · Active", fill: "#147061", textColor: "#FFFFFF" }),
        createBadge({ text: "Attention Required", fill: "#873612", textColor: "#FFFFFF" }),
        createBadge({ text: "Critical Alert", fill: "#D10057", textColor: "#FFFFFF" }),
        createBadge({ text: "Informational", fill: "#1F6492", textColor: "#FFFFFF" }),
        createBadge({ text: "Neutral Metadata", fill: "#DFD8E8", textColor: "#221A2A" }),
      ],
    }),

    // Card Container
    createText("Clinical Reasoning Container Card", { fontSize: 15, fontWeight: 600, fill: "#4C207F" }),
    createFrame({
      name: "Patient Card Specimen",
      layout: "vertical",
      gap: 16,
      padding: 24,
      fill: "#FFFFFF",
      stroke: { align: "inside", thickness: 1, fill: "#DFD8E8" },
      cornerRadius: 8,
      width: 520,
      children: [
        createFrame({
          layout: "horizontal",
          justifyContent: "space-between",
          alignItems: "center",
          children: [
            createText("Diagnostic Assessment", { fontSize: 16, fontWeight: 700, fill: "#221A2A" }),
            createBadge({ text: "Session 4", fill: "#DFD8E8", textColor: "#221A2A" }),
          ],
        }),
        createText("Client presents with consistent emotional regulation scores across diagnostic milestones.", {
          fontSize: 14,
          fill: "#736486",
          lineHeight: 20,
        }),
        createFrame({
          layout: "horizontal",
          gap: 12,
          children: [
            createButton({ text: "View Clinical Notes", variant: "primary", size: "sm" }),
            createButton({ text: "Edit Indicators", variant: "secondary", size: "sm" }),
          ],
        }),
      ],
    }),
  ],
});

// Master Canvas
const canvas = createFrame({
  name: "Nise Design System Canvas",
  layout: "vertical",
  gap: 40,
  padding: 48,
  fill: "#EEE9F3",
  children: [titleBoard, colorBoard, spacingBoard, componentBoard],
});

// Final PenDocument structure
const penDoc = {
  version: "1.0",
  themes: {
    theme: ["light", "dark"],
  },
  variables,
  children: [canvas],
};

const outputContent = JSON.stringify(penDoc, null, 2);

// Write to workspace root and dist
const rootPath = resolve(root, "nise-ds.pen");
const distPath = resolve(root, "tokens/dist/nise-ds.pen");

writeFileSync(rootPath, outputContent, "utf8");
writeFileSync(distPath, outputContent, "utf8");

console.log(`OpenPencil document written successfully:`);
console.log(`  · ${rootPath}`);
console.log(`  · ${distPath}`);
console.log(`  Variables: ${Object.keys(variables).length} (colors, spacing, radii)`);
