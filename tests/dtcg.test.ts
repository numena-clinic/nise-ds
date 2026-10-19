import { describe, it, expect } from "vitest";
import { renderDtcg } from "../tokens/dtcg.mjs";
import { allTokens } from "../tokens/index.mjs";
import { expand, parseColor } from "../tokens/color.mjs";

// Conformance of the generated DTCG 2025.10 document against the Format and
// Color modules: legal names/types, resolvable aliases, value equivalence with
// the canonical CSS source, and the namespaced extension for what the standard
// cannot express.

const NS = "com.numena.nise";
const LAYERS = ["primitive", "semantic", "component"] as const;
const TYPES = new Set([
  "color",
  "dimension",
  "duration",
  "number",
  "fontWeight",
  "fontFamily",
  "cubicBezier",
  "shadow",
]);

interface Mix {
  from: string[];
  percent: number;
}
interface Leaf {
  $type?: string;
  $value?: unknown;
  $extensions?: Record<string, { cssVar?: string; mix?: Mix }>;
}
type Dict = Record<string, unknown>;

const isObj = (v: unknown): v is Dict => typeof v === "object" && v !== null;

// The exporter serializes sRGB components to 6 decimal places (see
// `colorValueFromRgba`), so 5e-7 — half a step at that precision — is the
// tightest tolerance a 6-dp reference can justify.
const DOT = 6;
const srgb6 = (n: number): number => Number((n / 255).toFixed(DOT));

function walk(
  node: Dict,
  path: string[] = [],
  out: { path: string; leaf: Leaf }[] = [],
): { path: string; leaf: Leaf }[] {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("$") || !isObj(v)) continue;
    if ("$value" in v) out.push({ path: [...path, k].join("."), leaf: v as Leaf });
    else walk(v, [...path, k], out);
  }
  return out;
}

function allKeys(node: unknown, out: string[] = []): string[] {
  if (!isObj(node)) return out;
  for (const [k, v] of Object.entries(node)) {
    out.push(k);
    // Do not descend into `$`-keys: `$extensions` holds the intentionally
    // dotted reverse-DNS namespace, not a token name.
    if (!k.startsWith("$")) allKeys(v, out);
  }
  return out;
}

const doc = JSON.parse(renderDtcg()) as Dict;
const leaves = walk(doc);
const rootExt = (doc.$extensions as Dict)[NS] as Dict;
const cssOnly = rootExt.cssOnlyTokens as {
  cssVar: string;
  value: string;
  unit?: string;
  reason: string;
}[];

const cssVarOf = (leaf: Leaf): string => leaf.$extensions?.[NS]?.cssVar ?? "";
const isAlias = (leaf: Leaf): boolean =>
  typeof leaf.$value === "string" && /^\{.+\}$/.test(leaf.$value);

describe("DTCG document shape", () => {
  it("is byte-for-byte deterministic", () => {
    expect(renderDtcg()).toBe(renderDtcg());
  });

  it("has the three layers and a namespaced root extension", () => {
    for (const id of LAYERS) expect(doc[id], id).toBeTypeOf("object");
    expect(rootExt.version).toBe(1);
    expect(rootExt.source).toBe("tokens/*.mjs");
  });

  it("exports 151 typed tokens and records the 3 css-only tokens (154 total)", () => {
    expect(leaves).toHaveLength(151);
    expect(cssOnly).toHaveLength(3);
    expect(leaves.length + cssOnly.length).toBe(Object.keys(allTokens).length);
  });

  it("names every token exactly once, matching a real CSS variable", () => {
    const names = leaves.map(({ leaf }) => cssVarOf(leaf));
    expect(new Set(names).size).toBe(names.length);
    for (const name of names) expect(allTokens).toHaveProperty(name);
  });

  it("emits no reserved `$`-prefixed or alias-shaped token names", () => {
    for (const key of allKeys(doc)) {
      if (key.startsWith("$")) {
        expect(["$description", "$type", "$value", "$extensions"]).toContain(key);
      }
      expect(key).not.toMatch(/[.{}]/);
    }
  });
});

describe("DTCG value conformance", () => {
  const byType = (t: string) => leaves.filter(({ leaf }) => leaf.$type === t);

  it("aliases are references, resolve, and declare no $type (§5.2.2)", () => {
    const paths = new Set(leaves.map(({ path }) => path));
    let count = 0;
    for (const { leaf } of leaves) {
      if (!isAlias(leaf)) continue;
      count += 1;
      expect(leaf.$type, cssVarOf(leaf)).toBeUndefined();
      const target = (leaf.$value as string).slice(1, -1);
      expect(paths.has(target), `${cssVarOf(leaf)} → ${target}`).toBe(true);
    }
    expect(count).toBeGreaterThan(0);
  });

  it("every literal declares a legal DTCG $type", () => {
    for (const { leaf } of leaves) {
      if (isAlias(leaf)) continue;
      expect(TYPES.has(leaf.$type as string), cssVarOf(leaf)).toBe(true);
    }
  });

  it("colours follow the Color module (srgb, 3 components, hex fallback)", () => {
    for (const { leaf } of byType("color")) {
      const v = leaf.$value as {
        colorSpace: string;
        components: number[];
        alpha?: number;
        hex: string;
      };
      expect(v.colorSpace).toBe("srgb");
      expect(v.components).toHaveLength(3);
      for (const c of v.components) {
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(1);
      }
      if (v.alpha !== undefined) {
        expect(v.alpha).toBeGreaterThanOrEqual(0);
        expect(v.alpha).toBeLessThanOrEqual(1);
      }
      expect(v.hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("dimensions use px/rem and durations use ms/s", () => {
    for (const { leaf } of byType("dimension")) {
      expect(["px", "rem"]).toContain((leaf.$value as { unit: string }).unit);
    }
    for (const { leaf } of byType("duration")) {
      expect(["ms", "s"]).toContain((leaf.$value as { unit: string }).unit);
    }
  });

  it("cubicBezier values have four numbers in [0,1]", () => {
    for (const { leaf } of byType("cubicBezier")) {
      const v = leaf.$value as number[];
      expect(v).toHaveLength(4);
      for (const n of v) {
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThanOrEqual(1);
      }
    }
  });

  it("fontWeight values are integers in 1..1000", () => {
    for (const { leaf } of byType("fontWeight")) {
      const v = leaf.$value as number;
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(1000);
    }
  });

  it("shadow composites carry colour, offsets, blur and spread", () => {
    for (const { leaf } of byType("shadow")) {
      const v = leaf.$value as Dict;
      for (const k of ["color", "offsetX", "offsetY", "blur", "spread"]) {
        expect(v[k], `${cssVarOf(leaf)}.${k}`).toBeDefined();
      }
      for (const k of ["offsetX", "offsetY", "blur", "spread"]) {
        expect(["px", "rem"]).toContain((v[k] as { unit: string }).unit);
      }
    }
  });

  it("fontFamily values are non-empty arrays of names", () => {
    for (const { leaf } of byType("fontFamily")) {
      const v = leaf.$value as string[];
      expect(Array.isArray(v)).toBe(true);
      expect(v.length).toBeGreaterThan(0);
      for (const name of v) expect(typeof name).toBe("string");
    }
  });
});

describe("value equivalence with the canonical source", () => {
  it("scalar tokens round-trip back to their CSS value", () => {
    for (const { leaf } of leaves) {
      const name = cssVarOf(leaf);
      const source = expand(name, allTokens);
      const value = leaf.$value;
      switch (leaf.$type) {
        case "dimension":
        case "duration": {
          const d = value as { value: number; unit: string };
          expect(`${d.value}${d.unit}`).toBe(source);
          break;
        }
        case "number":
        case "fontWeight":
          expect(Number(value)).toBe(Number(source));
          break;
        case "cubicBezier":
          expect(`cubic-bezier(${(value as number[]).join(", ")})`).toBe(source);
          break;
        case "color": {
          const c = parseColor(source);
          const v = value as { components: number[]; alpha?: number; hex: string };
          // The hex fallback is the 8-bit sRGB serialization and must match the
          // CSS value exactly.
          const hex = `#${[c.r, c.g, c.b]
            .map((n) => Math.round(n).toString(16).padStart(2, "0"))
            .join("")}`;
          expect(v.hex).toBe(hex);
          expect(v.alpha ?? 1).toBeCloseTo(c.a, 5);
          // A derived `color-mix()` has no exact 8-bit source to compare against
          // here; it is verified against a standards engine below. Literal
          // colours are exact, so their components must equal the channel value
          // at the exporter's precision (no loose byte-rounding slop).
          if (leaf.$extensions?.[NS]?.mix) break;
          expect(v.components).toEqual([c.r, c.g, c.b].map(srgb6));
          break;
        }
        default:
          break;
      }
    }
  });

  // Reference: an independent standards-conformant engine. Chrome resolves each
  // source `color-mix(in srgb, …)` to these sRGB components (getComputedStyle).
  // The reference is quoted to 6 decimal places, so the tolerance is half a step
  // (5e-7) — the tightest a 6-dp reference can justify. `--color-border-strong`
  // lands on an exact .5 channel; its rounding is asserted separately below.
  it("derived colours match browser-computed sRGB components (not byte-quantised)", () => {
    const expected: Record<string, [number, number, number, number]> = {
      "--color-surface-active": [0.837333, 0.816314, 0.858353, 1],
      "--color-text-muted": [0.410667, 0.389333, 0.432, 1],
      "--color-border": [0.861333, 0.856314, 0.866353, 1],
      "--color-border-strong": [0.566667, 0.55098, 0.582353, 1],
      "--color-border-hover": [0.393333, 0.371373, 0.415294, 1],
      "--color-action-hover": [0.278275, 0.122667, 0.458039, 1],
      "--color-action-active": [0.261804, 0.120314, 0.424706, 1],
      "--color-scrim": [0.133333, 0.101961, 0.164706, 0.4],
    };
    for (const [name, [er, eg, eb, ea]] of Object.entries(expected)) {
      const found = leaves.find(({ leaf }) => cssVarOf(leaf) === name);
      const v = found?.leaf.$value as { components: number[]; alpha?: number };
      expect(v.components[0], name).toBeCloseTo(er, DOT);
      expect(v.components[1], name).toBeCloseTo(eg, DOT);
      expect(v.components[2], name).toBeCloseTo(eb, DOT);
      expect(v.alpha ?? 1, `${name} alpha`).toBeCloseTo(ea, DOT);
    }
  });

  // `--color-border-strong`'s green channel is exactly 140.5/255 before
  // rounding. The DTCG component keeps that precise value (6-dp), whereas the
  // 8-bit CSS hex serialization rounds the half up: Math.round(140.5) = 141 →
  // 0x8d. The precise component and the rounded hex must not be conflated.
  it("keeps the half-channel border-strong precise, distinct from its 8-bit hex", () => {
    const found = leaves.find(
      ({ leaf }) => cssVarOf(leaf) === "--color-border-strong",
    );
    const v = found?.leaf.$value as { components: number[]; hex: string };
    expect(v.components[1]).toBeCloseTo(140.5 / 255, DOT);
    expect(v.components[1]).not.toBeCloseTo(141 / 255, DOT);
    expect(v.hex.slice(3, 5)).toBe("8d");
  });
});

describe("extension metadata", () => {
  it("precomputes each derived colour and keeps its mix recipe", () => {
    const derived = leaves.filter(({ leaf }) => leaf.$extensions?.[NS]?.mix);
    expect(derived.map(({ leaf }) => cssVarOf(leaf)).sort()).toEqual([
      "--color-action-active",
      "--color-action-hover",
      "--color-border",
      "--color-border-hover",
      "--color-border-strong",
      "--color-scrim",
      "--color-surface-active",
      "--color-text-muted",
    ]);
    for (const { leaf } of derived) {
      expect(leaf.$type).toBe("color");
      const mix = leaf.$extensions?.[NS]?.mix as Mix;
      expect(mix.from).toHaveLength(2);
      expect(mix.percent).toBeGreaterThan(0);
      expect(mix.percent).toBeLessThanOrEqual(100);
    }
  });

  it("scrim keeps its hue at 40% alpha (premultiplied colour-mix)", () => {
    const scrim = leaves.find(({ leaf }) => cssVarOf(leaf) === "--color-scrim");
    const v = scrim?.leaf.$value as { components: number[]; alpha?: number };
    expect(v.components).toEqual([srgb6(34), srgb6(26), srgb6(42)]);
    expect(v.alpha).toBeCloseTo(0.4, DOT);
  });

  it("records css-only tokens with their original value, unit and reason", () => {
    expect(cssOnly.map((t) => t.cssVar).sort()).toEqual([
      "--letter-spacing-tight",
      "--letter-spacing-wide",
      "--measure-prose",
    ]);
    const tight = cssOnly.find((t) => t.cssVar === "--letter-spacing-tight");
    expect(tight?.value).toBe("-0.01em");
    expect(tight?.unit).toBe("em");
    for (const t of cssOnly) expect(t.reason).toMatch(/px and rem/);
  });

  it("no token references a css-only token", () => {
    const cssOnlyNames = new Set(cssOnly.map((t) => t.cssVar));
    for (const { leaf } of leaves) {
      if (!isAlias(leaf)) continue;
      const target = (leaf.$value as string).slice(1, -1);
      const name = target.split(".").at(-1);
      expect(cssOnlyNames.has(`--${name}`)).toBe(false);
    }
  });
});
