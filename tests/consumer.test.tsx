import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Verify public consumer interface from dist bundle
import {
  Button,
  TextField,
  Avatar,
  Toggle,
  Card,
  Badge,
} from "../dist/index.js";

describe("Consumer Contract", () => {
  it("provides valid package export files and type declarations", () => {
    const pkgPath = resolve(__dirname, "../package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

    expect(pkg.main).toBe("./dist/index.js");
    expect(pkg.types).toBe("./dist/index.d.ts");
    expect(pkg.exports["."].import).toBe("./dist/index.js");
    expect(pkg.exports["./styles.css"]).toBe("./dist/nise-ds.css");
    expect(pkg.exports["./tokens.css"]).toBe("./src/tokens/tokens.css");

    expect(existsSync(resolve(__dirname, "../dist/index.js"))).toBe(true);
    expect(existsSync(resolve(__dirname, "../dist/index.d.ts"))).toBe(true);
    expect(existsSync(resolve(__dirname, "../dist/nise-ds.css"))).toBe(true);
  });

  it("renders components imported through the library entry point", () => {
    render(
      <Card>
        <Badge tone="cyan">Active</Badge>
        <TextField label="Consumer Email" hint="Enter clinic email" />
        <Avatar fallback="DR" />
        <Toggle>Mode</Toggle>
        <Button variant="primary">Submit</Button>
      </Card>,
    );

    expect(screen.getByRole("button", { name: "Submit" })).toHaveClass("nise-button--primary");
    expect(screen.getByLabelText("Consumer Email")).toBeInTheDocument();
    expect(screen.getByText("Enter clinic email")).toBeInTheDocument();
    expect(screen.getByText("DR")).toHaveClass("nise-avatar__fallback");
    expect(screen.getByRole("button", { name: "Mode" })).toHaveClass("nise-toggle");
  });
});
