import { expect, test } from "@playwright/test";
const story = (id: string) =>
  `/iframe.html?id=portfolio-session-workspace--${id}&viewMode=story`;

test("a draft can be edited, discarded, saved and reviewed", async ({
  page,
}) => {
  await page.goto(story("default"));
  const summary = page.getByRole("textbox", { name: "Session summary" });
  const original = await summary.inputValue();
  await summary.fill("A new fictional session note.");
  await expect(page.getByRole("status")).toHaveText("Unsaved changes");
  await page.getByRole("button", { name: "Discard changes" }).click();
  await expect(summary).toHaveValue(original);
  await summary.fill("A new fictional session note.");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Draft saved for this preview.",
  );
  await page.getByRole("button", { name: "Review session" }).click();
  const dialog = page.getByRole("dialog", { name: "Review session 04" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("A new fictional session note.");
  await expect(dialog).toHaveAccessibleDescription(
    "This preview keeps changes in browser memory only.",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Review session" }),
  ).toBeFocused();
  await summary.fill("Saved from the review dialog.");
  await page.getByRole("button", { name: "Review session" }).click();
  await dialog.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("status")).toHaveText(
    "Draft saved for this preview.",
  );
  const source = page.getByRole("button", { name: /Information source/ });
  await source.click();
  await page
    .getByRole("option", { name: "Session observation", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Unsaved changes");
  await page.getByRole("button", { name: "Discard changes" }).click();
  await expect(source).toContainText("Client report");
  const sessions = page.getByRole("navigation", { name: "Sessions" });
  await sessions.getByRole("button", { name: /14 October/ }).click();
  await expect(summary).not.toHaveValue("Saved from the review dialog.");
  await sessions.getByRole("button", { name: /28 October/ }).click();
  await expect(summary).toHaveValue("Saved from the review dialog.");
});

test("the gallery contains all 30 families and working selection controls", async ({
  page,
}) => {
  await page.goto(story("component-collection"));
  await expect(page.getByRole("region", { name: /specimen$/ })).toHaveCount(30);
  const select = page.getByRole("region", {
    name: "Select specimen",
    exact: true,
  });
  await select.getByRole("button").click();
  await page.getByRole("option", { name: "Observation", exact: true }).click();
  await expect(select.getByRole("button")).toContainText("Observation");
  await expect(select.getByRole("button")).toBeFocused();
  const tooltip = page.getByRole("region", {
    name: "Tooltip specimen",
    exact: true,
  });
  const previousTrigger = page
    .getByRole("region", { name: "Dialog specimen", exact: true })
    .getByRole("button");
  await previousTrigger.scrollIntoViewIfNeeded();
  await previousTrigger.focus();
  await page.keyboard.press("Tab");
  await expect(tooltip.getByRole("button")).toBeFocused();
  await expect(page.getByRole("tooltip")).toContainText(
    "Sources describe where information came from.",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toBeHidden();
});

for (const id of [
  "default",
  "dark",
  "component-collection",
  "dark-collection",
]) {
  test(`${id} renders without page errors and reflows on a phone`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(story(id));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const root = page.locator(
      id.includes("collection") ? ".nise-gallery" : ".nise-workspace",
    );
    await expect(root).toHaveCSS(
      "background-color",
      id.includes("dark")
        ? id.includes("collection")
          ? "rgb(34, 26, 42)"
          : "rgb(23, 18, 29)"
        : id.includes("collection")
          ? "rgb(244, 241, 248)"
          : "rgb(255, 255, 255)",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("slider geometry and keyboard values follow React Aria", async ({
  page,
}) => {
  await page.goto(story("component-collection"));
  const tile = page.getByRole("region", {
    name: "Slider specimen",
    exact: true,
  });
  const input = tile.getByRole("slider");
  await input.focus();
  await page.keyboard.press("ArrowRight");
  await expect(input).toHaveValue("61");
  const track = await tile.locator(".nise-slider__root").boundingBox();
  const thumb = await tile.locator(".nise-slider__thumb").boundingBox();
  expect(track).not.toBeNull();
  expect(thumb).not.toBeNull();
  expect(
    Math.abs(thumb!.y + thumb!.height / 2 - (track!.y + track!.height / 2)),
  ).toBeLessThan(1);
});
