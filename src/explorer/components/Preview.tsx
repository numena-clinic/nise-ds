// The live preview canvas.
//
// The selected sidebar page renders here, inside a wrapper carrying the
// experimental values as scoped CSS custom properties — never on :root, so
// the explorer's own chrome is untouched. Component and pattern pages are the
// REAL Nise components; foundation pages are reference views over the same
// scoped properties; the token-graph page lays out the whole graph with live
// values.
//
// A device toggle constrains the canvas width so a theme can be judged at
// phone, tablet and desktop size without leaving the page, and a theme toggle
// switches the preview between the light mapping and the dark mapping of the
// same edits (the wrapper pins the theme's own values — see previewStyle).
//
// The Select popup portals to document.body by default, which would escape the
// wrapper and lose the scoped variables; it is pointed at the wrapper instead.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  experimentalTokens,
  previewStyle,
  type Overrides,
  type ThemeMode,
} from "../theme/theme";
import { TokenReference } from "./TokenReference";
import {
  COMPONENT_PAGES,
  FOUNDATION_PAGES,
  PATTERN_PAGES,
  type PageRenderContext,
} from "./pages";
import { FOUNDATION_TAB_MAP, TOKEN_GRAPH_PAGE } from "./Sidebar";

interface Props {
  overrides: Overrides;
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
  pageId: string;
}

type Device = "mobile" | "tablet" | "desktop";

const DEVICES: { id: Device; label: string; width: string }[] = [
  { id: "mobile", label: "Phone", width: "390px" },
  { id: "tablet", label: "Tablet", width: "768px" },
  { id: "desktop", label: "Desktop", width: "100%" },
];

const MODES: { id: ThemeMode; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

const ALL_SPECIMEN_PAGES = [...COMPONENT_PAGES, ...PATTERN_PAGES];

export function Preview({ overrides, mode, onModeChange, pageId }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  useEffect(() => setPortalContainer(wrapperRef.current), []);

  const map = experimentalTokens(overrides, mode);
  const style = previewStyle(overrides, mode) as CSSProperties;
  const width = DEVICES.find((d) => d.id === device)?.width ?? "100%";

  let content: ReactNode;
  let title: string;

  const foundation = FOUNDATION_PAGES.find((p) => p.id === pageId);
  if (foundation && pageId in FOUNDATION_TAB_MAP) {
    title = foundation.title;
    content = foundation.render({ portalContainer, map });
  } else if (pageId === TOKEN_GRAPH_PAGE) {
    title = "Token graph";
    content = <TokenReference overrides={overrides} query="" mode={mode} />;
  } else {
    const page = ALL_SPECIMEN_PAGES.find((p) => p.id === pageId);
    const ctx: PageRenderContext = { portalContainer, map };
    title = page?.title ?? "Component";
    content = page ? page.render(ctx) : null;
  }

  return (
    <div className="nise-preview">
      <div className="nise-preview__toolbar">
        <div className="nise-preview__group" role="group" aria-label="Preview theme">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={mode === m.id}
              className={`nise-preview__seg ${mode === m.id ? "nise-preview__seg--on" : ""}`}
              onClick={() => onModeChange(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="nise-preview__group" role="group" aria-label="Preview width">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={device === d.id}
              className={`nise-preview__seg ${device === d.id ? "nise-preview__seg--on" : ""}`}
              onClick={() => setDevice(d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="nise-explorer__preview"
        ref={wrapperRef}
        style={{ ...style, maxWidth: width }}
        data-nise-theme={mode}
      >
        <div className="nise-explorer__page">
          <h2 className="nise-explorer__page-title">{title}</h2>
          {content}
        </div>
      </div>
    </div>
  );
}
