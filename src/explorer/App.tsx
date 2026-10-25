// The Theme Explorer shell.
//
// It holds three pieces of state — the override map (the only thing that
// changes what is authored), the preview's light/dark view mode, and the
// selected sidebar page — and wires them to the four surfaces: the sidebar
// index (far left), the parameter pane (left, on foundation pages), the live
// preview canvas (right), and the review drawer. The override map is the ONLY
// thing that changes; the token source is untouched until you promote a
// candidate from the command line.
//
// The sidebar indexes the page registry: Foundations (each section drives the
// parameter pane), Components (one page per family) and Patterns. The
// parameter pane only appears on foundation pages — a component page is a
// documentation view; come back to Foundations to edit.
//
// The draft is persisted to localStorage so a refresh does not lose work, but
// that draft is a convenience only — it is never treated as applied. Reset
// clears it. Controls are grouped and labelled so a keyboard or screen-reader
// user can move through them the way a sighted mouse user would.
//
// The Nise components in the preview need a tooltip provider; it is inert
// unless a tooltip is opened.

import { useCallback, useEffect, useMemo, useState } from "react";
import { TooltipProvider } from "../index";
import type { Section } from "./theme/tokens";
import {
  changeCount,
  prune,
  type Override,
  type Overrides,
  type ThemeMode,
} from "./theme/theme";
import { TokenPanel } from "./components/TokenPanel";
import { Preview } from "./components/Preview";
import { ReviewPanel } from "./components/ReviewPanel";
import { FOUNDATION_TAB_MAP, Sidebar } from "./components/Sidebar";

const DRAFT_KEY = "nise.theme.draft";
const DEFAULT_PAGE = "found-color";

function loadDraft(): Overrides {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) return prune(parsed as Overrides);
  } catch {
    /* a corrupt or unavailable draft is not an error — start empty */
  }
  return {};
}

export function App() {
  const [overrides, setOverrides] = useState<Overrides>(loadDraft);
  const [reviewOpen, setReviewOpen] = useState(false);
  // Which mapping the preview and the contrast re-check are judged under. It is
  // a VIEW choice only — edits always target the light base (D19), and the dark
  // mapping of the same edits is what the dark toggle shows.
  const [mode, setMode] = useState<ThemeMode>("light");
  // The selected sidebar page. Foundation pages (found-color…found-motion)
  // also drive the section the parameter pane edits.
  const [pageId, setPageId] = useState<string>(DEFAULT_PAGE);

  useEffect(() => {
    try {
      const clean = prune(overrides);
      if (Object.keys(clean).length === 0) localStorage.removeItem(DRAFT_KEY);
      else localStorage.setItem(DRAFT_KEY, JSON.stringify(clean));
    } catch {
      /* private mode / quota — the draft just does not persist */
    }
  }, [overrides]);

  const setOverride = useCallback((name: string, o: Override) => {
    setOverrides((prev) => ({ ...prev, [name]: o }));
  }, []);

  const resetToken = useCallback((name: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const resetAll = useCallback(() => setOverrides({}), []);

  const replaceAll = useCallback((o: Overrides) => setOverrides(o), []);

  const changed = useMemo(() => changeCount(overrides), [overrides]);

  const tab = (FOUNDATION_TAB_MAP[pageId] ?? "color") as Section;
  const showPanel = pageId in FOUNDATION_TAB_MAP;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="nise-explorer">
        <header className="nise-explorer__topbar">
          <div className="nise-explorer__brand">
            <span className="nise-explorer__mark" aria-hidden="true">
              <img src="/numena-symbol.svg" alt="" width={26} height={22} />
            </span>
            <div>
              <h1 className="nise-explorer__title">Theme Explorer</h1>
              <p className="nise-explorer__subtitle">Nise Design System · sandbox</p>
            </div>
          </div>

          <div className="nise-explorer__topbar-actions">
            <p className="nise-explorer__status" role="status" aria-label="Unsaved changes" aria-live="polite">
              {changed === 0 ? "No changes" : `${changed} unsaved change${changed === 1 ? "" : "s"}`}
            </p>
            <button
              type="button"
              className="nise-explorer__btn"
              onClick={resetAll}
              disabled={changed === 0}
            >
              Reset
            </button>
            <button
              type="button"
              className="nise-explorer__btn nise-explorer__btn--primary"
              onClick={() => setReviewOpen(true)}
            >
              Review &amp; export
            </button>
          </div>
        </header>

        <main className="nise-explorer__main">
          <Sidebar pageId={pageId} onSelect={setPageId} />
          {showPanel ? (
            <div className="nise-explorer__panelwrap">
              <p className="nise-explorer__hint">
                Changes preview live and are saved as a local draft. They do not touch the token
                source until you promote a candidate.
              </p>
              <TokenPanel
                overrides={overrides}
                onChange={setOverride}
                onReset={resetToken}
                tab={tab}
              />
            </div>
          ) : null}
          <Preview overrides={overrides} mode={mode} onModeChange={setMode} pageId={pageId} />
        </main>

        <ReviewPanel
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          overrides={overrides}
          onImport={replaceAll}
          mode={mode}
        />
      </div>
    </TooltipProvider>
  );
}
