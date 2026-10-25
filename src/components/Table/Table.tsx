/* =============================================================================
   Table
   -----------------------------------------------------------------------------
   A plain, readable table for small datasets (the reference compositions don't
   need a data grid). It uses `<table>` semantics and accepts `header` and
   `rows` — no new colors, just structure. The header is visually distinct only
   by text weight/color, not by a verdict color.

   Tokens consumed: --table-cell-padding-x, --table-cell-padding-y,
   --table-font-size, --table-header-font-size, plus surface/border/text tokens.
   ============================================================================= */

import type { ReactNode } from "react";
import "./Table.css";

export interface TableRow {
  key?: string | number;
  cells: ReactNode[];
}

export interface TableProps {
  header: ReactNode[];
  rows: TableRow[];
  caption?: ReactNode;
  className?: string;
}

export function Table({ header, rows, caption, className }: TableProps) {
  const classes = ["nise-table__container", className].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      <table className="nise-table">
        {caption ? <caption className="nise-table__caption">{caption}</caption> : null}
        <thead>
          <tr className="nise-table__row nise-table__row--header">
            {header.map((h, i) => (
              <th key={i} scope="col" className="nise-table__cell nise-table__cell--header">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={row.key ?? r} className="nise-table__row">
              {row.cells.map((c, i) => {
                const isNumeric = typeof c === "number";
                return (
                  <td key={i} className={`nise-table__cell${isNumeric ? " nise-table__cell--numeric" : ""}`}>
                    {c}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
