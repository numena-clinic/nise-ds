import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { App } from "../src/explorer/App";
import { axeViolations, describeViolations } from "./axe";

function preview(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>(".nise-explorer__preview");
  if (!el) throw new Error("preview wrapper not found");
  return el;
}

// Address the explorer's own status region by name.
function status(): HTMLElement {
  return screen.getByRole("status", { name: "Unsaved changes" });
}

function switchTab(label: string) {
  fireEvent.click(screen.getByRole("button", { name: label }));
}

describe("Theme Explorer", () => {
  beforeEach(() => localStorage.clear());

  it("starts with no changes and a clean preview", () => {
    const { container } = render(<App />);
    expect(status().textContent).toMatch(/No changes/);
    expect(preview(container).style.getPropertyValue("--deep-purple")).toBe("");
  });

  it("applies an edit as a scoped custom property on the preview only", () => {
    const { container } = render(<App />);
    fireEvent.change(screen.getByLabelText("purple-600"), { target: { value: "#000000" } });

    expect(preview(container).style.getPropertyValue("--purple-600")).toBe("#000000");
    expect(status().textContent).toMatch(/1 unsaved change/);
    // the document root is never touched
    expect(document.documentElement.style.getPropertyValue("--purple-600")).toBe("");
  });

  it("shows a reset affordance for a changed token and restores the default", () => {
    const { container } = render(<App />);
    fireEvent.change(screen.getByLabelText("purple-600"), { target: { value: "#000000" } });
    expect(screen.getByRole("button", { name: /Reset --purple-600/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Reset --purple-600/ }));
    expect(preview(container).style.getPropertyValue("--purple-600")).toBe("");
    expect(status().textContent).toMatch(/No changes/);
  });

  it("resets every change at once", () => {
    const { container } = render(<App />);
    fireEvent.change(screen.getByLabelText("purple-600"), { target: { value: "#000000" } });

    switchTab("Space");
    fireEvent.change(screen.getByLabelText("space-3"), { target: { value: "13px" } });
    expect(status().textContent).toMatch(/2 unsaved changes/);

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(status().textContent).toMatch(/No changes/);
    expect(preview(container).style.getPropertyValue("--space-3")).toBe("");
  });

  it("retargets a colour role through its select", () => {
    const { container } = render(<App />);
    fireEvent.change(screen.getByLabelText("color-base-100"), {
      target: { value: "--soft-purple" },
    });
    expect(preview(container).style.getPropertyValue("--color-base-100")).toBe("var(--soft-purple)");
  });

  it("reviews the diff and prints the local promotion command", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("purple-600"), { target: { value: "#000000" } });
    fireEvent.click(screen.getByRole("button", { name: /Review & export/ }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Review & export" })).toBeInTheDocument();
    expect(within(dialog).getByText("purple-600")).toBeInTheDocument();
    expect(screen.getByText("npm run theme:apply -- theme-candidate.json")).toBeInTheDocument();
    expect(screen.getByText(/"nise.theme-candidate"/)).toBeInTheDocument();
  });

  it("reports a broken contrast promise in the review", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("color-base-content"), { target: { value: "--pale-lavender" } });
    fireEvent.click(screen.getByRole("button", { name: /Review & export/ }));
    expect(screen.getByText(/promises\s+fail/)).toBeInTheDocument();
  });

  it("imports a valid candidate and rejects a malformed one", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Review & export/ }));

    const textarea = screen.getByLabelText("Paste candidate JSON");
    fireEvent.change(textarea, { target: { value: "{" } });
    fireEvent.click(screen.getByRole("button", { name: "Load pasted JSON" }));
    expect(screen.getByText(/Not valid JSON/)).toBeInTheDocument();

    const good = JSON.stringify({
      schema: "nise.theme-candidate",
      version: 1,
      tokens: [{ name: "--purple-600", layer: "primitive", kind: "value", value: "#123456", from: "#935de1" }],
    });
    fireEvent.change(textarea, { target: { value: good } });
    fireEvent.click(screen.getByRole("button", { name: "Load pasted JSON" }));
    expect(status().textContent).toMatch(/1 unsaved change/);
  });

  it("shows the brand anchors as fixed and offers no control for them", () => {
    const { container } = render(<App />);
    expect(screen.getAllByText("Immutable")).toHaveLength(10);
    expect(screen.queryByLabelText("deep-purple")).toBeNull();
    // the published value is still visible on the anchor's own card
    const cards = container.querySelectorAll(".nise-swatch-card--locked");
    expect(cards).toHaveLength(10);
    const deep = [...cards].find((c) => c.textContent?.includes("deep-purple"));
    expect(deep?.textContent).toContain("#4C207F");
    expect(preview(container).style.getPropertyValue("--deep-purple")).toBe("");
    // …and roles may still point at an anchor
    fireEvent.change(screen.getByLabelText("color-base-100"), { target: { value: "--deep-purple" } });
    expect(preview(container).style.getPropertyValue("--color-base-100")).toBe("var(--deep-purple)");
  });

  it("names what each brand anchor drives, so immutability has a consequence", () => {
    const { container } = render(<App />);
    const cards = [...container.querySelectorAll(".nise-swatch-card--locked")];
    const card = (needle: string) => cards.find((c) => c.textContent?.includes(needle));

    // the page reads the white anchor — the fill it paints, named on its card
    const white = card("white");
    expect(white?.textContent).toContain("drives");
    expect(white?.textContent).toContain("base-100");
    // …and the white anchor is also the label colour on the fills
    expect(white?.textContent).toContain("text on");
    expect(white?.textContent).toContain("primary");

    // the brand ink is the body text and the neutral fill
    const ink = card("ink-plum");
    expect(ink?.textContent).toContain("base-content");
    expect(ink?.textContent).toContain("neutral");

    // the vibrant purple is the secondary fill, not decoration
    expect(card("vibrant-purple")?.textContent).toContain("secondary");
    // the tangerine is an immutable brand anchor
    expect(card("vibrant-tangerine")?.textContent).toContain("#F57A44");
  });

  it("tags a role that reads a brand anchor on the colour page", () => {
    const { container } = render(<App />);
    // navigate to the Colour page of the Foundations section
    fireEvent.click(screen.getByRole("button", { name: /Colour/ }));
    const tagged = [...container.querySelectorAll(".nise-pv__swatch")].filter((s) =>
      s.querySelector(".nise-pv__swatch-tag"),
    );
    expect(tagged.length).toBeGreaterThan(0);
    // base-100 is one of them: it reads the white anchor
    const base = tagged.find((s) => s.textContent?.includes("base-100"));
    expect(base?.querySelector(".nise-pv__swatch-tag")?.textContent).toBe("brand");
  });

  it("shows a role's dark mapping beside its light target", () => {
    const { container } = render(<App />);
    const cards = [...container.querySelectorAll(".nise-swatch-card:not(.nise-swatch-card--locked)")];
    const secondary = cards.find((c) => c.querySelector(".nise-color__name")?.textContent === "color-secondary");
    // the light base is what the explorer edits…
    expect(secondary?.textContent).toContain("points at vibrant-purple");
    // …and the dark mapping is a target of its own, in another family since D22
    expect(secondary?.textContent).toContain("dark mapping");
    expect(secondary?.textContent).toContain("purple-300");
  });

  it("switches the preview between the light and dark mappings", () => {
    const { container } = render(<App />);
    const wrap = preview(container);
    expect(wrap.getAttribute("data-nise-theme")).toBe("light");
    expect(wrap.style.getPropertyValue("--color-base-100")).toBe("var(--white)");

    fireEvent.click(screen.getByRole("button", { name: "Dark" }));
    expect(wrap.getAttribute("data-nise-theme")).toBe("dark");
    expect(wrap.style.getPropertyValue("--color-base-100")).toBe("var(--dark-ground)");
    expect(wrap.style.getPropertyValue("--color-success")).toBe("var(--mint-500)");

    // the review panel says which mapping the promises were checked against
    fireEvent.click(screen.getByRole("button", { name: /Review & export/ }));
    expect(screen.getByText(/· dark mapping/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Light" }));
    expect(wrap.getAttribute("data-nise-theme")).toBe("light");
    expect(wrap.style.getPropertyValue("--color-base-100")).toBe("var(--white)");
  });

  // axe walks the whole token list (262 leaves), which is ~6s — past the 5s
  // default. The budget is for that scan, not for a slow test.
  it(
    "has no automatic accessibility violations",
    async () => {
      const { container } = render(<App />);
      const violations = await axeViolations(container);
      expect(violations, describeViolations(violations)).toEqual([]);
    },
    20_000,
  );
});
