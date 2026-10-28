/* =============================================================================
   Storybook preview
   -----------------------------------------------------------------------------
   Pulls in the single app entry (src/styles/globals.css), which loads the
   generated token layer and the font faces. Components never import tokens
   themselves, so there is exactly one source of truth for token values.

   Theme selection: the generated layer defines light on :root and dark under
   [data-theme="dark"] / prefers-color-scheme (src/tokens/tokens.css). Without a
   control the preview iframe simply followed the OS preference, so on a dark OS
   light could not be seen. The toolbar below writes the SAME data-theme
   attribute the app uses, onto the preview document root — no second theme
   implementation. "System" removes the attribute so the media query decides.
   ============================================================================= */

import "../src/styles/globals.css";
// Repoints Storybook's own docs surfaces (white panels, tables, code blocks) at
// the theme tokens, so the Docs pages follow the toolbar theme too.
import "./preview.css";

import type { Preview } from "@storybook/react-vite";

/** The attribute the generated token layer keys themes off (docs/theme.md). */
const THEME_ATTRIBUTE = "data-theme";

const preview: Preview = {
  decorators: [
    (story, context) => {
      const theme = context.globals.theme as string;
      const root = document.documentElement;
      // "system" must leave prefers-color-scheme in charge, so the attribute is
      // removed rather than set to a value the CSS would have to interpret.
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
    options: { storySort: { order: ["Portfolio", "Foundations", "Components", "Compositions"] } },
    a11y: {
      // 'error' turns every found violation into a failing check in the a11y panel.
      test: "error",
    },
  },
};

export default preview;
