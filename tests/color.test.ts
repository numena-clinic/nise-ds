import { describe, it, expect } from "vitest";
import {
  parseColor,
  evalMix,
  expand,
  rgbToOklch,
  oklchToRgb,
  toHex,
  deltaE2000,
  deltaE2000Lab,
} from "../tokens/color.mjs";
import { allTokens, themeOverrides, semantic } from "../tokens/index.mjs";
import {
  functionalFamilies,
  groundAnchors,
  brandAnchors,
  colorTokens,
  colorMeta,
  scaleSteps,
  authoredScale,
} from "../tokens/palette.mjs";

// The color maths is shared by the validator and the Theme Explorer, so these
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
    // mid cyan (hue 200): red is the smallest channel, green/blue near-equal.
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
    expect(parseColor("totally-not-a-color")).toBeNull();
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

describe("derived semantic colors (regression)", () => {
  const cases: Record<string, string> = {
    "--color-base-hover": "#eae5f1",
    "--color-base-active": "#dfd8e8",
    "--color-text-muted": "#6c6375",
    "--color-border": "#dfd8e8",
    "--color-border-strong": "#847c8d",
    "--color-border-hover": "#6c6375",
    "--color-primary-hover": "#44097e",
    "--color-primary-active": "#290053",
    "--color-scrim": "rgba(34, 26, 42, 0.4)",
  };

  for (const [name, expected] of Object.entries(cases)) {
    it(`resolves ${name} to ${expected}`, () => {
      expect(expand(name, allTokens)).toBe(expected);
    });
  }

  it("resolves every derived color without an error", () => {
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
    expect(expand("--neutral-950", allTokens)).toBe("#221a2a");
  });
});

describe("deltaE2000", () => {
  it("reproduces the published CIEDE2000 reference values", () => {
    // Sharma, Wu & Dalal (2005), the standard test set. The distinguishability
    // guard is only as trustworthy as the metric behind it — an implementation
    // that forgets to fold the hue term into [0, 360) reports two clearly
    // different colors as identical, and the guard would wave that through.
    type Lab = [number, number, number];
    const REFERENCE: [Lab, Lab, number][] = [
      [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
      [[50, 3.1571, -77.2803], [50, 0, -82.7485], 2.8615],
      [[50, 2.8361, -74.02], [50, 0, -82.7485], 3.4412],
      [[50, -1.3802, -84.2814], [50, 0, -82.7485], 1.0],
      [[50, -1.1848, -84.8006], [50, 0, -82.7485], 1.0],
      [[50, -0.9009, -85.5211], [50, 0, -82.7485], 1.0],
      [[50, 0, 0], [50, -1, 2], 2.3669],
      [[50, -1, 2], [50, 0, 0], 2.3669],
      [[50, 2.49, -0.001], [50, -2.49, 0.0009], 7.1792],
      [[50, 2.49, -0.001], [50, -2.49, 0.001], 7.1792],
      [[50, 2.49, -0.001], [50, -2.49, 0.0011], 7.2195],
      [[50, 2.49, -0.001], [50, -2.49, 0.0012], 7.2195],
      [[50, -0.001, 2.49], [50, 0.0009, -2.49], 4.8045],
      [[50, -0.001, 2.49], [50, 0.0011, -2.49], 4.7461],
      [[50, 2.5, 0], [50, 0, -2.5], 4.3065],
      [[50, 2.5, 0], [73, 25, -18], 27.1492],
      [[50, 2.5, 0], [61, -5, 29], 22.8977],
      [[50, 2.5, 0], [56, -27, -3], 31.903],
      [[50, 2.5, 0], [58, 24, 15], 19.4535],
      [[50, 2.5, 0], [50, 3.1736, 0.5854], 1.0],
      [[50, 2.5, 0], [50, 3.2972, 0], 1.0],
      [[50, 2.5, 0], [50, 1.8634, 0.5757], 1.0],
      [[50, 2.5, 0], [50, 3.2592, 0.335], 1.0],
      [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
      [[63.0109, -31.0961, -5.8663], [62.8187, -29.7946, -4.0864], 1.263],
      [[61.2901, 3.7196, -5.3901], [61.4292, 2.248, -4.962], 1.8731],
      [[35.0831, -44.1164, 3.7933], [35.0232, -40.0716, 1.5901], 1.8645],
      [[22.7233, 20.0904, -46.694], [23.0331, 14.973, -42.5619], 2.0373],
      [[36.4612, 47.858, 18.3852], [36.2715, 50.5065, 21.2231], 1.4146],
      [[90.8027, -2.0831, 1.441], [91.1528, -1.6435, 0.0447], 1.4441],
      [[90.9257, -0.5406, -0.9208], [88.6381, -0.8985, -0.7239], 1.5381],
      [[6.7747, -0.2908, -2.4247], [5.8714, -0.0985, -2.2286], 0.6377],
      [[2.0776, 0.0795, -1.135], [0.9033, -0.0636, -0.5514], 0.9082],
    ];
    for (const [a, b, expected] of REFERENCE) {
      expect(deltaE2000Lab(a, b)).toBeCloseTo(expected, 4);
    }
  });

  it("is symmetric, and zero only for the same color", () => {
    const cyan = parseColor("#25E4F8")!;
    const blue = parseColor("#80C5FF")!;
    expect(deltaE2000(cyan, blue)).toBeCloseTo(deltaE2000(blue, cyan), 10);
    expect(deltaE2000(cyan, cyan)).toBeCloseTo(0, 10);
  });
});

describe("dark theme overrides", () => {
  const dark = { ...allTokens, ...themeOverrides.dark };

  it("maps the same role names onto the dark ground", () => {
    // The dark page IS the published dark ground (tokens/palette.mjs), not a
    // neutral step: it is the value the base ladder is pinned around.
    expect(expand("--color-base-100", dark)).toBe("#17121D");
    expect(expand("--color-base-200", dark)).toBe("#221A2A"); // the brand ink
    expect(expand("--color-base-300", dark)).toBe("#2D2238"); // the strong panel
    expect(expand("--color-base-content", dark)).toBe("#f4f1f8");
  });

  it("brightens the primary and deepens the shadow", () => {
    expect(expand("--color-primary", dark)).toBe("#c2a0fb");
    expect(expand("--shadow-md", dark)).toContain("rgb(0 0 0");
  });
});

// ── the authored operational families (docs/decisions.md P4, D21) ─────────────
//
// mint / citron / pink / blue are pinned to published candidate values rather
// than generated from the shared lightness curve. The one thing that must never
// happen is a regeneration moving an anchor, so the pins are asserted verbatim.

describe("authored functional ramps", () => {
  it("keeps every published pin verbatim, to the unit", () => {
    // The token source is plain JS; this is the one seam where the pin table
    // crosses into the typed test, so it is cast once, here. A pin is verbatim
    // whether or not its step is surfaced, so the mechanism is tested directly
    // (and the surfaced ones are re-checked against `colorTokens`).
    const ramps = functionalFamilies as Record<string, Record<string, string>>;
    for (const [family, pins] of Object.entries(ramps)) {
      for (const [step, hex] of Object.entries(pins)) {
        expect(authoredScale(pins, [step])[step]!.hex, `${family}-${step}`).toBe(hex);
        if (colorTokens[`--${family}-${step}`] !== undefined) {
          expect(colorTokens[`--${family}-${step}`], `${family}-${step}`).toBe(hex);
        }
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

  it("surfaces only the steps a semantic role reads, and steps down every ramp", () => {
    // The palette is deliberately small: each family exposes exactly the steps
    // in `scaleSteps`, which is what the semantic layer references. The token
    // source is plain JS, so the table is cast once, here.
    const steps = scaleSteps as Record<string, string[]>;
    for (const [family, familySteps] of Object.entries(steps)) {
      const surfaced = Object.keys(colorMeta)
        .filter((n) => colorMeta[n].family === family)
        .sort();
      expect(surfaced, family).toHaveLength(familySteps.length);
      // and they descend in lightness, so a ramp reads dark → light as one line
      const lightness = familySteps.map((s) => colorMeta[`--${family}-${s}`].oklch.l);
      for (let i = 1; i < lightness.length; i += 1) {
        expect(lightness[i], `${family}-${familySteps[i]}`).toBeLessThan(lightness[i - 1]);
      }
    }
  });

  it("stays inside its own hue family, so info never collides with brand cyan", () => {
    const hueOf = (name: string) => colorMeta[name].oklch.h;
    // The info family is a true blue, not a second cyan: its hue sits well
    // clear of the brand's vibrant-cyan (~206.5°) in every surfaced step.
    expect(hueOf("--blue-500") - hueOf("--vibrant-cyan")).toBeGreaterThanOrEqual(30);
    expect(hueOf("--blue-700") - hueOf("--cyan-900")).toBeGreaterThanOrEqual(30);
    expect(hueOf("--blue-700") - hueOf("--cyan-100")).toBeGreaterThanOrEqual(30);
    for (const family of Object.keys(functionalFamilies)) {
      for (const step of scaleSteps[family]) {
        const h = hueOf(`--${family}-${step}`);
        expect(h, `${family}-${step}`).toBeGreaterThanOrEqual(0);
        expect(h).toBeLessThan(360);
      }
    }
  });

  it("keeps every fill and status role distinguishable in BOTH themes", () => {
    // The guard that was missing. A role pair that reads as one color is a
    // defect a contrast check cannot see: `--color-info` sat ΔE2000 1.9 from
    // `--color-secondary` in the dark theme and 8.9 in the light theme,
    // because the info family was a cyan and the secondary IS the brand's cyan.
    // The old test only compared hues in the LIGHT theme, so the collision
    // shipped in both.
    //
    // Every role that paints a fill must be separable from every other, in
    // each theme, or a badge is indistinguishable from a button.
    const FILL_ROLES = [
      "primary",
      "secondary",
      "accent",
      "success",
      "warning",
      "error",
      "info",
    ] as const;
    // The floor is a just-noticeable difference with room to spare: below
    // ~10, two saturated colors read as the same color on screen.
    const MIN_DELTA_E = 10;

    // The light theme is the BASE — `semantic` — and dark is the override map.
    // Both must be checked; the light theme is where the old collision hid.
    for (const [themeId, overrides] of [
      ["light", semantic],
      ...Object.entries(themeOverrides),
    ] as const) {
      const hexOf = (role: string) => {
        const key = `--color-${role}`;
        const value = overrides[key] ?? semantic[key];
        const name = value.replace(/^var\(/, "").replace(/\)$/, "");
        expect(name, `${themeId} ${key}`).toMatch(/^--[a-z0-9-]+$/);
        return parseColor(colorTokens[name]);
      };
    for (const [i, a] of FILL_ROLES.entries()) {
      for (const b of FILL_ROLES.slice(i + 1)) {
        const delta = deltaE2000(hexOf(a), hexOf(b));
        expect(
          delta,
          `${themeId}: --color-${a} and --color-${b} are too close`,
        ).toBeGreaterThanOrEqual(MIN_DELTA_E);
      }
    }
    }
  });

  it("keeps the warm family on its brand anchor's hue", () => {
    const hueOf = (name: string) => colorMeta[name].oklch.h;
    // vibrant-tangerine measures 42.9°; the surfaced steps must sit on it so a
    // family-hue edit cannot quietly drift the ramp toward a hue the brand does
    // not have.
    for (const step of scaleSteps.tangerine) {
      const drift = Math.abs(hueOf(`--tangerine-${step}`) - hueOf("--vibrant-tangerine"));
      expect(drift, `tangerine-${step}`).toBeLessThan(14);
    }
  });
});

// A theme is a mapping, never a second token set: it may only re-point role
// names the light contract already declares. That claim needs proving, not
// asserting in a comment.

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
      "--color-base-hover",
      "--color-base-active",
      "--color-primary",
      "--color-primary-content",
      "--color-secondary",
      "--color-secondary-content",
      "--color-accent",
      "--color-accent-content",
      "--color-neutral",
      "--color-neutral-content",
      ...["success", "warning", "error", "info"].flatMap((r) => [
        `--color-${r}`,
        `--color-${r}-content`,
      ]),
    ];
    for (const role of roles) {
      expect(semantic, role).toHaveProperty(role);
      expect(dark, role).toHaveProperty(role);
    }
    expect(roles).toHaveLength(22);
  });

  it("keeps every fill paired with a content color in both themes", () => {
    // A fill with no content role is a color a component cannot put text on.
    for (const fill of [
      "primary",
      "secondary",
      "accent",
      "neutral",
      "success",
      "warning",
      "error",
      "info",
    ]) {
      expect(semantic, fill).toHaveProperty(`--color-${fill}-content`);
      expect(dark, fill).toHaveProperty(`--color-${fill}-content`);
    }
  });
});
