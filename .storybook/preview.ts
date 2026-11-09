/* =============================================================================
   Storybook preview
   -----------------------------------------------------------------------------
   Pulls in the single app entry (src/styles/globals.css), which loads the
   generated token layer, Tailwind CSS v4 @theme, and the font faces.
   ============================================================================= */

import "../src/styles/globals.css";
import "./preview.css";

import type { Preview } from "@storybook/react-vite";

const THEME_ATTRIBUTE = "data-theme";

const preview: Preview = {
  decorators: [
    (story, context) => {
      const theme = context.globals.theme as string;
      const root = document.documentElement;
      if (theme === "system") root.removeAttribute(THEME_ATTRIBUTE);
      else root.setAttribute(THEME_ATTRIBUTE, theme);
      return story();
    },
  ],
  globalTypes: {
    theme: {
      description: "Preview colour theme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        dynamicTitle: true,
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
          { value: "system", title: "System", icon: "browser" },
        ],
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  parameters: {
    controls: { expanded: true },
    options: {
      storySort: {
        order: ["Foundations", "Foundational", "Product", "Compositions"],
      },
    },
    a11y: {
      test: "error",
    },
  },
};

export default preview;
