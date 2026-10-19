import { describe, it, expect } from "vitest";
import { parseColor, evalMix, expand } from "../tokens/color.mjs";
import { allTokens } from "../tokens/index.mjs";

// The colour maths is shared by the validator and the Theme Explorer, so these
// lock the semantics both rely on: CSS Color 4 parsing (hex + rgb/rgba) and
// CSS Color 5 §3.5 premultiplied-alpha `color-mix` interpolation.

describe("parseColor", () => {
  it("parses 6-digit hex as opaque", () => {
    expect(parseColor("#221A2A")).toEqual({ r: 34, g: 26, b: 42, a: 1 });
  });

  it("parses 3- and 4-digit hex, expanding the nibbles", () => {
    expect(parseColor("#abc")).toEqual({ r: 0xaa, g: 0xbb, b: 0xcc, a: 1 });
    expect(parseColor("#abc8").a).toBeCloseTo(0x88 / 255, 6);
  });

  it("parses 8-digit hex alpha", () => {
    const c = parseColor("#221A2A66");
    expect({ r: c.r, g: c.g, b: c.b }).toEqual({ r: 34, g: 26, b: 42 });
    expect(c.a).toBeCloseTo(0x66 / 255, 6);
  });

  it("parses `transparent` as fully transparent black", () => {
    // CSS Color 4: transparent black is rgb(0 0 0 / 0%).
    expect(parseColor("transparent")).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    expect(parseColor("TRANSPARENT")).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });

  it("parses modern and legacy rgb()/rgba() syntaxes", () => {
    expect(parseColor("rgb(34 26 42 / 0.06)")).toEqual({
      r: 34,
      g: 26,
      b: 42,
      a: 0.06,
    });
    expect(parseColor("rgba(34, 26, 42, 0.4)")).toEqual({
      r: 34,
      g: 26,
      b: 42,
      a: 0.4,
    });
    expect(parseColor("rgb(34 26 42)")).toEqual({ r: 34, g: 26, b: 42, a: 1 });
  });

  it("scales percentage channels and alpha", () => {
    const c = parseColor("rgb(50% 50% 50% / 50%)");
    expect(c.r).toBeCloseTo(127.5, 6);
    expect(c.a).toBeCloseTo(0.5, 6);
  });

  it("returns null for values it cannot parse", () => {
    expect(parseColor("oklch(0.5 0.1 200)")).toBeNull();
  });
});

describe("evalMix", () => {
  it("leaves an opaque 50/50 mix as a 6-digit hex (unchanged behaviour)", () => {
    expect(evalMix("color-mix(in srgb, #221A2A 50%, #FFFFFF)")).toBe("#918d95");
  });

  it("mix with `transparent` keeps the hue and sets alpha (premultiplied)", () => {
    expect(evalMix("color-mix(in srgb, #221A2A 40%, transparent)")).toBe(
      "rgba(34, 26, 42, 0.4)",
    );
  });

  it("does not call onError for a valid transparent mix", () => {
    const errors: string[] = [];
    evalMix("color-mix(in srgb, #221A2A 40%, transparent)", (m: string) =>
      errors.push(m),
    );
    expect(errors).toEqual([]);
  });

  it("reports unevaluable mixes and falls back to black", () => {
    const errors: string[] = [];
    const out = evalMix("color-mix(in srgb, oklch(0 0 0) 40%, transparent)", (m: string) =>
      errors.push(m),
    );
    expect(out).toBe("#000000");
    expect(errors).toHaveLength(1);
  });
});

describe("derived semantic colours (regression)", () => {
  const cases: Record<string, string> = {
    "--color-surface-active": "#d6d0db",
    "--color-text-muted": "#69636e",
    "--color-border": "#dcdadd",
    "--color-border-strong": "#918d95",
    "--color-border-hover": "#645f6a",
    "--color-action-hover": "#471f75",
    "--color-action-active": "#431f6c",
    "--color-scrim": "rgba(34, 26, 42, 0.4)",
  };

  for (const [name, expected] of Object.entries(cases)) {
    it(`resolves ${name} to ${expected}`, () => {
      expect(expand(name, allTokens)).toBe(expected);
    });
  }

  it("resolves every derived colour without an error", () => {
    const errors: string[] = [];
    for (const name of Object.keys(cases)) {
      expand(name, allTokens, [name], (m: string) => errors.push(m));
    }
    expect(errors).toEqual([]);
  });
});
