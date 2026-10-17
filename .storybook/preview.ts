/* =============================================================================
   Storybook preview
   -----------------------------------------------------------------------------
   Pulls in the single app entry (src/styles/globals.css), which loads the
   generated token layer and the font faces. Components never import tokens
   themselves, so there is exactly one source of truth for token values.
   ============================================================================= */

import "../src/styles/globals.css";

import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    a11y: {
      // 'error' turns every found violation into a failing check in the a11y
      // panel. The audit runs axe over the whole document, so it sees the
      // aria-hidden behaviour Radix applies while a popup is open.
      test: "error",
      config: {
        rules: [
          {
            // Radix non-modal overlays hide the rest of the document via
            // @radix-ui/react-dismissable-layer and manage focus themselves.
            // axe cannot know that, so it flags a false positive whenever a
            // Select popup is open. Genuine violations are still caught.
            id: "aria-hidden-focus",
            enabled: false,
          },
        ],
      },
    },
  },
};

export default preview;
