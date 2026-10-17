import axe from "axe-core";

/**
 * Run axe over a rendered container and return its violations.
 *
 * Two rules are disabled by design:
 * · color-contrast — jsdom performs no layout, so it cannot be computed. That
 *   promise is proven by `npm run tokens:validate`, which checks resolved token
 *   pairs against their WCAG ratios.
 * · region — a page-level best practice ("all content in landmarks") that does
 *   not hold for a component fragment rendered into a bare <div>.
 */
export async function axeViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      "color-contrast": { enabled: false },
      region: { enabled: false },
    },
  });
  return results.violations;
}

export function describeViolations(violations: Awaited<ReturnType<typeof axeViolations>>) {
  return violations
    .map((v) => `${v.id}: ${v.help} (${v.nodes.length} node(s))`)
    .join("\n");
}
