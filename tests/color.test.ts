import { describe, it, expect } from "vitest";
import {
  parseColor,
  evalMix,
  expand,
  rgbToOklch,
  oklchToRgb,
  toHex,
} from "../tokens/color.mjs";
import { allTokens, themeOverrides } from "../tokens/index.mjs";

// The colour maths is shared by the validator and the Theme Explorer, so these
// lock the semantics both rely on: CSS Color 4 parsing (hex, rgb/rgba, oklch)
// and CSS Color 5 §3.5 premultiplied-alpha `color-mix` interpolation.

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

  it("parses oklch() with lightness, chroma and hue", () => {
    const c = parseColor("oklch(0.5 0.1 200)");
    expect(c).not.toBeNull();
    expect(c!.a).toBe(1);
    // mid teal (hue 200): red is the smallest channel, green/blue near-equal.
    expect(c!.r).toBeLessThan(c!.g);
    expect(Math.round(c!.r)).toBe(0);
    expect(Math.round(c!.g)).toBe(113);
    expect(Math.round(c!.b)).toBe(118);
  });

  it("accepts a percentage lightness and an optional alpha in oklch()", () => {
    expect(parseColor("oklch(50% 0 0)")).toEqual(parseColor("oklch(0.5 0 0)"));
    expect(parseColor("oklch(0.5 0.1 200 / 0.4)")!.a).toBeCloseTo(0.4, 6);
  });

  it("clamps an out-of-gamut oklch() into sRGB (never out of range)", () => {
    const c = parseColor("oklch(0.5 0.4 20)")!;
    for (const ch of [c.r, c.g, c.b]) {
      expect(ch).toBeGreaterThanOrEqual(0);
      expect(ch).toBeLessThanOrEqual(255);
    }
  });

  it("returns null for values it cannot parse", () => {
    expect(parseColor("hsl(0 0% 0%)")).toBeNull();
    expect(parseColor("totally-not-a-colour")).toBeNull();
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
    const out = evalMix("color-mix(in srgb, hsl(0 0% 0%) 40%, transparent)", (m: string) =>
      errors.push(m),
    );
    expect(out).toBe("#000000");
    expect(errors).toHaveLength(1);
  });
});

describe("derived semantic colours (regression)", () => {
  const cases: Record<string, string> = {
    "--color-surface-active": "#e0dfe3",
    "--color-text-muted": "#69666d",
    "--color-border": "#e0dfe3",
    "--color-border-strong": "#817f85",
    "--color-border-hover": "#69666d",
    "--color-action-hover": "#44097e",
    "--color-action-active": "#290053",
    "--color-scrim": "rgba(33, 30, 37, 0.4)",
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

describe("oklch round-trip", () => {
  it("reproduces the eight-bit channels of the brand anchors", () => {
    // Generation happens in OKLCH; sRGB → OKLCH → sRGB must land on the same
    // bytes (only letter-case may differ).
    for (const hex of ["#4C207F", "#8E36F4", "#25E4F8", "#F57A44", "#EEE9F3"]) {
      const { r, g, b } = parseColor(hex)!;
      const back = toHex(oklchToRgb(rgbToOklch({ r, g, b })));
      expect(back.toLowerCase()).toBe(hex.toLowerCase());
    }
  });

  it("resolves a generated scale step to its emitted hex", () => {
    expect(expand("--purple-600", allTokens)).toBe("#935de1");
    expect(expand("--neutral-950", allTokens)).toBe("#211e25");
  });
});

describe("dark theme overrides", () => {
  const dark = { ...allTokens, ...themeOverrides.dark };

  it("maps the same role names onto the dark ground", () => {
    expect(expand("--color-surface", dark)).toBe("#211e25");
    expect(expand("--color-text", dark)).toBe("#faf8fc");
  });

  it("brightens the action and deepens the shadow", () => {
    expect(expand("--color-action", dark)).toBe("#aa7fef");
    expect(expand("--shadow-md", dark)).toContain("rgb(0 0 0");
  });
});
