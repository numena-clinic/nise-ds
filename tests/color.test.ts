import { describe, it, expect } from "vitest";
import {
  parseColor,
  evalMix,
  expand,
  rgbToOklch,
  oklchToRgb,
  toHex,
} from "../tokens/color.mjs";
import { allTokens, themeOverrides, semantic } from "../tokens/index.mjs";
import {
  functionalFamilies,
  groundAnchors,
  brandAnchors,
  colorTokens,
  colorMeta,
} from "../tokens/palette.mjs";

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
    // The dark page IS the published dark ground (tokens/palette.mjs), not a
    // neutral step: it is the value the base ladder is pinned around.
    expect(expand("--color-surface", dark)).toBe("#17121D");
    expect(expand("--color-base-200", dark)).toBe("#221A2A"); // the brand ink
    expect(expand("--color-text", dark)).toBe("#faf8fc");
  });

  it("brightens the action and deepens the shadow", () => {
    expect(expand("--color-action", dark)).toBe("#aa7fef");
    expect(expand("--shadow-md", dark)).toContain("rgb(0 0 0");
  });
});

// ── the authored operational families (docs/decisions.md P4) ─────────────────
//
// mint / citron / pink / teal are pinned to published candidate values rather
// than generated from the shared lightness curve. The one thing that must never
// happen is a regeneration moving an anchor, so the pins are asserted verbatim.

describe("authored functional ramps", () => {
  const stepOrder = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

  it("keeps every published pin verbatim, to the unit", () => {
    // The token source is plain JS; this is the one seam where the pin table
    // crosses into the typed test, so it is cast once, here.
    const ramps = functionalFamilies as Record<string, Record<string, string>>;
    for (const [family, pins] of Object.entries(ramps)) {
      for (const [step, hex] of Object.entries(pins)) {
        expect(colorTokens[`--${family}-${step}`], `${family}-${step}`).toBe(hex);
      }
    }
  });

  it("keeps the dark ground anchors verbatim, with the brand ink between them", () => {
    for (const { name, hex } of groundAnchors) expect(colorTokens[name]).toBe(hex);
    expect(colorTokens["--dark-ground"]).toBe("#17121D");
    expect(colorTokens["--ink-plum"]).toBe("#221A2A"); // color.md §2, unchanged
    expect(colorTokens["--dark-panel"]).toBe("#2D2238");
    expect(new Set([...brandAnchors, ...groundAnchors].map((a) => a.name)).size).toBe(12);
  });

  it("steps monotonically darker down every ramp", () => {
    for (const family of Object.keys(functionalFamilies)) {
      const lightness = stepOrder.map((step) => colorMeta[`--${family}-${step}`].oklch.l);
      for (let i = 1; i < lightness.length; i += 1) {
        expect(lightness[i], `${family}-${stepOrder[i]}`).toBeLessThan(lightness[i - 1]);
      }
    }
  });

  it("stays inside its own hue family, so info never collides with brand cyan", () => {
    const hueOf = (name: string) => colorMeta[name].oklch.h;
    // vibrant-cyan is 206.5°; the info family is pushed bluer on purpose.
    expect(hueOf("--teal-500")).toBeGreaterThan(hueOf("--vibrant-cyan"));
    // The separation the light theme actually reads is in the deep steps:
    // info sources teal-800 (218.8°) against secondary's cyan-700 (204.1°),
    // 14.7° apart (ΔE .060 in OKLab). The bright pair is within a JND by
    // design — roles and form, not hue, separate it in dark; measured in
    // decisions.md P4, which also carries the contingency if both ever meet.
    expect(hueOf("--teal-800") - hueOf("--cyan-700")).toBeGreaterThanOrEqual(12);
    for (const family of Object.keys(functionalFamilies)) {
      for (const step of ["50", "500", "950"]) {
        const h = hueOf(`--${family}-${step}`);
        expect(h, `${family}-${step}`).toBeGreaterThanOrEqual(0);
        expect(h).toBeLessThan(360);
      }
    }
  });

  it("keeps the warm family on its brand anchor's hue", () => {
    const hueOf = (name: string) => colorMeta[name].oklch.h;
    // vibrant-tangerine measures 42.9°; the 400–500 steps must sit on it
    // (41.8° / 43.7° with the +10° warm shift), so a family-hue edit cannot
    // quietly drift the ramp toward golden-amber, a hue the brand does not have.
    for (const step of ["400", "500"]) {
      const drift = Math.abs(hueOf(`--tangerine-${step}`) - hueOf("--vibrant-tangerine"));
      expect(drift, `tangerine-${step}`).toBeLessThan(2);
    }
  });
});

// A theme is a mapping, never a second token set: it may only re-point role
// names the light contract already declares. With the operational roles added,
// that claim needs proving, not asserting in a comment.

describe("theme role parity", () => {
  const dark = themeOverrides.dark;

  it("never invents a token name the system does not already declare", () => {
    // A theme may re-point a semantic role (the normal case) or override a
    // primitive such as the elevation shadows — but it may never introduce a
    // name of its own, or the theme would be a second token set.
    for (const name of Object.keys(dark)) {
      expect(allTokens, name).toHaveProperty(name);
    }
  });

  it("covers the DaisyUI-shaped vocabulary in both themes", () => {
    const roles = [
      "--color-base-100",
      "--color-base-200",
      "--color-base-300",
      "--color-base-content",
      "--color-secondary",
      "--color-secondary-content",
      "--color-neutral",
      "--color-neutral-content",
      ...["success", "warning", "error", "info"].flatMap((r) => [
        `--color-${r}`,
        `--color-${r}-surface`,
        `--color-${r}-content`,
      ]),
    ];
    for (const role of roles) {
      expect(semantic, role).toHaveProperty(role);
      expect(dark, role).toHaveProperty(role);
    }
    expect(roles).toHaveLength(20);
  });

  it("keeps the primary pair as the action pair, not a second name for it", () => {
    // `--color-action` IS the primary fill and `--color-action-text` its
    // content; a separate --color-primary would be one value under two names.
    expect(semantic).not.toHaveProperty("--color-primary");
    expect(semantic).not.toHaveProperty("--color-primary-content");
  });
});
