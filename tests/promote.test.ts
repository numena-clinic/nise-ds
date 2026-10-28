import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  quote,
  aliasExpr,
  isColorRole,
  isPrimitiveLiteral,
  replaceTokenInFile,
  planPromotion,
  TOKEN_FILES,
} from "../scripts/lib/promote.mjs";

describe("quote", () => {
  it("wraps a plain value in valid JSON string syntax", () => {
    expect(quote("#4C207F")).toBe('"#4C207F"');
  });

  it("escapes double quotes and backslashes safely", () => {
    expect(quote('"Albert Sans", sans-serif')).toBe('"\\"Albert Sans\\", sans-serif"');
    expect(quote("path\\to\\something")).toBe('"path\\\\to\\\\something"');
  });

  it("escapes newlines and control characters", () => {
    const raw = "line1\nline2\r\t\b\f\0";
    const quoted = quote(raw);
    expect(quoted).not.toContain("\n");
    expect(quoted).not.toContain("\r");
    // Verify evaluation evaluates strictly to original data string
    const evaluated = new Function(`return ${quoted};`)();
    expect(evaluated).toBe(raw);
  });

  it("safely neutralizes crafted JavaScript syntax injection", () => {
    const crafted = '"; process.exit(1); const injected = "';
    const quoted = quote(crafted);
    // Evaluating this as JS expression produces the literal string, never executing code
    const evaluated = new Function(`return ${quoted};`)();
    expect(evaluated).toBe(crafted);
  });
});

describe("aliasExpr", () => {
  it("reuses the named const already defined in semantic.mjs", () => {
    expect(aliasExpr("semantic", "--white")).toBe("white");
    expect(aliasExpr("semantic", "--ink-plum")).toBe("inkPlum");
  });
  it("falls back to a ref() call otherwise", () => {
    expect(aliasExpr("semantic", "--soft-purple")).toBe('ref("--soft-purple")');
  });
});

describe("replaceTokenInFile", () => {
  const text = ['const t = {', '  "--a": "#111111",', '  "--b": "2px",', "};"].join("\n");

  it("replaces only the target line and reports the old value", () => {
    const res = replaceTokenInFile(text, "--a", '"#222222"');
    expect(res.changed).toBe(true);
    expect(res.line).toBe(2);
    expect(res.from).toBe('"#111111"');
    expect(res.text).toContain('"--a": "#222222",');
    expect(res.text).toContain('"--b": "2px",');
  });

  it("reports a token that is not on any line", () => {
    expect(replaceTokenInFile(text, "--missing", '"x"').changed).toBe(false);
  });

  it("refuses a token that appears more than once", () => {
    const twice = '  "--a": "1",\n  "--a": "2",\n';
    expect(replaceTokenInFile(twice, "--a", '"3"').reason).toMatch(/2 lines/);
  });
});

describe("planPromotion (against the real token source)", () => {
  const root = process.cwd();

  it("recognises editable and non-editable tokens", () => {
    expect(isPrimitiveLiteral("--deep-purple")).toBe(true);
    expect(isPrimitiveLiteral("--purple-600")).toBe(true);
    expect(isColorRole("--color-base-100")).toBe(true);
    expect(isColorRole("--color-primary")).toBe(true);
    expect(isColorRole("--color-scrim")).toBe(false);
    expect(isColorRole("--focus-ring-width")).toBe(false);
  });

  it("plans a primitive value edit and leaves the file on disk untouched", () => {
    const before = readFileSync(resolve(root, TOKEN_FILES.primitive), "utf8");
    const plan = planPromotion(root, {
      schema: "nise.theme-candidate",
      version: 1,
      tokens: [{ name: "--space-3", layer: "primitive", kind: "value", value: "13px" }],
    });
    expect(plan.errors).toEqual([]);
    expect(plan.edits).toHaveLength(1);
    expect(plan.files[TOKEN_FILES.primitive]).toContain('"--space-3": "13px",');
    // the on-disk file is unchanged — planning writes nothing
    expect(readFileSync(resolve(root, TOKEN_FILES.primitive), "utf8")).toBe(before);
  });

  it("plans a color-role retarget in the semantic file", () => {
    const plan = planPromotion(root, {
      schema: "nise.theme-candidate",
      version: 1,
      tokens: [{ name: "--color-base-100", layer: "semantic", kind: "alias", ref: "--soft-purple" }],
    });
    expect(plan.errors).toEqual([]);
    expect(plan.files[TOKEN_FILES.semantic]).toContain('"--color-base-100": ref("--soft-purple"),');
  });

  it("plans a component literal edit", () => {
    const plan = planPromotion(root, {
      schema: "nise.theme-candidate",
      version: 1,
      tokens: [{ name: "--control-height-md", layer: "component", kind: "value", value: "44px" }],
    });
    expect(plan.errors).toEqual([]);
    expect(plan.files[TOKEN_FILES.component]).toContain('"--control-height-md": "44px",');
  });

  it("refuses unknown tokens and illegal targets", () => {
    const plan = planPromotion(root, {
      schema: "nise.theme-candidate",
      version: 1,
      tokens: [
        { name: "--nope", layer: "primitive", kind: "value", value: "#000000" },
        { name: "--color-scrim", layer: "semantic", kind: "alias", ref: "--neutral-950" },
        { name: "--color-primary", layer: "semantic", kind: "alias", ref: "--space-3" },
      ],
    });
    expect(plan.errors).toHaveLength(3);
    expect(plan.edits).toHaveLength(0);
  });

  it("rejects candidate assigning nonsense to --space-3", () => {
    const plan = planPromotion(root, {
      schema: "nise.theme-candidate",
      version: 1,
      tokens: [{ name: "--space-3", layer: "primitive", kind: "value", value: "nonsense" }],
    });
    expect(plan.errors.length).toBeGreaterThan(0);
    expect(plan.errors[0]).toMatch(/invalid length format/);
    expect(plan.edits).toHaveLength(0);
  });

  it("rejects duplicate token entries", () => {
    const plan = planPromotion(root, {
      schema: "nise.theme-candidate",
      version: 1,
      tokens: [
        { name: "--space-3", layer: "primitive", kind: "value", value: "12px" },
        { name: "--space-3", layer: "primitive", kind: "value", value: "16px" },
      ],
    });
    expect(plan.errors.length).toBeGreaterThan(0);
    expect(plan.errors[0]).toMatch(/duplicate token/);
    expect(plan.edits).toHaveLength(0);
  });

  it("rejects editing immutable brand anchors", () => {
    const plan = planPromotion(root, {
      schema: "nise.theme-candidate",
      version: 1,
      tokens: [{ name: "--deep-purple", layer: "primitive", kind: "value", value: "#123456" }],
    });
    expect(plan.errors.length).toBeGreaterThan(0);
    expect(plan.errors[0]).toMatch(/brand anchors are immutable/);
    expect(plan.edits).toHaveLength(0);
  });
});


describe("candidate source drift", () => {
  it("refuses to overwrite a token changed since candidate export", () => {
    const plan = planPromotion(process.cwd(), {
      schema: "nise.theme-candidate", version: 1,
      tokens: [{ name: "--space-3", kind: "value", value: "16px", from: "8px" }],
    });
    expect(plan.errors).toEqual([expect.stringContaining("source changed")]);
    expect(plan.files).toEqual({});
    expect(plan.edits).toEqual([]);
  });
});
