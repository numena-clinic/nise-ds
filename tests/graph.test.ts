import { describe, it, expect } from "vitest";
import { refsOf, findCycles } from "../tokens/graph.mjs";

describe("refsOf", () => {
  it("lists every var() name in order", () => {
    expect(refsOf("var(--a) solid var(--b)")).toEqual(["--a", "--b"]);
  });

  it("finds a reference inside calc() and color-mix()", () => {
    expect(refsOf("calc((var(--space-3) - var(--x)) / 2)")).toEqual(["--space-3", "--x"]);
    expect(refsOf("color-mix(in srgb, var(--a) 60%, var(--b))")).toEqual(["--a", "--b"]);
  });

  it("ignores the optional outer var of a fallback but keeps its inner reference", () => {
    // `var(--button-radius, var(--radius-md))` means "use --button-radius if it
    // exists, else --radius-md" — so the real dependency is --radius-md.
    expect(refsOf("var(--button-radius, var(--radius-md))")).toEqual(["--radius-md"]);
  });

  it("returns nothing for a raw value", () => {
    expect(refsOf("#4C207F")).toEqual([]);
  });
});

describe("findCycles", () => {
  it("finds no cycle in a straight chain", () => {
    expect(findCycles({ "--a": "var(--b)", "--b": "var(--c)", "--c": "#fff" })).toEqual([]);
  });

  it("does not mistake a diamond (shared descendant) for a cycle", () => {
    expect(
      findCycles({
        "--a": "var(--b)",
        "--b": "var(--d)",
        "--c": "var(--d)",
        "--d": "#000",
      }),
    ).toEqual([]);
  });

  it("does not mistake a valid primitive → semantic → component chain for a cycle", () => {
    expect(
      findCycles({
        "--deep-purple": "#4C207F",
        "--color-action": "var(--deep-purple)",
        "--color-action-hover": "color-mix(in srgb, var(--color-action) 82%, var(--white))",
        "--white": "#ffffff",
        "--button-bg": "var(--color-action)",
        "--button-bg-hover": "var(--button-bg)",
      }),
    ).toEqual([]);
  });

  it("does not flag a token that is referenced from many places", () => {
    expect(
      findCycles({
        "--x": "#000",
        "--a": "var(--x)",
        "--b": "var(--x)",
        "--c": "var(--a)",
        "--d": "var(--b)",
      }),
    ).toEqual([]);
  });

  it("finds a two-node cycle", () => {
    const cycles = findCycles({ "--a": "var(--b)", "--b": "var(--a)" });
    expect(cycles).toHaveLength(1);
    expect([...new Set(cycles[0])]).toEqual(["--a", "--b"]);
    expect(cycles[0]![0]).toBe(cycles[0]!.at(-1));
  });

  it("finds a self-reference", () => {
    const cycles = findCycles({ "--a": "var(--a)" });
    expect(cycles).toEqual([["--a", "--a"]]);
  });

  it("reports a longer cycle once, not once per entry point", () => {
    const cycles = findCycles({
      "--a": "var(--b)",
      "--b": "var(--c)",
      "--c": "var(--a)",
      "--d": "var(--a)",
    });
    expect(cycles).toHaveLength(1);
  });

  it("still finds a cycle that hangs off a tree", () => {
    const cycles = findCycles({ "--root": "var(--a)", "--a": "var(--b)", "--b": "var(--a)" });
    expect(cycles).toHaveLength(1);
  });

  it("ignores references to names outside the map", () => {
    expect(findCycles({ "--a": "var(--missing)" })).toEqual([]);
  });

  it("finds two independent cycles", () => {
    const cycles = findCycles({
      "--a": "var(--b)",
      "--b": "var(--a)",
      "--x": "var(--y)",
      "--y": "var(--x)",
    });
    expect(cycles).toHaveLength(2);
  });
});
