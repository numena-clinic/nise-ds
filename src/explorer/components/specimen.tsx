// Shared specimen layout pieces for the explorer's preview pages.
//
// A Block is one documented unit (a component family or a pattern) with its
// related tokens listed in the header; Cells are the side-by-side stages; Rows
// and Columns arrange Cells. Everything a page renders is a real Nise
// component — no second component stack.

import type { ReactNode } from "react";

export interface BlockProps {
  id: string;
  title: string;
  note?: string;
  tokens?: string[];
  children: ReactNode;
}

export function Block({ id, title, note, tokens, children }: BlockProps) {
  return (
    <section className="nise-catalogue__block" aria-labelledby={`cat-${id}`}>
      <header className="nise-catalogue__block-head">
        <div className="nise-catalogue__block-heading">
          <h3 id={`cat-${id}`} className="nise-catalogue__block-title">
            {title}
          </h3>
          {note ? <p className="nise-catalogue__block-note">{note}</p> : null}
        </div>
        {tokens && tokens.length ? (
          <ul className="nise-catalogue__tokens" aria-label="Related tokens">
            {tokens.map((name) => (
              <li key={name} className="nise-catalogue__token">
                <span className="nise-catalogue__token-name">{name}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </header>
      <div className="nise-catalogue__block-body">{children}</div>
    </section>
  );
}

export function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="nise-catalogue__cell">
      <div className="nise-catalogue__cell-stage">{children}</div>
      <figcaption className="nise-catalogue__cell-label">{label}</figcaption>
    </figure>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <div className="nise-catalogue__row">{children}</div>;
}

export function Column({ children }: { children: ReactNode }) {
  return <div className="nise-catalogue__column">{children}</div>;
}
