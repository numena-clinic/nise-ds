import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const path = (value: string) => fileURLToPath(new URL(value, import.meta.url));
export default defineConfig({
  root: path("./site"),
  publicDir: path("./public"),
  plugins: [react(), tailwindcss()],
  server: { port: 5173, fs: { allow: [path(".")] } },
  build: {
    outDir: path("./dist-site"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        demo: path("./site/index.html"),
        components: path("./site/components/index.html"),
      },
    },
  },
});
