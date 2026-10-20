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
  it("wraps a plain value in double quotes", () => {
    expect(quote("#4C207F")).toBe('"#4C207F"');
  });
  it("switches to single quotes when the value contains a double quote", () => {
    expect(quote('"Albert Sans", sans-serif')).toBe("'\"Albert Sans\", sans-serif'");
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
    expect(isColorRole("--color-surface")).toBe(true);
    expect(isColorRole("--color-action")).toBe(true);
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

  it("plans a colour-role retarget in the semantic file", () => {
    const plan = planPromotion(root, {
      schema: "nise.theme-candidate",
      version: 1,
      tokens: [{ name: "--color-surface", layer: "semantic", kind: "alias", ref: "--soft-purple" }],
    });
    expect(plan.errors).toEqual([]);
    expect(plan.files[TOKEN_FILES.semantic]).toContain('"--color-surface": ref("--soft-purple"),');
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
        { name: "--color-action", layer: "semantic", kind: "alias", ref: "--space-3" },
      ],
    });
    expect(plan.errors).toHaveLength(3);
    expect(plan.edits).toHaveLength(0);
  });
});
