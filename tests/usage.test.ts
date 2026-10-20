import { describe, it, expect } from "vitest";
import {
  stripLineComment,
  scanSource,
  checkPrimitiveRefs,
} from "../scripts/lib/token-usage.mjs";

// A minimal stand-in for the real token table.
const isKnownToken = (name: string) =>
  /^--(?:space-|color-|control-|choice-|white|ink-plum|deep-purple|vibrant-|soft-|pale-lavender|dark-ground|dark-panel|neutral-|purple-|cyan-|tangerine-|mint-|citron-|pink-|teal-|button-radius$|c$)/.test(
    name,
  );
const scanCss = (text: string) => scanSource(text, { isCss: true, isKnownToken });
const scanTsx = (text: string) => scanSource(text, { isCss: false, isKnownToken });
const messages = (problems: { message: string }[]) => problems.map((p) => p.message);

describe("comment handling", () => {
  it("ignores a colour inside a multi-line block comment but still sees the code after it", () => {
    const problems = scanCss(`/* a note
   about #abcdef and rgb(1,2,3)
   that spans lines */
.a { padding: 13px; }`);
    expect(problems).toHaveLength(1);
    expect(problems[0]!.line).toBe(4);
    expect(problems[0]!.message).toMatch(/off-token px/);
  });

  it("ignores a colour in a single-line block comment", () => {
    expect(scanCss(`.a { /* was #fff */ padding: var(--space-3); }`)).toEqual([]);
  });

  it("ignores a colour in a trailing // comment", () => {
    expect(scanTsx(`const x = 1; // old value was #abcdef`)).toEqual([]);
  });

  it("keeps a :// URL intact when stripping a line comment", () => {
    expect(stripLineComment(`const u = "http://x/y"; // note`)).toBe(`const u = "http://x/y"; `);
  });

  it("honours the single documented waiver marker", () => {
    expect(scanCss(`.a { padding: 13px; } /* token-boundary: waive */`)).toEqual([]);
  });
});

describe("off-token px", () => {
  it("catches an inline single-line rule", () => {
    const problems = scanCss(`.a { padding: 13px; }`);
    expect(problems).toHaveLength(1);
    expect(problems[0]!.message).toMatch(/`padding`/);
  });

  it("catches a declaration that wraps across lines and reports the property's line", () => {
    const problems = scanCss(`.a {
  padding:
    13px;
}`);
    expect(problems).toHaveLength(1);
    expect(problems[0]!.line).toBe(2);
  });

  it("catches a literal px inside calc()", () => {
    expect(scanCss(`.a { padding-block: calc((40px - var(--space-3)) / 2); }`)).toHaveLength(1);
  });

  it("accepts a calc() built only from tokens", () => {
    expect(scanCss(`.a { padding-block: calc((var(--space-3) - var(--space-1)) / 2); }`)).toEqual([]);
  });

  it("accepts a token on a spacing property and an explicit zero", () => {
    expect(scanCss(`.a { padding: var(--space-3); margin: 0; }`)).toEqual([]);
  });

  it("catches a raw hairline on a border", () => {
    expect(scanCss(`.a { border: 1px solid var(--c); }`)).toHaveLength(1);
  });

  it("leaves px on properties outside the spacing / radius / type set alone", () => {
    expect(scanCss(`.a { width: 36px; height: 36px; max-width: 280px; }`)).toEqual([]);
  });
});

describe("var() references", () => {
  it("flags a var() with no fallback that names an unknown token", () => {
    const problems = scanCss(`.a { color: var(--nope); }`);
    expect(messages(problems)).toEqual(["unknown token --nope"]);
  });

  it("does not require a var() that carries a fallback to be defined", () => {
    expect(scanCss(`.a { padding: var(--button-radius, var(--space-3)); }`)).toEqual([]);
  });
});

describe("raw colour literals", () => {
  it.each([
    [`.a { color: #fff; }`, /raw colour literal/],
    [`.a { color: #ffffff80; }`, /raw colour literal/],
    [`.a { color: rgb(1, 2, 3); }`, /raw colour literal/],
    [`.a { color: oklch(0.5 0.1 20); }`, /raw colour literal/],
    [`.a { color: red; }`, /named colour/],
  ])("flags %s", (css, pattern) => {
    expect(messages(scanCss(css)).some((m) => pattern.test(m))).toBe(true);
  });

  it("accepts a colour that comes through a token", () => {
    expect(scanCss(`.a { color: var(--color-text); background: var(--color-surface); }`)).toEqual([]);
  });
});

describe("JSX inline styles", () => {  it("catches an off-token px, mapped from camelCase to kebab", () => {
    const problems = scanTsx(`<div style={{ paddingTop: "13px" }} />`);
    expect(problems).toHaveLength(1);
    expect(problems[0]!.message).toMatch(/`padding-top`/);
  });

  it("catches a radius px", () => {
    expect(scanTsx(`<div style={{ borderRadius: "8px" }} />`)).toHaveLength(1);
  });

  it("accepts token values and px outside the set", () => {
    expect(scanTsx(`<div style={{ gap: "var(--space-3)", maxWidth: "390px" }} />`)).toEqual([]);
  });

  it("reports the right line when the style spans lines", () => {
    const problems = scanTsx(`<div
  style={{
    padding: "13px",
  }}
/>`);
    expect(problems).toHaveLength(1);
    expect(problems[0]!.line).toBe(3);
  });
});

describe("primitive references in component code", () => {
  it.each([
    ["--neutral-0", "neutral"],
    ["--deep-purple", "brand anchor"],
    ["--pale-lavender", "brand anchor"],
    ["--dark-ground", "ground anchor"],
    ["--vibrant-cyan", "brand anchor"],
    ["--mint-700", "operational ramp"],
  ])("flags a component that consumes the primitive %s (%s)", (token) => {
    const problems = scanCss(`.a { color: var(${token}); }`);
    expect(messages(problems)).toEqual([
      `primitive \`${token}\` referenced directly — components consume a semantic role (--color-*)`,
    ]);
  });

  it("accepts a semantic role and a component token", () => {
    expect(scanCss(`.a { color: var(--color-text); padding: var(--space-3); border-radius: var(--button-radius); }`)).toEqual([]);
  });

  it("does not flag a semantic role whose name merely starts the same", () => {
    // --color-* and --surface-* are roles, not primitives, whatever the value.
    expect(messages(scanCss(`.a { color: var(--color-text); background: var(--color-surface-subtle); }`))).toEqual([]);
  });

  it("flags only when the primitive actually exists (a typo stays a var() error)", () => {
    const isKnown = (n: string) => n === "--neutral-0";
    expect(checkPrimitiveRefs(`var(--neutral-0)`, isKnown)).toHaveLength(1);
    expect(checkPrimitiveRefs(`var(--neutral-nope)`, isKnown)).toHaveLength(0);
  });

  it("can be relaxed by the documented env escape hatch", () => {
    process.env.NISE_ALLOW_PRIMITIVE_REF = "1";
    try {
      expect(scanCss(`.a { color: var(--neutral-0); }`)).toEqual([]);
    } finally {
      delete process.env.NISE_ALLOW_PRIMITIVE_REF;
    }
  });
});
