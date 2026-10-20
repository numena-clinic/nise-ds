import { describe, it, expect } from "vitest";
import {
  EDITABLES,
  EDITABLE_BY_NAME,
  DERIVED_TOKENS,
  COLOR_PRIMITIVES,
  TOKEN_INFOS,
  INFO_BY_NAME,
  transitiveDependents,
  editablesBySection,
} from "../src/explorer/theme/tokens";
import {
  canonicalOverride,
  isChanged,
  prune,
  changeCount,
  validateValue,
  experimentalTokens,
  previewStyle,
  resolve,
  resolveContrast,
  diffRows,
  serializeCandidate,
  candidateToJson,
  parseCandidate,
  overridesFromCandidate,
  candidateDrift,
  withFontFamily,
  fontStackParts,
  type Overrides,
} from "../src/explorer/theme/theme";

describe("token classification", () => {
  it("reads a primitive literal as an editable colour value", () => {
    const t = INFO_BY_NAME["--deep-purple"]!;
    expect(t.form).toBe("value");
    expect(t.primitive).toBe(true);
    const e = EDITABLE_BY_NAME["--deep-purple"]!;
    expect(e.kind).toBe("value");
    expect(e.control).toBe("color");
  });

  it("reads a semantic colour role as a retargetable alias", () => {
    const t = INFO_BY_NAME["--color-surface"]!;
    expect(t.form).toBe("alias");
    expect(t.ref).toBe("--neutral-0");
    const e = EDITABLE_BY_NAME["--color-surface"]!;
    expect(e.kind).toBe("alias");
    expect(e.options).toEqual(COLOR_PRIMITIVES);
  });

  it("reads the generated colour scales as editable colour primitives", () => {
    const t = INFO_BY_NAME["--purple-600"]!;
    expect(t.form).toBe("value");
    expect(t.primitive).toBe(true);
    expect(EDITABLE_BY_NAME["--purple-600"]!.control).toBe("color");
  });

  it("reads a color-mix token as derived and read-only", () => {
    expect(INFO_BY_NAME["--color-scrim"]!.form).toBe("derived");
    expect(EDITABLE_BY_NAME["--color-scrim"]).toBeUndefined();
    expect(DERIVED_TOKENS.some((t) => t.name === "--color-scrim")).toBe(true);
  });

  it("edits component literals but not component aliases", () => {
    expect(EDITABLE_BY_NAME["--control-height-md"]!.kind).toBe("value");
    expect(EDITABLE_BY_NAME["--control-height-md"]!.unit).toBe("px");
    expect(EDITABLE_BY_NAME["--button-height-md"]).toBeUndefined();
  });

  it("only lets a colour role point at a colour primitive", () => {
    const role = EDITABLE_BY_NAME["--color-action"]!;
    expect(role.kind).toBe("alias");
    expect(role.options?.every((o) => COLOR_PRIMITIVES.includes(o))).toBe(true);
  });

  it("exposes every editable token exactly once, grouped by section", () => {
    const seen = new Set<string>();
    for (const groups of Object.values(editablesBySection())) {
      for (const list of Object.values(groups)) {
        for (const e of list) {
          expect(seen.has(e.name)).toBe(false);
          seen.add(e.name);
        }
      }
    }
    expect(seen.size).toBe(EDITABLES.length);
    expect(EDITABLES.length).toBeGreaterThan(20);
  });

  it("tracks transitive dependents of a primitive", () => {
    expect(transitiveDependents("--neutral-950")).toContain("--color-text");
    expect(transitiveDependents("--neutral-950")).toContain("--color-scrim");
  });

  it("classifies every token without leaving a form unset", () => {
    for (const t of TOKEN_INFOS) {
      expect(["value", "alias", "derived"]).toContain(t.form);
    }
  });
});

describe("value validation", () => {
  const space = EDITABLE_BY_NAME["--space-3"]!;
  const lh = EDITABLE_BY_NAME["--line-height-normal"]!;
  const dur = EDITABLE_BY_NAME["--duration-fast"]!;
  const colour = EDITABLE_BY_NAME["--vibrant-purple"]!;

  it("accepts a valid value for each control", () => {
    expect(validateValue(colour, "#4C207F")).toBeNull();
    expect(validateValue(space, "12px")).toBeNull();
    expect(validateValue(lh, "1.5")).toBeNull();
    expect(validateValue(dur, "120ms")).toBeNull();
  });

  it("rejects a wrong unit or malformed value", () => {
    expect(validateValue(space, "12rem")).toMatch(/Expected a px/);
    expect(validateValue(colour, "purple")).toMatch(/hex colour/);
    expect(validateValue(lh, "tall")).toMatch(/number/);
    expect(validateValue(dur, "fast")).toMatch(/ms/);
    expect(validateValue(space, "")).toMatch(/required/);
  });
});

describe("overrides and preview resolution", () => {
  const only: Overrides = { "--neutral-950": { kind: "value", value: "#000000" } };

  it("treats a no-op override as unchanged and prunes it", () => {
    const e = EDITABLE_BY_NAME["--neutral-950"]!;
    const same = canonicalOverride(e);
    expect(isChanged("--neutral-950", same)).toBe(false);
    expect(changeCount({ "--neutral-950": same })).toBe(0);
    expect(prune({ "--neutral-950": same })).toEqual({});
  });

  it("produces scoped custom properties, not :root values", () => {
    expect(previewStyle(only)).toEqual({ "--neutral-950": "#000000" });
    expect(previewStyle({ "--color-surface": { kind: "alias", ref: "--soft-purple" } })).toEqual({
      "--color-surface": "var(--soft-purple)",
    });
  });

  it("flows a primitive change through the semantic and derived tokens", () => {
    const map = experimentalTokens(only);
    expect(resolve("--color-text", map)).toBe("#000000");
    expect(resolve("--color-scrim", map)).not.toBe(
      resolve("--color-scrim", experimentalTokens({})),
    );
  });

  it("keeps the brand contrast promises under the baseline", () => {
    expect(resolveContrast({}).every((c) => c.pass)).toBe(true);
  });

  it("reports a broken promise when a role no longer clears its minimum", () => {
    const broken = resolveContrast({ "--neutral-0": { kind: "value", value: "#211e25" } });
    const body = broken.find((c) => c.why.includes("body text on the page"))!;
    expect(body.pass).toBe(false);
    expect(body.ratio).toBeLessThan(body.min);
  });

  it("summarises the change set with its dependents", () => {
    const rows = diffRows(only);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: "--neutral-950", from: "#211e25", to: "#000000" });
    expect(rows[0]!.dependents).toContain("--color-text");
  });
});

describe("font family control", () => {
  const e = EDITABLE_BY_NAME["--font-sans"]!;

  it("swaps the first family and keeps the fallback tail", () => {
    const next = withFontFamily(e.canonical, "Tiempos Text");
    expect(next.startsWith('"Tiempos Text",')).toBe(true);
    expect(next).toContain("sans-serif");
    expect(validateValue(e, next)).toBeNull();
  });

  it("splits a stack into its first family and tail", () => {
    expect(fontStackParts('"Albert Sans", system-ui, sans-serif').first).toBe("Albert Sans");
    expect(fontStackParts("system-ui, sans-serif").first).toBe("system-ui");
  });
});

describe("candidate round-trip and validation", () => {
  const overrides: Overrides = {
    "--deep-purple": { kind: "value", value: "#3B1E66" },
    "--color-surface": { kind: "alias", ref: "--pale-lavender" },
  };

  it("serialises a versioned candidate and parses it back unchanged", () => {
    const candidate = serializeCandidate(overrides);
    expect(candidate.schema).toBe("nise.theme-candidate");
    expect(candidate.version).toBe(1);
    expect(candidateToJson(candidate)).toContain('"--deep-purple"');

    const result = parseCandidate(candidateToJson(candidate));
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(overridesFromCandidate(result.candidate!)).toEqual(prune(overrides));
  });

  it("rejects a wrong schema or version", () => {
    expect(parseCandidate("not json").ok).toBe(false);
    expect(parseCandidate(JSON.stringify({ schema: "other", version: 1, tokens: [] })).ok).toBe(false);
    expect(
      parseCandidate(JSON.stringify({ schema: "nise.theme-candidate", version: 99, tokens: [] })).ok,
    ).toBe(false);
  });

  it("rejects unknown tokens, non-primitive refs and invalid values", () => {
    const bad = parseCandidate(
      JSON.stringify({
        schema: "nise.theme-candidate",
        version: 1,
        tokens: [
          { name: "--nope", layer: "primitive", kind: "value", value: "#000000", from: "" },
          { name: "--color-action", layer: "semantic", kind: "alias", ref: "--space-3", from: "x" },
          { name: "--space-3", layer: "primitive", kind: "value", value: "12rem", from: "12px" },
        ],
      }),
    );
    expect(bad.ok).toBe(true); // shape is valid; individual tokens are filtered into errors
    expect(bad.candidate!.tokens).toHaveLength(0);
    expect(bad.errors).toHaveLength(3);
  });

  it("flags drift when the source no longer matches the candidate", () => {
    const candidate = serializeCandidate({ "--deep-purple": { kind: "value", value: "#000000" } });
    expect(candidateDrift(candidate)).toEqual([]);
    candidate.tokens[0]!.from = "#111111";
    expect(candidateDrift(candidate)[0]).toMatch(/source is now/);
  });
});
