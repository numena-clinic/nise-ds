import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { toggle } from "../tokens/component.mjs";

/** Switch proportions. Slider positioning is measured by the browser suite. */

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

const switchCss = read("../src/components/Switch/Switch.css");

/** The declarations of the first rule with this exact selector. */
function rule(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
}

/** One declaration's value, trimmed. */
function decl(body: string, property: string): string {
  return body.match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`))?.[1]?.trim() ?? "";
}

const px = (value: string) => Number.parseFloat(value);

describe("the switch knob", () => {
  const track = rule(switchCss, ".nise-switch__track");
  const knob = rule(switchCss, ".nise-switch__knob");
  const checked = rule(switchCss, ".nise-switch__input:checked + .nise-switch__track .nise-switch__knob");

  const width = px(toggle["--switch-width"]);
  const height = px(toggle["--switch-height"]);
  const knobSize = px(toggle["--switch-knob"]);
  const inset = px(toggle["--switch-inset"]);

  it("sizes the track as the knob plus the inset on each side", () => {
    expect(width).toBe(knobSize * 2 + inset * 2);
    expect(height).toBe(knobSize + inset * 2);
  });

  it("keeps the track free of a border, so the knob is measured from its outer edge", () => {
    // The knob is positioned from the track's outer edge, but a border shrinks
    // the padding box it is positioned against — the knob then hangs out of
    // the track on the checked side and sits 1px off the bottom.
    expect(decl(track, "border")).toBe("");
  });

  it("starts the knob at the inset and centres it in the track", () => {
    expect(decl(knob, "left")).toBe("var(--switch-inset)");
    expect(decl(knob, "top")).toBe("calc((var(--switch-height) - var(--switch-knob)) / 2)");
  });

  it("travels the knob to the far inset when checked", () => {
    expect(decl(checked, "transform")).toBe(
      "translateX(calc(var(--switch-width) - var(--switch-knob) - 2 * var(--switch-inset)))",
    );
  });

  it("keeps the knob inside the track in both states", () => {
    const travel = width - knobSize - inset * 2;
    const states = {
      unchecked: { left: inset, right: width - inset - knobSize },
      checked: { left: inset + travel, right: inset },
    };
    for (const state of Object.values(states)) {
      // the knob is flush to the inset on the side it rests against …
      expect(Math.min(state.left, state.right)).toBe(inset);
      // … and the travel never pushes it past the far edge
      expect(Math.max(state.left, state.right)).toBeLessThanOrEqual(width - knobSize - inset);
    }
  });

  it("keeps the knob centred vertically", () => {
    const top = (height - knobSize) / 2;
    expect(top).toBe(inset);
    expect(height - knobSize - top).toBe(inset);
  });
});
