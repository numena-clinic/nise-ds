import { expect, test } from "@playwright/test";
import axe from "axe-core";

const story = (name: string) =>
  `/iframe.html?id=react-aria-catalog--${name}&viewMode=story`;

for (const theme of ["all-components", "dark-catalog"]) {
  test(`${theme}: all catalog recipes render, pass axe and reflow`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(story(theme));
    await expect(
      page.getByRole("heading", { name: "React Aria catalog", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("region", { name: / recipe$/ })).toHaveCount(
      57,
    );
    const violations = await page.evaluate(async (source) => {
      const script = document.createElement("script");
      script.textContent = source;
      document.head.appendChild(script);
      const audit = (window as unknown as { axe: typeof axe }).axe;
      const result = await audit.run(document, {
        runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
      });
      return result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
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

test("composed controls preserve upstream state and keyboard interactions", async ({
  page,
}) => {
  await page.goto(story("all-components"));
  const tile = (name: string) =>
    page.getByRole("region", { name: `${name} recipe`, exact: true });
  await tile("NumberField")
    .getByRole("button", { name: "Increase minutes" })
    .click();
  await expect(tile("NumberField").getByRole("textbox")).toHaveValue("55");
  await tile("Autocomplete").getByRole("searchbox").fill("hypothesis");
  await expect(tile("Autocomplete").getByRole("option")).toHaveCount(1);
  await tile("TagGroup")
    .getByRole("button", { name: "Remove Observation" })
    .click();
  await expect(
    tile("TagGroup").getByText("Observation", { exact: true }),
  ).toHaveCount(0);
  await tile("DatePicker").getByRole("button").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Next month" }).click();
  await expect(page.getByRole("dialog")).toContainText("November 2026");
  await page.keyboard.press("Escape");
  await expect(tile("DatePicker").getByRole("button")).toBeFocused();
  await tile("Dialog").getByRole("button").click();
  await expect(
    page.getByRole("dialog", { name: "Review sources" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close review" }).click();
  await expect(tile("Dialog").getByRole("button")).toBeFocused();
  await tile("Toast")
    .getByRole("button", { name: "Show notification" })
    .click();
  await expect(
    page.getByText("Draft saved locally.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Dismiss notification" }).click();
  await expect(
    page.getByText("Draft saved locally.", { exact: true }),
  ).toHaveCount(0);
  await tile("Sheet").getByRole("button").click();
  await expect(
    page.getByRole("dialog", { name: "Review sheet" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close sheet" }),
  ).toBeInViewport();
  await page.getByRole("button", { name: "Close sheet" }).click();
  await expect(tile("Sheet").getByRole("button")).toBeFocused();
});

test("virtualization renders a bounded window and reaches the final item", async ({
  page,
}) => {
  await page.goto(story("virtualizer"));
  const list = page.getByRole("listbox", { name: "Thousand sources" });
  await expect(list.getByRole("option").first()).toBeVisible();
  expect(await list.getByRole("option").count()).toBeLessThan(100);
  await list.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(
    list.getByRole("option", { name: "Source 1000", exact: true }),
  ).toBeVisible();
});

test("portaled content retains a nested theme boundary", async ({ page }) => {
  await page.goto(story("scoped-theme"));
  await page.getByRole("button", { name: "Source details" }).click();
  const popup = page.locator(".react-aria-Popover");
  await expect(popup).toBeVisible();
  expect(
    await popup.evaluate((element) => {
      const ancestor = element.closest('[data-theme="dark"]');
      return (
        !!ancestor &&
        getComputedStyle(element)
          .getPropertyValue("--color-base-100")
          .trim() ===
          getComputedStyle(ancestor).getPropertyValue("--color-base-100").trim()
      );
    }),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Source details" }),
  ).toBeFocused();
});

test("collection selection, expansion and range keyboard editing work", async ({
  page,
}) => {
  await page.goto(story("all-components"));
  const tile = (name: string) =>
    page.getByRole("region", { name: `${name} recipe`, exact: true });
  await tile("Tree").getByRole("button", { name: "Toggle Sessions" }).click();
  await expect(
    tile("Tree").getByRole("row", { name: "October" }),
  ).toBeVisible();
  await tile("ListBox")
    .getByRole("option", { name: "Client report", exact: true })
    .click();
  await expect(
    tile("ListBox").getByRole("option", { name: "Client report", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  const minimum = tile("Slider").getByRole("slider", {
    name: /Minimum duration/,
  });
  await minimum.focus();
  await page.keyboard.press("ArrowRight");
  await expect(minimum).toHaveValue("21");
  const maximum = tile("Slider").getByRole("slider", {
    name: /Maximum duration/,
  });
  await maximum.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(maximum).toHaveValue("69");
  await tile("Menu").getByRole("button").click();
  await expect(
    page.getByRole("menu", { name: "Source actions" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tile("Menu").getByRole("button")).toBeFocused();
});

test("file selection stays local and native form validation prevents empty submission", async ({
  page,
}) => {
  await page.goto(story("all-components"));
  const file = page.getByRole("region", {
    name: "FileTrigger recipe",
    exact: true,
  });
  await file
    .locator('input[type="file"]')
    .setInputFiles({
      name: "fictional-note.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Synthetic source"),
    });
  await expect(file.getByRole("status")).toHaveText("fictional-note.txt");
  const form = page.getByRole("region", { name: "Form recipe", exact: true });
  await form.getByRole("button", { name: "Subscribe" }).click();
  await expect(form.getByRole("status")).toHaveCount(0);
  await form
    .getByRole("textbox", { name: "Work email" })
    .fill("example@example.test");
  await form.getByRole("button", { name: "Subscribe" }).click();
  await expect(form.getByRole("status")).toHaveText(
    "Submitted locally. Nothing was sent.",
  );
});
