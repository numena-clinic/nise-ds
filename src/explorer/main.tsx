// Entry point for the Theme Explorer — the standalone design tool, served by
// `npm run dev` (Vite). It mounts the explorer into #root and pulls in the real
// design-system stylesheet, so the preview is styled by the same CSS the app
// ships. No product code lives here; the explorer only reads tokens and renders
// the real components.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/globals.css";
import { App } from "./App";
import "./explorer.css";

const container = document.getElementById("root");
if (!container) throw new Error("Theme Explorer: #root element not found");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
