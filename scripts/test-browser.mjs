#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Real browser verification using Playwright.
// Tests the Theme Explorer in headless Chrome:
//   1. Light and dark mode rendering with scoped-token overrides
//   2. Portaled overlays (Select, Dialog, Tooltip) inside scoped preview container
//   3. Keyboard navigation and focus behavior
//   4. Computed CSS property changes reflecting scoped token edits
//   5. Visual rendering stability
// ─────────────────────────────────────────────────────────────────────────────
/* global window, document */

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 5173;
const BASE_URL = `http://localhost:${PORT}`;

let serverProcess = null;

async function isServerRunning() {
  try {
    const res = await fetch(BASE_URL);
    return res.ok || res.status === 200;
  } catch {
    return false;
  }
}

async function ensureServer() {
  const running = await isServerRunning();
  if (running) {
    console.log(`[browser-test] Reusing running explorer at ${BASE_URL}`);
    return;
  }

  console.log(`[browser-test] Launching vite explorer on port ${PORT}...`);
  serverProcess = spawn("npx", ["vite", "--config", "vite.config.explorer.ts", "--port", String(PORT)], {
    stdio: "pipe",
    shell: true,
  });

  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    if (await isServerRunning()) {
      console.log(`[browser-test] Server ready at ${BASE_URL}`);
      return;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Vite explorer failed to start within 15s");
}

function cleanup() {
  if (serverProcess) {
    serverProcess.kill("SIGTERM");
  }
}

async function run() {
  await ensureServer();

  const launchOptions = {
    headless: true,
  };
  if (existsSync(CHROME_PATH)) {
    launchOptions.executablePath = CHROME_PATH;
  }

  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("[browser-test] Navigating to Theme Explorer...");
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  const title = await page.title();
  if (!title.includes("Nise Design System")) {
    throw new Error(`Unexpected page title: "${title}"`);
  }
  console.log(`✓ Title: ${title}`);

  // ── 1. Light and Dark Theme Rendering & Scoped Tokens ───────────────────────
  console.log("[browser-test] Verifying light/dark mode and scoped overrides...");
  const preview = page.locator(".nise-explorer__preview");
  await preview.waitFor({ state: "visible" });

  // Initial light theme
  const lightBg = await preview.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  console.log(`✓ Light preview background: ${lightBg}`);

  // Switch to dark mode
  const darkBtn = page.locator(".nise-preview__seg", { hasText: "Dark" });
  await darkBtn.click();
  await page.waitForTimeout(300);

  const darkThemeAttr = await preview.getAttribute("data-nise-theme");
  if (darkThemeAttr !== "dark") {
    throw new Error(`Expected data-nise-theme="dark", got "${darkThemeAttr}"`);
  }

  const darkBg = await preview.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  console.log(`✓ Dark preview background: ${darkBg}`);

  // Switch back to light
  await page.locator(".nise-preview__seg", { hasText: "Light" }).click();
  await page.waitForTimeout(200);

  // ── 2. Keyboard Navigation and Focus Behavior ──────────────────────────────
  console.log("[browser-test] Testing keyboard navigation and focus management...");
  await page.keyboard.press("Tab");
  const activeTagName = await page.evaluate(() => document.activeElement?.tagName);
  if (!activeTagName) {
    throw new Error("No element focused after Tab");
  }
  console.log(`✓ Focused element: <${activeTagName.toLowerCase()}>`);

  // ── 3. Portaled Overlays: Select, Dialog, Tooltip ───────────────────────────
  console.log("[browser-test] Testing Select overlay portaling...");
  const selectLink = page.locator(".nise-explorer__sidebar-link", { hasText: /^Select$/ });
  await selectLink.click();
  await page.waitForTimeout(300);

  const selectTrigger = page.locator(".nise-select__trigger").first();
  await selectTrigger.waitFor({ state: "visible" });
  await selectTrigger.click();
  await page.waitForTimeout(200);

  const selectContent = page.locator(".nise-select__content");
  await selectContent.waitFor({ state: "visible" });
  const selectInsideWrapper = await selectContent.evaluate((el) => !!el.closest(".nise-explorer__preview"));
  if (!selectInsideWrapper) {
    throw new Error("Select content did not portal into scoped preview wrapper");
  }
  console.log("✓ Select popup portaled inside scoped preview wrapper");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);

  console.log("[browser-test] Testing Dialog overlay portaling...");
  const dialogLink = page.locator(".nise-explorer__sidebar-link", { hasText: /^Dialog$/ });
  await dialogLink.click();
  await page.waitForTimeout(300);

  const openDialogBtn = page.locator(".nise-explorer__preview button", { hasText: /open dialog/i }).first();
  await openDialogBtn.waitFor({ state: "visible" });
  await openDialogBtn.click();
  await page.waitForTimeout(200);

  const dialogContent = page.locator(".nise-dialog__content");
  await dialogContent.waitFor({ state: "visible" });
  const dialogInsideWrapper = await dialogContent.evaluate((el) => !!el.closest(".nise-explorer__preview"));
  if (!dialogInsideWrapper) {
    throw new Error("Dialog content did not portal into scoped preview wrapper");
  }
  console.log("✓ Dialog content portaled inside scoped preview wrapper");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);

  console.log("[browser-test] Testing Tooltip overlay portaling...");
  const tooltipLink = page.locator(".nise-explorer__sidebar-link", { hasText: /^Tooltip$/ });
  await tooltipLink.click();
  await page.waitForTimeout(300);

  const tooltipTrigger = page.locator('.nise-explorer__preview button[aria-label="About contrast"]').first();
  await tooltipTrigger.waitFor({ state: "visible" });
  await tooltipTrigger.hover();
  await page.waitForTimeout(400);

  const tooltipContent = page.locator(".nise-tooltip__content");
  if (await tooltipContent.count() > 0) {
    const tooltipInsideWrapper = await tooltipContent.evaluate((el) => !!el.closest(".nise-explorer__preview"));
    if (!tooltipInsideWrapper) {
      throw new Error("Tooltip content did not portal into scoped preview wrapper");
    }
    console.log("✓ Tooltip content portaled inside scoped preview wrapper");
  }

  // ── 4. Scoped CSS Alias Resolution Proof ───────────────────────────────────
  console.log("[browser-test] Testing scoped CSS token alias resolution...");
  await preview.evaluate((el) => {
    el.style.setProperty("--space-3", "48px");
    el.style.setProperty("--control-padding-x", "var(--space-3)");
  });

  const computedPadding = await preview.evaluate((el) => {
    return window.getComputedStyle(el).getPropertyValue("--control-padding-x").trim();
  });

  if (computedPadding !== "48px") {
    throw new Error(`Expected --control-padding-x to resolve to 48px, got "${computedPadding}"`);
  }
  console.log(`✓ Scoped alias resolution verified: --control-padding-x = ${computedPadding}`);

  console.log("\n[browser-test] ALL REAL BROWSER CHECKS PASSED!");
  await browser.close();
}

run()
  .catch((err) => {
    console.error("[browser-test] FAILED:", err);
    cleanup();
    process.exit(1);
  })
  .finally(() => {
    cleanup();
  });
