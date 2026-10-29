import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://127.0.0.1:6006",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
          args: [
            "--no-sandbox",
            "--use-gl=angle",
            "--use-angle=swiftshader",
            "--disable-dev-shm-usage",
          ],
        }
      : {},
  },
  webServer: [
    {
      command: "npm run preview:storybook",
      url: "http://127.0.0.1:6006",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run preview:site",
      url: "http://127.0.0.1:5175",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
