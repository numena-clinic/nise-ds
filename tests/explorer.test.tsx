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
  fireEvent.click(screen.getByRole("tab", { name: label }));
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
    fireEvent.change(screen.getByLabelText("deep-purple"), { target: { value: "#000000" } });

    expect(preview(container).style.getPropertyValue("--deep-purple")).toBe("#000000");
    expect(status().textContent).toMatch(/1 unsaved change/);
    // the document root is never touched
    expect(document.documentElement.style.getPropertyValue("--deep-purple")).toBe("");
  });

  it("shows a reset affordance for a changed token and restores the default", () => {
    const { container } = render(<App />);
    fireEvent.change(screen.getByLabelText("deep-purple"), { target: { value: "#000000" } });
    expect(screen.getByRole("button", { name: /Reset --deep-purple/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Reset --deep-purple/ }));
    expect(preview(container).style.getPropertyValue("--deep-purple")).toBe("");
    expect(status().textContent).toMatch(/No changes/);
  });

  it("resets every change at once", () => {
    const { container } = render(<App />);
    fireEvent.change(screen.getByLabelText("deep-purple"), { target: { value: "#000000" } });

    switchTab("Space");
    fireEvent.change(screen.getByLabelText("space-3"), { target: { value: "13px" } });
    expect(status().textContent).toMatch(/2 unsaved changes/);

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(status().textContent).toMatch(/No changes/);
    expect(preview(container).style.getPropertyValue("--space-3")).toBe("");
  });

  it("retargets a colour role through its select", () => {
    const { container } = render(<App />);
    fireEvent.change(screen.getByLabelText("color-surface"), {
      target: { value: "--soft-purple" },
    });
    expect(preview(container).style.getPropertyValue("--color-surface")).toBe("var(--soft-purple)");
  });

  it("reviews the diff and prints the local promotion command", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("deep-purple"), { target: { value: "#000000" } });
    fireEvent.click(screen.getByRole("button", { name: /Review & export/ }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Review & export" })).toBeInTheDocument();
    expect(within(dialog).getByText("deep-purple")).toBeInTheDocument();
    expect(screen.getByText("npm run theme:apply -- theme-candidate.json")).toBeInTheDocument();
    expect(screen.getByText(/"nise.theme-candidate"/)).toBeInTheDocument();
  });

  it("reports a broken contrast promise in the review", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("white"), { target: { value: "#221A2A" } });
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
      tokens: [{ name: "--deep-purple", layer: "primitive", kind: "value", value: "#123456", from: "#4C207F" }],
    });
    fireEvent.change(textarea, { target: { value: good } });
    fireEvent.click(screen.getByRole("button", { name: "Load pasted JSON" }));
    expect(status().textContent).toMatch(/1 unsaved change/);
  });

  it("has no automatic accessibility violations", async () => {
    const { container } = render(<App />);
    const violations = await axeViolations(container);
    expect(violations, describeViolations(violations)).toEqual([]);
  });
});
