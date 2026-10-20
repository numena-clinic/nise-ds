// The review step. Before anything can be promoted, the change set is shown in
// full: what changed and what follows from it, whether the brand's contrast
// promises still hold under the experimental values, and the exact candidate
// JSON. The candidate can be copied or downloaded; a saved candidate can be
// loaded back in. Promotion itself is deliberately NOT a button here — a browser
// tab must not write source files — so the panel prints the local command that
// does it (`npm run theme:apply`, dry-run by default).
//
// The pass/fail marks follow the brand: never a colour verdict (color.md §4), so
// a failure is an icon + the word, on a heavier boundary.

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertIcon, CheckIcon } from "../../icons";
import {
  resolveContrast,
  diffRows,
  serializeCandidate,
  candidateToJson,
  candidateDrift,
  parseCandidate,
  overridesFromCandidate,
  changeCount,
  type Overrides,
  type ThemeMode,
} from "../theme/theme";

interface Props {
  open: boolean;
  onClose: () => void;
  overrides: Overrides;
  onImport: (o: Overrides) => void;
  /** The theme the preview is showing — the contrast promises are re-checked
   * against this mapping, and the panel says which one it was. */
  mode: ThemeMode;
}

export function ReviewPanel({ open, onClose, overrides, onImport, mode }: Props) {
  const [paste, setPaste] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const diff = useMemo(() => diffRows(overrides), [overrides]);
  const contrast = useMemo(() => resolveContrast(overrides, mode), [overrides, mode]);
  const candidate = useMemo(() => serializeCandidate(overrides), [overrides]);
  const json = useMemo(() => candidateToJson(candidate), [candidate]);
  const drift = useMemo(() => candidateDrift(candidate), [candidate]);
  const failures = contrast.filter((c) => !c.pass);

  useEffect(() => {
    if (open) headingRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const load = (text: string) => {
    const res = parseCandidate(text);
    setErrors(res.errors);
    if (res.candidate) {
      const warn = candidateDrift(res.candidate);
      onImport(overridesFromCandidate(res.candidate));
      setNotice(
        warn.length
          ? `Loaded ${res.candidate.tokens.length} token(s). ${warn.length} drift warning(s) below.`
          : `Loaded ${res.candidate.tokens.length} token(s).`,
      );
      setErrors(warn);
    } else {
      setNotice(null);
    }
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    file.text().then(load);
  };

  const download = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "theme-candidate.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = () => {
    navigator.clipboard?.writeText(json).then(
      () => setNotice("Candidate JSON copied."),
      () => setNotice("Copy failed — select the text and copy manually."),
    );
  };

  return (
    <aside
      className="nise-explorer__review"
      role="dialog"
      aria-modal="false"
      aria-labelledby="review-title"
    >
      <header className="nise-explorer__review-head">
        <h2 id="review-title" className="nise-explorer__review-title" tabIndex={-1} ref={headingRef}>
          Review &amp; export
        </h2>
        <button type="button" className="nise-explorer__btn" onClick={onClose} aria-label="Close review">
          Close
        </button>
      </header>

      <p className="nise-explorer__hint" aria-live="polite">
        {changeCount(overrides)} token{changeCount(overrides) === 1 ? "" : "s"} changed.
        {notice ? ` ${notice}` : ""}
      </p>

      {diff.length === 0 ? (
        <p className="nise-explorer__empty">
          No changes yet. Edit a token on the left and the diff appears here.
        </p>
      ) : (
        <table className="nise-explorer__diff">
          <caption className="nise-explorer__visually-hidden">Changed tokens</caption>
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th scope="col">From</th>
              <th scope="col">To</th>
              <th scope="col">Follows</th>
            </tr>
          </thead>
          <tbody>
            {diff.map((d) => (
              <tr key={d.name}>
                <th scope="row">{d.name.replace(/^--/, "")}</th>
                <td>
                  <code>{d.from}</code>
                </td>
                <td>
                  <code>{d.to}</code>
                </td>
                <td>
                  <span className="nise-explorer__diff-count">
                    {d.direct.length} direct · {d.dependents.length} total
                  </span>
                  {d.dependents.length > 0 ? (
                    <span className="nise-explorer__diff-names">
                      {d.dependents.slice(0, 5).map((n) => n.replace(/^--/, "")).join(", ")}
                      {d.dependents.length > 5 ? ` +${d.dependents.length - 5} more` : ""}
                    </span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <section className="nise-explorer__review-block" aria-labelledby="review-contrast">
        <h3 id="review-contrast" className="nise-explorer__review-subtitle">
          Contrast promises
          <span className="nise-explorer__review-note"> · {mode} mapping</span>
        </h3>
        {failures.length === 0 ? (
          <p className="nise-explorer__ok">
            <CheckIcon size={16} aria-hidden="true" /> All {contrast.length} promises hold.
          </p>
        ) : (
          <p className="nise-explorer__fail">
            <AlertIcon size={16} aria-hidden="true" /> {failures.length} of {contrast.length} promises
            fail.
          </p>
        )}
        <ul className="nise-explorer__contrast-list">
          {contrast.map((c) => (
            <li key={`${c.fg}-${c.bg}`} className="nise-explorer__contrast-row" data-fail={!c.pass}>
              <span className="nise-explorer__contrast-mark" aria-hidden="true">
                {c.pass ? <CheckIcon size={16} /> : <AlertIcon size={16} />}
              </span>
              <span className="nise-explorer__contrast-ratio">
                {c.ratio.toFixed(2)}:1 <span className="nise-explorer__contrast-min">(min {c.min})</span>
              </span>
              <span className="nise-explorer__contrast-why">
                {c.why}
                {!c.pass ? <span className="nise-explorer__contrast-flag"> — fails</span> : null}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="nise-explorer__review-block" aria-labelledby="review-json">
        <h3 id="review-json" className="nise-explorer__review-subtitle">
          Candidate (nise.theme-candidate v1)
        </h3>
        <pre className="nise-explorer__json" tabIndex={0}>
          {json}
        </pre>
        <div className="nise-explorer__review-actions">
          <button type="button" className="nise-explorer__btn" onClick={copy}>
            Copy JSON
          </button>
          <button type="button" className="nise-explorer__btn" onClick={download}>
            Download
          </button>
        </div>
      </section>

      <section className="nise-explorer__review-block" aria-labelledby="review-import">
        <h3 id="review-import" className="nise-explorer__review-subtitle">
          Import a candidate
        </h3>
        <input
          className="nise-explorer__input"
          type="file"
          accept="application/json,.json"
          aria-label="Choose a candidate JSON file"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <textarea
          className="nise-explorer__textarea"
          placeholder="…or paste candidate JSON here"
          aria-label="Paste candidate JSON"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={4}
        />
        <button type="button" className="nise-explorer__btn" onClick={() => load(paste)} disabled={!paste.trim()}>
          Load pasted JSON
        </button>
        {errors.length > 0 ? (
          <ul className="nise-explorer__errors">
            {errors.map((e) => (
              <li key={e}>
                <AlertIcon size={16} aria-hidden="true" /> {e}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="nise-explorer__review-block" aria-labelledby="review-apply">
        <h3 id="review-apply" className="nise-explorer__review-subtitle">
          Promote locally
        </h3>
        <p className="nise-explorer__hint">
          A browser tab cannot write the token source. Save the candidate, then run:
        </p>
        <pre className="nise-explorer__json">npm run theme:apply -- theme-candidate.json</pre>
        <p className="nise-explorer__hint">
          That is a dry run. Add <code>--write</code> to apply, rebuild and validate. It never commits.
        </p>
        {drift.length > 0 ? (
          <ul className="nise-explorer__errors">
            {drift.map((d) => (
              <li key={d}>
                <AlertIcon size={16} aria-hidden="true" /> drift: {d}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </aside>
  );
}
