// Vite config for the Theme Explorer (the standalone design tool).
//
// Deliberately named `vite.config.explorer.ts` rather than `vite.config.ts`:
// @storybook/builder-vite auto-loads a root `vite.config.*` and merges it into
// the Storybook build. Keeping this file out of that default filename keeps the
// explorer's tooling entirely separate from Storybook, so neither can disturb
// the other. Invoke it explicitly:
//
//   npm run dev            vite --config vite.config.explorer.ts
//   npm run build:explorer vite build --config vite.config.explorer.ts
//
// The explorer is a design tool, not a product page — the build is a static
// bundle with a single CSS chunk and no code-splitting surprises.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    target: "es2022",
  },
  server: {
    port: 5173,
    open: false,
  },
  preview: {
    port: 5174,
  },
});
