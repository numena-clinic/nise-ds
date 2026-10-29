/** Standalone showcase entry; shares real compositions with the design system.
 * Navigation uses static HTML pages and the theme uses existing token mappings.
 * No Storybook runtime or iframe is used by the site. */
import { lazy, Suspense, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "../index";
import "../styles/globals.css";
import "./site.css";

const Demo = lazy(() =>
  import("../showcase/SessionWorkspace").then((module) => ({
    default: module.SessionWorkspace,
  })),
);
const Components = lazy(() =>
  import("../showcase/ComponentGallery").then((module) => ({
    default: module.ComponentGallery,
  })),
);
const Catalog = lazy(() =>
  import("../aria/Catalog").then((module) => ({ default: module.AriaCatalog })),
);
const page = document.documentElement.dataset.page;
const base = import.meta.env.BASE_URL;

function Site() {
  const [dark, setDark] = useState(
    document.documentElement.dataset.theme === "dark",
  );
  function toggleTheme() {
    const theme = dark ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    setDark(!dark);
    try {
      localStorage.setItem("nise-showcase-theme", theme);
    } catch {
      /* Storage may be disabled; the visible toggle still works. */
    }
  }
  const Content =
    page === "components" ? Components : page === "aria" ? Catalog : Demo;
  return (
    <>
      <a className="nise-site__skip" href="#showcase-content">
        Skip to content
      </a>
      <header className="nise-site__header">
        <a className="nise-site__identity" href={base}>
          Nise<span>Design system for Numena</span>
        </a>
        <nav className="nise-site__nav" aria-label="Showcase">
          <a href={base} aria-current={page === "demo" ? "page" : undefined}>
            Interface demo
          </a>
          <a
            href={`${base}components/`}
            aria-current={page === "components" ? "page" : undefined}
          >
            Components
          </a>
          <a
            href={`${base}aria/`}
            aria-current={page === "aria" ? "page" : undefined}
          >
            React Aria
          </a>
          <a href="https://github.com/numena-clinic/nise-ds#readme">
            Documentation
          </a>
        </nav>
        <Button
          size="sm"
          variant="secondary"
          aria-pressed={dark}
          onClick={toggleTheme}
        >
          Dark theme
        </Button>
      </header>
      <div id="showcase-content" tabIndex={-1}>
        <Suspense
          fallback={
            <p className="nise-site__loading" role="status">
              Loading showcase…
            </p>
          }
        >
          <Content />
        </Suspense>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<Site />);
