import { createElement } from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { toggle } from "../tokens/component.mjs";
import { Switch } from "../src/index";

/** Switch proportions. Slider positioning is measured by the browser suite. */

const px = (value: string) => Number.parseFloat(value);

describe("the switch knob", () => {
  const width = px(toggle["--switch-width"]);
  const height = px(toggle["--switch-height"]);
  const knobSize = px(toggle["--switch-knob"]);
  const inset = px(toggle["--switch-inset"]);

  it("sizes the track as the knob plus the inset on each side", () => {
    expect(width).toBe(knobSize * 2 + inset * 2);
    expect(height).toBe(knobSize + inset * 2);
  });

  it("keeps the track free of a border and binds knob geometry to switch tokens", () => {
    const { container } = render(createElement(Switch, { label: "Geometry check" }));
    const track = container.querySelector(".nise-switch__track");
    const knob = container.querySelector(".nise-switch__knob");
    expect(track).not.toBeNull();
    expect(knob).not.toBeNull();
    expect(track?.className).toContain("w-[var(--switch-width)]");
    expect(track?.className).toContain("h-[var(--switch-height)]");
    expect(track?.className.split(/\s+/)).not.toContain("border");
    expect(knob?.className).toContain("left-[var(--switch-inset)]");
    expect(knob?.className).toContain(
      "top-[calc((var(--switch-height)-var(--switch-knob))/2)]",
    );
    expect(track?.className).toContain(
      "peer-checked:[&_.nise-switch__knob]:translate-x-[calc(var(--switch-width)-var(--switch-knob)-2*var(--switch-inset))]",
    );
  });

  it("keeps the knob inside the track in both states", () => {
    const travel = width - knobSize - inset * 2;
    const states = {
      unchecked: { left: inset, right: width - inset - knobSize },
      checked: { left: inset + travel, right: inset },
    };
    for (const state of Object.values(states)) {
      expect(Math.min(state.left, state.right)).toBe(inset);
      expect(Math.max(state.left, state.right)).toBeLessThanOrEqual(
        width - knobSize - inset,
      );
    }
  });

  it("keeps the knob centred vertically", () => {
    const top = (height - knobSize) / 2;
    expect(top).toBe(inset);
    expect(height - knobSize - top).toBe(inset);
  });
});
