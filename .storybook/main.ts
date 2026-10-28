import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs", "@storybook/addon-mcp"],
  staticDirs: ["../public"],
  features: { componentsManifest: true },
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  // reactDocgen stays on so autodocs prop tables are derived from the real
  // component types — the docs cannot drift from the implementation.
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
};

export default config;
