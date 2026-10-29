import { expect, test } from "@playwright/test";
import axe from "axe-core";

test.use({ baseURL: "http://127.0.0.1:5175" });

test("the standalone site navigates, preserves theme and contains no Storybook runtime", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const navigation = page.getByRole("navigation", { name: "Showcase" });
  await page.getByRole("button", { name: "Dark theme", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await navigation
    .getByRole("link", { name: "Components", exact: true })
    .click();
  await expect(page).toHaveURL(/\/components\/$/);
  await expect(page.getByRole("region", { name: /specimen$/ })).toHaveCount(30);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.getByRole("region", { name: /specimen$/ })).toHaveCount(30);
  expect(
    await page
      .locator('img[src$="numena-symbol.svg"]')
      .evaluateAll((images) =>
        images.every((image) => (image as HTMLImageElement).naturalWidth > 0),
      ),
  ).toBe(true);
  await navigation
    .getByRole("link", { name: "React Aria", exact: true })
    .click();
  await expect(page).toHaveURL(/\/aria\/$/);
  await expect(page.getByRole("region", { name: /recipe$/ })).toHaveCount(57);
  await expect(page.locator("iframe")).toHaveCount(0);
  expect(await page.locator('script[src*="storybook"]').count()).toBe(0);
});

for (const theme of ["light", "dark"]) {
  test(`standalone Aria catalog and site navigation pass axe in ${theme} and reflow`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/aria/?theme=${theme}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const violations = await page.evaluate(async (source) => {
      const script = document.createElement("script");
      script.textContent = source;
      document.head.appendChild(script);
      return (
        await (window as unknown as { axe: typeof axe }).axe.run(document, {
          runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
        })
      ).violations.map((v) => ({
        id: v.id,
        targets: v.nodes.map((n) => n.target),
      }));
    }, axe.source);
    expect(violations).toEqual([]);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}
