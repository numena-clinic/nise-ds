import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { toggle, slider } from "../tokens/component.mjs";

/**
 * The geometry of the switch knob and the slider thumb.
 *
 * jsdom has no layout engine, so neither component can be measured in a unit
 * test. The rules that decide the geometry are asserted against the source
 * instead, and the proportions they assume are checked against the tokens.
 * Both were verified in a browser: the knob keeps the inset on every side in
 * both states, and the thumb's centre sits on the rail's centre line at 0, 40
 * and 100 with the thumb inside the track's ends.
 */

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

const switchCss = read("../src/components/Switch/Switch.css");
const sliderCss = read("../src/components/Slider/Slider.css");

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

describe("the slider thumb", () => {
  const root = rule(sliderCss, ".nise-slider__root");
  const thumb = rule(sliderCss, ".nise-slider__thumb");

  it("centres the thumb on the value point", () => {
    // Radix positions a zero-size wrapper at the value point; the thumb has to
    // be centred on that origin or it hangs below the rail and off to the side.
    expect(decl(thumb, "position")).toBe("absolute");
    expect(decl(thumb, "top")).toBe("50%");
    expect(decl(thumb, "left")).toBe("50%");
    expect(decl(thumb, "transform")).toBe("translate(-50%, -50%)");
  });

  it("keeps the thumb wrapper on the rail's centre line", () => {
    // `align-items: center` is what puts the wrapper's static position — the
    // origin the thumb is centred on — on the root's centre line.
    expect(decl(root, "align-items")).toBe("center");
  });

  it("sizes the thumb from the token", () => {
    expect(decl(thumb, "width")).toBe("var(--slider-thumb-size)");
    expect(decl(thumb, "height")).toBe("var(--slider-thumb-size)");
    expect(px(slider["--slider-thumb-size"])).toBeGreaterThan(px(slider["--slider-track-height"]));
  });
});
