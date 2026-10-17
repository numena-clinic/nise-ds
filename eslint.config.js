// @ts-check
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "storybook-static/**",
      "dist/**",
      "coverage/**",
      // Generated from tokens/*.mjs — never hand-edited.
      "src/tokens/tokens.css",
      "tokens/dist/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    // Token pipeline and validation scripts: plain Node ESM.
    files: ["**/*.{mjs,js}"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
);
