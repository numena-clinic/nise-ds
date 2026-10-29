import { expect, test } from "@playwright/test";

test.use({ baseURL: "http://127.0.0.1:5175" });

test("the selected tab indicator moves and settles on the keyboard-selected tab", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const notes = page.getByRole("tab", { name: "Session notes" });
  await expect(notes).toHaveAttribute("aria-selected", "true");
  // Slow this test's transition so its intermediate state is observable even
  // on a busy runner; production keeps the existing 200ms token.
  await page.addStyleTag({ content: ":root { --duration-medium: 1000ms; }" });
  await notes.focus();
  await page.keyboard.press("ArrowRight");
  const selected = page.getByRole("tab", { name: "Client context" });
  await expect(selected).toHaveAttribute("aria-selected", "true");
  await expect(selected).toBeFocused();
  const indicator = selected.locator(".nise-tabs__indicator");
  await expect
    .poll(() =>
      indicator.evaluate((element) =>
        element
          .getAnimations()
          .some((animation) => animation.playState === "running"),
      ),
    )
    .toBe(true);
  await indicator.evaluate(async (element) => {
    await Promise.all(
      element
        .getAnimations()
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
  const tabBox = await selected.boundingBox();
  const indicatorBox = await indicator.boundingBox();
  expect(Math.abs(tabBox!.x - indicatorBox!.x)).toBeLessThan(1);
  expect(Math.abs(tabBox!.width - indicatorBox!.width)).toBeLessThan(1);
});

for (const reduced of [false, true]) {
  test(`disclosures and save feedback work with reduced motion ${reduced}`, async ({
    page,
  }) => {
    await page.emulateMedia({
      reducedMotion: reduced ? "reduce" : "no-preference",
    });
    await page.goto("/components/");
    const tile = page.getByRole("region", {
      name: "Accordion specimen",
      exact: true,
    });
    const trigger = tile.getByRole("button").last();
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const panel = tile.locator(".nise-accordion__content").last();
    await expect(panel).toBeVisible();
    await panel.evaluate(async (element) => {
      await Promise.all(
        element
          .getAnimations()
          .map((animation) => animation.finished.catch(() => {})),
      );
    });
    expect((await panel.boundingBox())!.height).toBeGreaterThan(0);
    await trigger.click();
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();

    const details = page.getByRole("region", {
      name: "Collapsible specimen",
      exact: true,
    });
    const detailsTrigger = details.getByRole("button");
    await detailsTrigger.click();
    await expect(details.locator(".nise-collapsible__content")).toBeVisible();
    await detailsTrigger.click();
    await expect(details.locator(".nise-collapsible__content")).toBeHidden();

    await page.goto("/");
    await page
      .getByRole("textbox", { name: "Session summary" })
      .fill("Synthetic note for the motion test.");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByRole("status")).toHaveText(
      "Draft saved for this preview.",
    );
    await expect(page.locator(".nise-workspace__saved-check")).toHaveCount(1);

    await page.getByRole("button", { name: "Review session" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.evaluate(async (element) => {
      await Promise.all(
        element
          .getAnimations()
          .map((animation) => animation.finished.catch(() => {})),
      );
    });
    const box = await dialog.boundingBox();
    const viewport = page.viewportSize()!;
    expect(Math.abs(box!.x + box!.width / 2 - viewport.width / 2)).toBeLessThan(
      1,
    );
    expect(
      Math.abs(box!.y + box!.height / 2 - viewport.height / 2),
    ).toBeLessThan(1);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Review session" }),
    ).toBeFocused();
    if (reduced) {
      const active = await page.evaluate(
        () =>
          document
            .getAnimations()
            .filter(
              (animation) =>
                animation.playState === "running" &&
                animation.effect instanceof KeyframeEffect &&
                animation.effect.target instanceof Element &&
                animation.effect.target.closest(".nise-workspace"),
            ).length,
      );
      expect(active).toBe(0);
    }
  });
}
